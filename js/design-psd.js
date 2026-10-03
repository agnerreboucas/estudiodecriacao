/* Exportação em camadas: PSD (uma camada raster por elemento, empilhadas como no editor) e ZIP de PNGs com manifesto.
   Limites: o texto vai como camada raster (não editável como texto no Photoshop) e as fontes não são embutidas. */
class BW {
  constructor() { this.p = []; this.n = 0; }
  b(u8) { this.p.push(u8); this.n += u8.length; return this; }
  num(size, fn, v) { const d = new DataView(new ArrayBuffer(size)); fn.call(d, 0, v); return this.b(new Uint8Array(d.buffer)); }
  u8(v) { return this.b(Uint8Array.of(v & 255)); }
  u16(v) { return this.num(2, DataView.prototype.setUint16, v); }
  i16(v) { return this.num(2, DataView.prototype.setInt16, v); }
  u32(v) { return this.num(4, DataView.prototype.setUint32, v); }
  i32(v) { return this.num(4, DataView.prototype.setInt32, v); }
  str(s) { return this.b(Uint8Array.from(s, c => c.charCodeAt(0) & 255)); }
  pad(m) { while (this.n % m) this.u8(0); return this; }
  bytes() { const o = new Uint8Array(this.n); let k = 0; this.p.forEach(x => { o.set(x, k); k += x.length; }); return o; }
}
/* compressão RLE (PackBits) usada pelo formato PSD, linha a linha */
function packBits(src) {
  const out = new Uint8Array(src.length * 2 + 2); let o = 0, i = 0; const n = src.length;
  while (i < n) {
    let j = i + 1; while (j < n && j - i < 128 && src[j] === src[i]) j++;
    if (j - i >= 2) { out[o++] = 257 - (j - i); out[o++] = src[i]; i = j; }
    else { let k = i + 1; while (k < n && k - i < 128 && !(k + 1 < n && src[k] === src[k + 1])) k++; out[o++] = k - i - 1; out.set(src.subarray(i, k), o); o += k - i; i = k; }
  }
  return out.subarray(0, o);
}
function packPlane(plane, w, h) { const rows = []; let total = 0; for (let y = 0; y < h; y++) { const r = packBits(plane.subarray(y * w, (y + 1) * w)); rows.push(r); total += r.length; } return {rows, total}; }
const ROLE_NAME = {title: 'Título', body: 'Texto', kicker: 'Chamada', 'cta-text': 'Texto do botão', 'cta-fill': 'Botão', 'accent-fill': 'Destaque', photo: 'Foto', overlay: 'Película', brand: 'Marca', muted: 'Apoio', panel: 'Painel'};
function layerName(L) {
  const base = ROLE_NAME[L.role] || (L.type === 'text' ? 'Texto' : L.type === 'image' ? 'Foto' : 'Forma');
  return L.type === 'text' ? `${base}: ${String(L.content).replace(/\*\*/g, '').replace(/\s+/g, ' ').slice(0, 24)}` : base;
}
function renderLayerData(L, box) {
  const c = document.createElement('canvas'); c.width = box.w; c.height = box.h; const ctx = c.getContext('2d'); ctx.translate(-box.x, -box.y);
  drawLayer(ctx, L);
  return {canvas: c, data: ctx.getImageData(0, 0, box.w, box.h).data};
}
/* camadas de baixo para cima, cada uma recortada na sua caixa */
async function collectLayerItems(set, slide) {
  await ensureSetResources(set);
  const W = set.format.w, H = set.format.h, comp = document.createElement('canvas'); comp.width = W; comp.height = H;
  const cctx = comp.getContext('2d'); renderSlide(cctx, slide, W, H, 1);
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H; const bx = bg.getContext('2d'); bx.fillStyle = slide.bg || '#ffffff'; bx.fillRect(0, 0, W, H);
  const items = [{name: 'Fundo', role: 'bg', type: 'rect', box: {x: 0, y: 0, w: W, h: H}, canvas: bg, data: bx.getImageData(0, 0, W, H).data}];
  for (const L of slide.layers) {
    if (L.hidden || !LBOX[L.id]) continue; const b = LBOX[L.id], pad = L.type === 'text' ? Math.ceil(L.size * 0.3) + 10 : 0;
    const x = Math.max(0, Math.floor(b.x - pad)), y = Math.max(0, Math.floor(b.y - pad)), x2 = Math.min(W, Math.ceil(b.x + b.w + pad)), y2 = Math.min(H, Math.ceil(b.y + b.h + pad));
    const box = L.rot || L.blur ? {x: 0, y: 0, w: W, h: H} : {x, y, w: x2 - x, h: y2 - y}; if (box.w < 1 || box.h < 1) continue;
    const r = renderLayerData(L, box); items.push({name: layerName(L), role: L.role, type: L.type, text: L.type === 'text' ? L.content.replace(/\*\*/g, '') : '', box, canvas: r.canvas, data: r.data});
  }
  return {items, comp: cctx.getImageData(0, 0, W, H).data, W, H};
}
const pascal = name => { const s = Array.from(name.normalize('NFC').slice(0, 31)).map(ch => ch.charCodeAt(0) < 256 ? ch.charCodeAt(0) : 63); const w = new BW(); w.u8(s.length).b(Uint8Array.from(s)).pad(4); return w.bytes(); };
const uniBlock = name => { const w = new BW(), u = name.slice(0, 63); w.u32(u.length); for (let i = 0; i < u.length; i++) w.u16(u.charCodeAt(i)); const d = w.bytes(), o = new BW(); o.str('8BIM').str('luni').u32(d.length).b(d); o.pad(2); return o.bytes(); };

