/* ===== Mídia nos slides: imagem do computador e vídeo (link ou arquivo) ===== */
function videoEmbed(u) {
  u = String(u || '').trim(); let m;
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/))) return {kind: 'iframe', src: 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0', host: 'YouTube', open: 'https://www.youtube.com/watch?v=' + m[1]};
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return {kind: 'iframe', src: 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1', host: 'Vimeo', open: 'https://vimeo.com/' + m[1]};
  if (!/^https?:\/\//i.test(u)) return null;
  let host = ''; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return null; }
  if (/\.(mp4|webm|ogv|mov|m4v)(\?|#|$)/i.test(u)) return {kind: 'file', src: u, host, open: u};
  return {kind: 'iframe', src: u, host, open: u};
}
function dzPickFile(accept, cb) { const f = document.createElement('input'); f.type = 'file'; f.accept = accept; f.onchange = () => { const file = f.files[0]; if (file) cb(file); }; f.click(); }

/* imagem do computador: já entra com a proporção da imagem, centralizada */
function dzAddImage() {
  dzPickFile('image/*', async file => {
    let bmp; try { bmp = await createImageBitmap(file); } catch (e) { toast('Não consegui ler essa imagem. Use PNG, JPG, WebP ou GIF.'); return; }
    const id = uid('img'); await imgPut(id, file); IMGS.set(id, bmp);
    const f = dzSet().format, r = bmp.width / bmp.height; let w = Math.min(f.w * 0.7, bmp.width), h = w / r; if (h > f.h * 0.7) { h = f.h * 0.7; w = h * r; }
    const L = IM('photo', {x: Math.round((f.w - w) / 2), y: Math.round((f.h - h) / 2), w: Math.round(w), h: Math.round(h), imgId: id, radius: 0}); L.role = 'image'; L.name = file.name;
    dzSlide().layers.push(L); dz.sel = L.id; dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel(); toast('Imagem inserida. Arraste, use as alças dos cantos para redimensionar.');
  });
}

/* vídeo: link (YouTube, Vimeo, .mp4) ou arquivo do computador */
let VD_FILE = null;
function dzAddVideo() {
  VD_FILE = null;
  showModal('Inserir vídeo', `<div class="field"><label>Link do vídeo (YouTube, Vimeo ou arquivo .mp4)</label><input id="vdUrl" placeholder="https://www.youtube.com/watch?v=…"></div>
  <div class="field"><label>…ou envie um arquivo do computador</label><button class="btn sm" onclick="dzVideoFile()">Escolher arquivo de vídeo</button> <small class="muted" id="vdFile">Nenhum arquivo</small></div>
  <div class="field"><label>Título (aparece no slide)</label><input id="vdName" placeholder="Ex.: Depoimento do cliente"></div>
  <small class="muted block">Na apresentação em HTML, clicar no vídeo abre em tela cheia; ao fechar você volta ao slide. Arquivos de até 12 MB são embutidos no HTML baixado; maiores funcionam só por link.</small>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="dzVideoAdd()">Inserir</button></div>`);
}
function dzVideoFile() { dzPickFile('video/*', file => { VD_FILE = file; $('vdFile').textContent = file.name + ' · ' + (file.size / 1048576).toFixed(1) + ' MB'; }); }
async function dzVideoAdd() {
  const url = $('vdUrl').value.trim(), name = $('vdName').value.trim();
  if (!url && !VD_FILE) { toast('Cole um link ou escolha um arquivo.'); return; }
  if (url && !videoEmbed(url)) { toast('Link inválido. Use um endereço que comece com http:// ou https://'); return; }
  let fileId = ''; if (VD_FILE) { fileId = uid('vid'); await imgPut(fileId, VD_FILE); }
  const f = dzSet().format, w = Math.round(f.w * 0.5), h = Math.round(w * 9 / 16), off = 40 * dzSlide().layers.filter(l => l.type === 'video').length;
  const L = {id: lid(), type: 'video', role: 'video', x: Math.round((f.w - w) / 2) + off, y: Math.round((f.h - h) / 2) + off, w, h, url: fileId ? '' : url, fileId, fileName: VD_FILE ? VD_FILE.name : '', name: name || (VD_FILE ? VD_FILE.name : (videoEmbed(url) || {}).host || 'Vídeo'), opacity: 1};
  VD_FILE = null; closeModal(); dzSlide().layers.push(L); dz.sel = L.id; dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel();
}
function dzVideoInspector(L, geo, acts) {
  return `<h3>Vídeo</h3><label class="ins">Link<input value="${esc(L.url || '')}" placeholder="https://…" onchange="dzProp('url',this.value.trim());dzInspector()"></label>
  <label class="ins">Título<input value="${esc(L.name || '')}" onchange="dzProp('name',this.value)"></label>
  <div class="row-gap" style="margin:6px 0"><button class="btn sm" onclick="dzVideoSwap()">${L.fileId ? 'Trocar arquivo' : 'Usar arquivo'}</button>${L.fileId ? '<button class="btn sm" onclick="dzProp(\'fileId\',\'\');dzProp(\'fileName\',\'\');dzInspector()">Remover arquivo</button>' : ''}</div>
  <small class="muted block">${L.fileId ? 'Arquivo: ' + esc(L.fileName || '') : 'Cole um link do YouTube, Vimeo ou .mp4.'} Na apresentação, clicar abre em tela cheia.</small>${geo}${acts}`;
}
function dzVideoSwap() { dzPickFile('video/*', async file => { const id = uid('vid'); await imgPut(id, file); const L = dzLayer(); L.fileId = id; L.fileName = file.name; L.url = ''; if (!L.name || L.name === 'Vídeo') L.name = file.name; dzDraw(); dzCommit(); dzInspector(); }); }

/* pontos clicáveis de cada slide para a apresentação em HTML */
async function deckHotspots(set) {
  const f = set.format, out = [], warn = [];
  for (const sl of set.slides) {
    const hs = [];
    for (const L of sl.layers) {
      if (L.type !== 'video' || L.hidden) continue;
      const box = {x: L.x / f.w, y: L.y / f.h, w: L.w / f.w, h: L.h / f.h, title: L.name || 'Vídeo'};
      if (L.fileId) {
        const b = await imgGet(L.fileId);
        if (!b) { warn.push(L.name); continue; }
        if (b.size > 12 * 1048576) { warn.push((L.name || 'vídeo') + ' (arquivo grande: use um link)'); continue; }
        hs.push(Object.assign(box, {kind: 'file', src: await blobToDataURL(b)}));
      } else { const e = videoEmbed(L.url); if (e) hs.push(Object.assign(box, {kind: e.kind, src: e.src, open: e.open})); else warn.push((L.name || 'vídeo') + ' (sem link)'); }
    }
    out.push(hs);
  }
  return {hot: out, warn};
}