async function buildPSD(set, slide) {
  const {items, comp, W, H} = await collectLayerItems(set, slide), rec = new BW(), chan = new BW(), ids = [0, 1, 2, -1];
  items.forEach(it => {
    const {x, y, w, h} = it.box;
    const packed = ids.map(id => { const plane = new Uint8Array(w * h), off = id === -1 ? 3 : id; for (let i = 0, j = off; i < w * h; i++, j += 4) plane[i] = it.data[j]; return packPlane(plane, w, h); });
    rec.i32(y).i32(x).i32(y + h).i32(x + w).u16(4); ids.forEach((id, k) => rec.i16(id).u32(2 + 2 * h + packed[k].total));
    rec.str('8BIM').str('norm').u8(255).u8(0).u8(0).u8(0);
    const extra = new BW(); extra.u32(0).u32(0).b(pascal(it.name)).b(uniBlock(it.name)); rec.u32(extra.n).b(extra.bytes());
    packed.forEach(pk => { chan.u16(1); pk.rows.forEach(r => chan.u16(r.length)); pk.rows.forEach(r => chan.b(r)); });
  });
  const info = new BW(); info.i16(items.length).b(rec.bytes()).b(chan.bytes()).pad(2);
  const lm = new BW(); lm.u32(info.n).b(info.bytes()).u32(0);
  const f = new BW();
  f.str('8BPS').u16(1).b(new Uint8Array(6)).u16(3).u32(H).u32(W).u16(8).u16(3);   // cabeçalho: RGB, 8 bits
  f.u32(0).u32(0);                                                                  // dados de cor e recursos de imagem (vazios)
  f.u32(lm.n).b(lm.bytes());                                                        // camadas
  const mp = [0, 1, 2].map(c => { const plane = new Uint8Array(W * H); for (let i = 0, j = c; i < W * H; i++, j += 4) plane[i] = comp[j]; return packPlane(plane, W, H); });
  f.u16(1); mp.forEach(pk => pk.rows.forEach(r => f.u16(r.length))); mp.forEach(pk => pk.rows.forEach(r => f.b(r)));   // imagem composta (RLE)
  return new Blob([f.bytes()], {type: 'image/vnd.adobe.photoshop'});
}
async function buildLayersZip(set, slide) {
  const {items, comp, W, H} = await collectLayerItems(set, slide), files = [], manifest = [];
  const full = document.createElement('canvas'); full.width = W; full.height = H; full.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(comp), W, H), 0, 0);
  files.push({name: 'composicao.png', data: new Uint8Array(await (await new Promise(r => full.toBlob(r, 'image/png'))).arrayBuffer())});
  for (let i = 0; i < items.length; i++) {
    const it = items[i], fn = `camadas/${String(i).padStart(2, '0')}-${slug(it.name) || 'camada'}.png`;
    files.push({name: fn, data: new Uint8Array(await (await new Promise(r => it.canvas.toBlob(r, 'image/png'))).arrayBuffer())});
    manifest.push({ordem: i, nome: it.name, tipo: it.type, papel: it.role, x: it.box.x, y: it.box.y, largura: it.box.w, altura: it.box.h, texto: it.text || undefined, arquivo: fn});
  }
  files.push({name: 'manifesto.json', data: new TextEncoder().encode(JSON.stringify({largura: W, altura: H, camadas: manifest}, null, 2))});
  return makeZip(files);
}
