/* ===== Mesa de páginas · Aula =====
   Novos elementos (Carrossel, Antes e depois, Pergunta que revela a resposta, Passo), 16 blocos "Aula · …",
   3 modelos de página de Aula e a navegação de aula por página (horizontal, vertical ou mapa com zoom).
   Tudo sem biblioteca externa: o CSS e o JS pequenos vão dentro de todo HTML gerado (MZ_EXT.css e MZ_EXT.js em mz-core.js).
   Os elementos usam só marcação simples e atributos fixos (nada vindo do usuário vira script): textos são escapados e links passam por MZ_URL. */
(function () {
  const names = {carousel: 'Carrossel', beforeafter: 'Antes e depois', reveal: 'Pergunta que revela a resposta', step: 'Passo'};
  Object.keys(names).forEach(t => { if (!MZ_LEAF.includes(t)) { MZ_LEAF.push(t); MZ_TYPES.push(t); } MZ_NAMES[t] = names[t]; });
  MZ_TYPO_DEFAULT.step = 'body'; MZ_TYPO_DEFAULT.reveal = 'body';
  const RATIOS = {'16/9': 'ar169', '4/3': 'ar43', '1/1': 'ar11', '3/4': 'ar34', '21/9': 'ar219'}, ratio = r => RATIOS[r] ? r : '16/9';
  const E = mzEsc, br = s => E(s).replace(/\n/g, '<br>');
  const imgTag = (x, id, src, alt, i) => { const u = id ? x.img(id) : src; return u ? `<img src="${E(u)}" alt="${E(alt)}" ${x.ed ? 'draggable="false"' : 'loading="lazy"'}>` : `<span class="mz-ph">Imagem ${i || ''}</span>`; };

  /* ---------- Carrossel ---------- */
  MZ_EXT.types.carousel = {
    norm: (p, h) => ({slides: h.items(p.slides, s => (s && typeof s === 'object') ? {imgId: h.id(s.imgId), src: h.url(s.src), cap: h.S(s.cap, 200), href: h.url(s.href)} : null, 20), ratio: ratio(p.ratio), auto: [0, 3, 5, 8].includes(+p.auto) ? +p.auto : 0, dots: p.dots !== false, fit: p.fit === 'contain' ? 'contain' : 'cover'}),
    html: (n, x) => {
      const P = x.P, ed = x.ed, sl = P.slides.map((s, i) => { const im = imgTag(x, s.imgId, s.src, s.cap, i + 1); return `<figure class="mz-car-s">${s.href && !ed ? `<a href="${E(x.lk(s.href))}">${im}</a>` : im}${s.cap ? `<figcaption>${E(s.cap)}</figcaption>` : ''}</figure>`; }).join('') || '<figure class="mz-car-s"><span class="mz-ph">Carrossel: adicione imagens</span></figure>';
      const go = d => `var t=this.parentNode.querySelector('.mz-car-t');t.scrollBy({left:${d}*t.clientWidth,behavior:'smooth'})`;
      const btns = ed ? '<button type="button" class="mz-car-p" tabindex="-1">‹</button><button type="button" class="mz-car-n" tabindex="-1">›</button>' : `<button type="button" class="mz-car-p" aria-label="Anterior" onclick="${go(-1)}">‹</button><button type="button" class="mz-car-n" aria-label="Próximo" onclick="${go(1)}">›</button>`;
      const dots = P.dots !== false && P.slides.length > 1 ? `<div class="mz-car-d">${P.slides.map((s, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" aria-label="Slide ${i + 1}"${ed ? ' tabindex="-1"' : ` onclick="var t=this.closest('.mz-car').querySelector('.mz-car-t');t.scrollTo({left:${i}*t.clientWidth,behavior:'smooth'})"`}></button>`).join('')}</div>` : '';
      return `<div class="${x.cls.join(' ')} mz-car ${RATIOS[P.ratio]} fit-${P.fit}" ${x.at.join(' ')} data-auto="${ed ? 0 : P.auto}"><div class="mz-car-t">${sl}</div>${P.slides.length > 1 ? btns : ''}${dots}</div>`;
    }
  };
  /* ---------- Antes e depois ---------- */
  MZ_EXT.types.beforeafter = {
    norm: (p, h) => ({bImg: h.id(p.bImg), bSrc: h.url(p.bSrc), aImg: h.id(p.aImg), aSrc: h.url(p.aSrc), bLab: h.S(p.bLab, 30) || 'Antes', aLab: h.S(p.aLab, 30) || 'Depois', start: Math.max(0, Math.min(100, Math.round(+p.start) || 50)), ratio: ratio(p.ratio)}),
    html: (n, x) => {
      const P = x.P, ed = x.ed, side = (cl, id, src, alt) => { const u = id ? x.img(id) : src; return u ? `<img class="${cl}" src="${E(u)}" alt="${E(alt)}" ${ed ? 'draggable="false"' : 'loading="lazy"'}>` : `<span class="mz-ph ${cl}">${E(alt)}</span>`; };
      return `<div class="${x.cls.join(' ')} mz-ba ${RATIOS[P.ratio]}" ${x.at.join(' ')}><div class="mz-ba-in" style="--mz-p:${P.start}%">${side('mz-ba-a', P.aImg, P.aSrc, P.aLab)}${side('mz-ba-b', P.bImg, P.bSrc, P.bLab)}<span class="mz-ba-l mz-ba-l1">${E(P.bLab)}</span><span class="mz-ba-l mz-ba-l2">${E(P.aLab)}</span><i class="mz-ba-h"></i>${ed ? '' : `<input type="range" min="0" max="100" value="${P.start}" aria-label="Arraste para comparar ${E(P.bLab)} e ${E(P.aLab)}" oninput="this.parentNode.style.setProperty('--mz-p',this.value+'%')">`}</div></div>`;
    }
  };
  /* ---------- Pergunta que revela a resposta ---------- */
  MZ_EXT.types.reveal = {
    norm: (p, h) => ({q: h.S(p.q, 400), a: h.S(p.a, 2000), btn: h.S(p.btn, 40) || 'Ver a resposta', btn2: h.S(p.btn2, 40) || 'Esconder a resposta'}),
    html: (n, x) => { const P = x.P, ed = x.ed; return `<div class="${x.cls.join(' ')} mz-rv" ${x.at.join(' ')}><div class="mz-rv-q">${br(P.q)}</div><div class="mz-rv-a"${ed ? '' : ' hidden'}>${br(P.a)}</div><button type="button" class="mz-rv-b" data-show="${E(P.btn)}" data-hide="${E(P.btn2)}"${ed ? ' tabindex="-1"' : ` onclick="var a=this.parentNode.querySelector('.mz-rv-a');a.hidden=!a.hidden;this.textContent=a.hidden?this.getAttribute('data-show'):this.getAttribute('data-hide')"`}>${E(ed ? P.btn2 : P.btn)}</button></div>`; }
  };
  /* ---------- Passo ---------- */
  MZ_EXT.types.step = {
    norm: (p, h) => ({num: h.S(p.num, 8), title: h.S(p.title, 200), text: h.S(p.text, 800)}),
    html: (n, x) => { const P = x.P; return `<div class="${x.cls.join(' ')} mz-st" ${x.at.join(' ')}><span class="mz-st-n">${E(P.num)}</span><div class="mz-st-b"><div class="mz-st-t">${E(P.title)}</div>${P.text ? `<p>${br(P.text)}</p>` : ''}</div></div>`; }
  };

  /* ---------- CSS e JS que vão em todo HTML ---------- */
  MZ_EXT.css += `.mz-car{position:relative;width:100%}.mz-car-t{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:inherit;scroll-behavior:smooth}.mz-car-t::-webkit-scrollbar{display:none}.mz-car-s{flex:0 0 100%;scroll-snap-align:start;margin:0;position:relative;overflow:hidden;aspect-ratio:16/9;border-radius:inherit}.mz-car.ar43 .mz-car-s{aspect-ratio:4/3}.mz-car.ar11 .mz-car-s{aspect-ratio:1/1}.mz-car.ar34 .mz-car-s{aspect-ratio:3/4}.mz-car.ar219 .mz-car-s{aspect-ratio:21/9}.mz-car-s img{width:100%;height:100%;object-fit:cover;display:block}.mz-car.fit-contain .mz-car-s img{object-fit:contain}.mz-car-s .mz-ph{height:100%;border-radius:0}.mz-car-s a{display:block;height:100%}
.mz-car figcaption{position:absolute;left:0;right:0;bottom:0;padding:28px 18px 14px;background:linear-gradient(transparent,rgba(0,0,0,.65));color:#fff;font-size:15px}.mz-car-p,.mz-car-n{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:#111;font-size:26px;line-height:1;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.25)}.mz-car-p{left:10px}.mz-car-n{right:10px}.mz-car-d{display:flex;justify-content:center;gap:8px;margin-top:10px}.mz-car-d button{width:10px;height:10px;border-radius:50%;border:0;padding:0;background:var(--mz-bc,#ccc);cursor:pointer}.mz-car-d button.on{background:var(--mz-c-accent,#e4572e)}
.mz-ba{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:var(--mz-r-md,12px)}.mz-ba.ar43{aspect-ratio:4/3}.mz-ba.ar11{aspect-ratio:1/1}.mz-ba.ar34{aspect-ratio:3/4}.mz-ba.ar219{aspect-ratio:21/9}.mz-ba-in{position:absolute;inset:0;--mz-p:50%}.mz-ba-a,.mz-ba-b{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}.mz-ba-b{clip-path:inset(0 calc(100% - var(--mz-p)) 0 0)}.mz-ba .mz-ph{border-radius:0;min-height:0}.mz-ba-l{position:absolute;top:12px;padding:4px 12px;border-radius:99px;background:rgba(0,0,0,.6);color:#fff;font-size:13px;font-weight:700}.mz-ba-l1{left:12px}.mz-ba-l2{right:12px}.mz-ba-h{position:absolute;top:0;bottom:0;left:var(--mz-p);width:3px;margin-left:-1.5px;background:#fff;box-shadow:0 0 8px rgba(0,0,0,.4)}.mz-ba-h::after{content:"↔";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;background:#fff;color:#111;display:grid;place-items:center;font-size:18px;box-shadow:0 2px 10px rgba(0,0,0,.35)}.mz-ba input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}
.mz-rv{border:var(--mz-bw,1px) solid var(--mz-bc,#e4e4ea);border-radius:var(--mz-r-md,12px);padding:20px 22px;display:flex;flex-direction:column;gap:12px;align-items:flex-start;background:rgba(0,0,0,.02)}.mz-rv-q{font-weight:700;font-size:1.15em}.mz-rv-a{color:var(--mz-c-text);padding:12px 14px;border-left:4px solid var(--mz-c-accent,#e4572e);background:rgba(0,0,0,.04);border-radius:6px;width:100%}.mz-rv-a[hidden]{display:none}.mz-rv-b{font:inherit;font-weight:700;padding:9px 18px;border-radius:99px;border:2px solid var(--mz-c-primary,#111);background:transparent;color:var(--mz-c-primary,#111);cursor:pointer}
.mz-st{display:flex;gap:16px;align-items:flex-start}.mz-st-n{flex:none;width:44px;height:44px;border-radius:50%;background:var(--mz-c-accent,#e4572e);color:#fff;display:grid;place-items:center;font-weight:800;font-size:18px}.mz-st-t{font-weight:700;font-size:1.2em;line-height:1.25}.mz-st-b p{margin:6px 0 0;color:var(--mz-c-muted,#6b7280)}
.mz-nv{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:10px;background:rgba(17,17,17,.82);color:#fff;border-radius:99px;padding:6px 12px;font:600 13px system-ui,sans-serif}.mz-nv button{border:0;background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:2px 8px}.mz-nv button.mz-nv-m{font-size:13px;font-weight:700;border-left:1px solid rgba(255,255,255,.3);padding-left:12px}.mz-nv-d{display:flex;gap:6px;max-width:50vw;overflow:hidden}.mz-nv-d i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.35);cursor:pointer;display:block;flex:none}.mz-nv-d i.on{background:#fff;transform:scale(1.25)}
.mz-lk{position:relative}.mz-lk-a{position:absolute;inset:0;z-index:3}
body[data-nav]{overflow:hidden;height:100vh}body[data-nav] .mz-page{min-height:0;height:100vh;width:100%}
body[data-nav=h] .mz-page{display:flex!important;flex-direction:row!important;gap:0!important;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth}body[data-nav=h] .mz-page>*{flex:0 0 100vw!important;width:100vw!important;height:100vh;min-height:0!important;overflow-y:auto;scroll-snap-align:start}
body[data-nav=v] .mz-page{display:block!important;overflow-y:auto;scroll-snap-type:y mandatory;scroll-behavior:smooth}body[data-nav=v] .mz-page>*{min-height:100vh;scroll-snap-align:start}
body[data-nav=map] .mz-page{overflow:hidden;position:relative}.mz-map{position:absolute;left:0;top:0;transform-origin:0 0;transition:transform .85s cubic-bezier(.65,0,.25,1);will-change:transform}.mz-map>.mz-e,.mz-map>section,.mz-map>div{position:absolute;overflow:auto;background:var(--mz-c-background);box-shadow:0 0 0 2px rgba(0,0,0,.12)}.mz-map.ov>*:not(.mz-hit){pointer-events:none}.mz-hit{position:absolute;z-index:5;display:none;border:0;background:rgba(47,107,255,.0);cursor:pointer;font:700 clamp(18px,3vw,40px) system-ui,sans-serif;color:#fff;text-align:left;padding:18px;text-shadow:0 2px 8px rgba(0,0,0,.7)}.mz-map.ov .mz-hit{display:flex;align-items:flex-start;justify-content:flex-start}.mz-hit:hover{background:rgba(47,107,255,.18)}`;

  MZ_EXT.js = `(function(){var d=document,b=d.body,mode=b.getAttribute('data-nav')||'';
[].slice.call(d.querySelectorAll('.mz-car')).forEach(function(c){var t=c.querySelector('.mz-car-t'),dots=c.querySelectorAll('.mz-car-d button');if(!t)return;
function cur(){return Math.round(t.scrollLeft/Math.max(1,t.clientWidth))}
function mark(){var i=cur();[].forEach.call(dots,function(x,k){x.classList.toggle('on',k===i)})}
t.addEventListener('scroll',function(){clearTimeout(c._m);c._m=setTimeout(mark,60)});mark();
var a=+c.getAttribute('data-auto')||0;if(a)setInterval(function(){if(c.matches(':hover'))return;var n=t.children.length;t.scrollTo({left:((cur()+1)%n)*t.clientWidth,behavior:'smooth'})},a*1000)});
var pg=d.querySelector('.mz-page');if(!pg)return;var secs=[].slice.call(pg.children).filter(function(e){return e.nodeType===1});if(!secs.length)return;
var idx=0,map=null,ov=false,hits=[],cols=1,W=0,H=0,gap=0;
function mark(){if(!ui)return;[].forEach.call(dots.children,function(x,k){x.classList.toggle('on',k===idx&&!ov)})}
var ui=null,dots=null;
if(mode){ui=d.createElement('div');ui.className='mz-nv';ui.innerHTML='<button type="button" data-a="prev" aria-label="Anterior">\\u2039</button><span class="mz-nv-d">'+secs.map(function(s,i){return '<i data-i="'+i+'"></i>'}).join('')+'</span><button type="button" data-a="next" aria-label="Pr\\u00f3xima">\\u203a</button>'+(mode==='map'?'<button type="button" data-a="map" class="mz-nv-m">Mapa</button>':'');b.appendChild(ui);dots=ui.querySelector('.mz-nv-d')}
function lay(){W=window.innerWidth;H=window.innerHeight;gap=Math.round(W*.14);cols=Math.ceil(Math.sqrt(secs.length));secs.forEach(function(s,i){var c=i%cols,r=Math.floor(i/cols);s.style.cssText+=';position:absolute;left:'+c*(W+gap)+'px;top:'+r*(H+gap)+'px;width:'+W+'px;height:'+H+'px;margin:0';hits[i].style.cssText='left:'+c*(W+gap)+'px;top:'+r*(H+gap)+'px;width:'+W+'px;height:'+H+'px'})}
function view(){var rows=Math.ceil(secs.length/cols),tw=cols*(W+gap)-gap,th=rows*(H+gap)-gap,t;if(ov){var s=Math.min(W/(tw+gap),H/(th+gap))*.94;t='translate('+(W-tw*s)/2+'px,'+(H-th*s)/2+'px) scale('+s+')'}else{var c=idx%cols,r=Math.floor(idx/cols);t='translate('+(-c*(W+gap))+'px,'+(-r*(H+gap))+'px) scale(1)'}map.style.transform=t;map.classList.toggle('ov',ov);mark()}
if(mode==='map'){b.classList.add('mz-map-on');map=d.createElement('div');map.className='mz-map';secs.forEach(function(s,i){map.appendChild(s)});secs.forEach(function(s,i){var h=d.createElement('button');h.type='button';h.className='mz-hit';h.setAttribute('data-i',i);h.textContent=(i+1)+' \\u00b7 '+((s.querySelector('h1,h2,h3')||{}).textContent||'Esta\\u00e7\\u00e3o').slice(0,40);map.appendChild(h);hits.push(h);h.addEventListener('click',function(){idx=i;ov=false;view()})});pg.appendChild(map);lay();ov=true;view();window.addEventListener('resize',function(){lay();view()})}
function now(){if(mode==='h')return Math.max(0,Math.min(secs.length-1,Math.round(pg.scrollLeft/Math.max(1,pg.clientWidth))));if(mode==='v'){var k=0;secs.forEach(function(s,i){if(s.offsetTop<=pg.scrollTop+10)k=i});return k}if(mode==='map')return idx;var j=0;secs.forEach(function(s,i){if(s.getBoundingClientRect().top<=window.innerHeight*.4)j=i});return j}
function go(i){i=Math.max(0,Math.min(secs.length-1,i));idx=i;if(mode==='h')pg.scrollTo({left:i*pg.clientWidth,behavior:'smooth'});else if(mode==='v')pg.scrollTo({top:secs[i].offsetTop,behavior:'smooth'});else if(mode==='map'){ov=false;view()}else secs[i].scrollIntoView({behavior:'smooth'});mark()}
if(mode==='h'||mode==='v')pg.addEventListener('scroll',function(){clearTimeout(pg._m);pg._m=setTimeout(function(){idx=now();mark()},60)});mark();
function overview(){if(mode==='map'){ov=true;view()}else go(0)}
if(ui)ui.addEventListener('click',function(e){var a=e.target.closest('[data-a]'),i=e.target.closest('[data-i]');if(i){go(+i.getAttribute('data-i'));return}if(!a)return;var k=a.getAttribute('data-a');if(k==='prev'){idx=mode==='map'?idx:now();go(idx-1)}else if(k==='next'){idx=mode==='map'?idx:now();go(idx+1)}else overview()});
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var h=a.getAttribute('href').slice(1);if(!h)return;if(h==='proximo'||h==='anterior'||h==='inicio'||h==='mapa'){e.preventDefault();var c=mode==='map'?idx:now();if(h==='proximo')go(c+1);else if(h==='anterior')go(c-1);else if(h==='inicio')go(0);else overview();return}
if(!mode)return;var el=d.getElementById(h);if(!el)return;var s=el,root=map||pg;while(s&&s.parentNode!==root)s=s.parentNode;var k=secs.indexOf(s);if(k>=0){e.preventDefault();go(k)}});
if(mode)d.addEventListener('keydown',function(e){var t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;var k=e.key;if(k==='Escape'||k==='m'||k==='M'){if(mode==='map'){e.preventDefault();overview()}}else if(mode==='h'||mode==='map'){if(k==='ArrowRight'||k==='PageDown'){e.preventDefault();go((mode==='map'?idx:now())+1)}else if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();go((mode==='map'?idx:now())-1)}else if(k==='Home'){go(0)}else if(k==='End'){go(secs.length-1)}}else if(mode==='v'){if(k==='PageDown'){e.preventDefault();go(now()+1)}else if(k==='PageUp'){e.preventDefault();go(now()-1)}}})})();`;

  /* ---------- campos do painel Conteúdo ---------- */
  Object.assign(MZ_FIELDS, {
    carousel: [{k: 'slides', t: 'slides', l: 'Imagens e legendas'}, {k: 'ratio', t: 'sel', l: 'Proporção', o: [['16/9', '16:9'], ['4/3', '4:3'], ['1/1', '1:1'], ['3/4', '3:4'], ['21/9', '21:9']]}, {k: 'fit', t: 'sel', l: 'Ajuste da imagem', o: [['cover', 'Cobrir'], ['contain', 'Mostrar inteira']]}, {k: 'auto', t: 'sel', l: 'Passar sozinho', o: [[0, 'Não'], [3, 'A cada 3 s'], [5, 'A cada 5 s'], [8, 'A cada 8 s']]}, {k: 'dots', t: 'bool', l: 'Mostrar pontinhos'}],
    beforeafter: [{k: 'bImg', t: 'img', l: 'Imagem do ANTES (biblioteca)'}, {k: 'bSrc', t: 'url', l: 'ou endereço da imagem do antes'}, {k: 'aImg', t: 'img', l: 'Imagem do DEPOIS (biblioteca)'}, {k: 'aSrc', t: 'url', l: 'ou endereço da imagem do depois'}, {k: 'bLab', t: 'text', l: 'Legenda do antes'}, {k: 'aLab', t: 'text', l: 'Legenda do depois'}, {k: 'start', t: 'num', l: 'Posição inicial (0 a 100)'}, {k: 'ratio', t: 'sel', l: 'Proporção', o: [['16/9', '16:9'], ['4/3', '4:3'], ['1/1', '1:1'], ['3/4', '3:4'], ['21/9', '21:9']]}],
    reveal: [{k: 'q', t: 'area', l: 'Pergunta'}, {k: 'a', t: 'area', l: 'Resposta (aparece ao clicar no botão)'}, {k: 'btn', t: 'text', l: 'Texto do botão fechado'}, {k: 'btn2', t: 'text', l: 'Texto do botão aberto'}],
    step: [{k: 'num', t: 'text', l: 'Número ou marca'}, {k: 'title', t: 'text', l: 'Título do passo'}, {k: 'text', t: 'area', l: 'Explicação'}]
  });
  /* editor de slides do carrossel (imagem, legenda, link, ordem) */
  const baseField = mzField;
  mzField = function (n, f) {
    if (f.t !== 'slides') return baseField(n, f);
    const v = n.props.slides || [];
    return `<div class="mz-f"><span>${f.l} (${v.length})</span><div class="mz-slides">${v.map((s, i) => `<div class="mz-slide"><div class="th">${s.imgId ? `<img data-lib="${esc(s.imgId)}" alt="">` : s.src ? `<img src="${esc(s.src)}" alt="">` : '<em>sem imagem</em>'}</div><div class="bd"><input value="${esc(s.cap)}" placeholder="Legenda" onchange="mzSlideSet(${i},'cap',this.value)"><input value="${esc(s.src || '')}" placeholder="ou endereço da imagem" onchange="mzSlideSet(${i},'src',this.value)"><input value="${esc(s.href || '')}" placeholder="Link ao clicar (opcional)" onchange="mzSlideSet(${i},'href',this.value)"></div><div class="ac"><button class="mz-mini" onclick="mzSlideImg(${i})" title="Escolher da biblioteca">Imagem</button><button class="mz-mini" onclick="mzSlideMove(${i},-1)" title="Subir">↑</button><button class="mz-mini" onclick="mzSlideMove(${i},1)" title="Descer">↓</button><button class="mz-mini" onclick="mzSlideDel(${i})" title="Remover">×</button></div></div>`).join('')}</div><div class="row-gap"><button class="btn sm" onclick="mzSlideAdd()">＋ Slide</button></div></div>`;
  };
})();
function mzSlides() { const n = mzSelNode(); return n && n.type === 'carousel' ? mzClone(n.props.slides || []) : null; }
function mzSlideSet(i, k, v) { const s = mzSlides(); if (!s || !s[i]) return; s[i][k] = v; mzSetProp('slides', s, {panels: true}); }
function mzSlideAdd() { const s = mzSlides(); if (!s || s.length >= 20) return; s.push({imgId: '', src: '', cap: '', href: ''}); mzSetProp('slides', s, {panels: true}); }
function mzSlideDel(i) { const s = mzSlides(); if (!s) return; s.splice(i, 1); mzSetProp('slides', s, {panels: true}); }
function mzSlideMove(i, d) { const s = mzSlides(); if (!s || i + d < 0 || i + d >= s.length) return; [s[i], s[i + d]] = [s[i + d], s[i]]; mzSetProp('slides', s, {panels: true}); }
function mzSlideImg(i) { libPick(r => { const s = mzSlides(); if (!s || !s[i]) return; const li = libItem(r); s[i].imgId = li ? li.imgId : r; s[i].src = ''; mzSetProp('slides', s, {panels: true}); }, {raw: true, title: 'Imagem do slide'}); }

/* ---------- elementos no catálogo ---------- */
MZ_EL.push(
  {id: 'carousel', cat: 'adv', name: 'Carrossel', icon: 'camera', make: () => mzNode('carousel', {slides: [{cap: 'Legenda 1'}, {cap: 'Legenda 2'}, {cap: 'Legenda 3'}]}, {width: '100%', borderRadius: 'var(--mz-r-md)'})},
  {id: 'beforeafter', cat: 'adv', name: 'Antes e depois', icon: 'eye', make: () => mzNode('beforeafter', {bLab: 'Antes', aLab: 'Depois'}, {width: '100%'})},
  {id: 'reveal', cat: 'adv', name: 'Pergunta que revela a resposta', icon: 'search', make: () => mzNode('reveal', {q: 'Escreva a pergunta aqui?', a: 'Escreva a resposta aqui.'}, {width: '100%'})},
  {id: 'step', cat: 'adv', name: 'Passo', icon: 'arrow-right', make: () => mzNode('step', {num: '1', title: 'Título do passo', text: 'Explique este passo em uma frase.'}, {})}
);

/* ---------- 16 blocos "Aula · …" ---------- */
(function () {
  const B = MZB, N = B.N, st = B.st;
  /* estação: seção de tela cheia, sem caixa, com o conteúdo centralizado */
  const stn = (kids, o) => { o = o || {}; const s = B.sec([B.box(kids, Object.assign({display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 'var(--mz-w)'}, o.inner))], Object.assign({minHeight: 560, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '72px 24px'}, o.d), null, {padding: '48px 20px'}, {boxed: false}); return s; };
  const ctr = {textAlign: 'center'}, muted = {color: 'var(--mz-c-muted)'};
  const step = (n, t) => N('step', {num: String(n), title: '[' + t + ']', text: '[Explique este passo em uma frase]'}, st({}));
  const A = (id, name, icon, make) => ({id: 'aula-' + id, name: 'Aula · ' + name, icon, group: 'aula', make: c => { const s = make(c); s.name = 'Aula · ' + name; return s; }});
  const cardsRow = (cards, extra) => B.row(cards, Object.assign({gap: 20, width: '100%', alignItems: 'stretch'}, extra), {flexDirection: 'row'}, {flexDirection: 'row'});
  const seqCard = (i, extra, css) => { const c = B.card([N('step', {num: String(i), title: '[Etapa ' + i + ']', text: '[Descreva a etapa]'}, st({flexDirection: 'column'}))], Object.assign({flex: '0 0 280px'}, extra)); if (css) c.css = css; return c; };
  MZ_BLOCKS.push(
    A('capa', 'Capa', 'star', c => stn([B.badge(c.name ? c.name : '[Nome do curso]', {alignSelf: 'center'}), B.h(mzPh(c.product, 'Título da aula'), 1, ctr), B.tx('[Subtítulo: o que a pessoa vai aprender nesta aula]', Object.assign({maxWidth: 640, margin: '0 auto'}, ctr, muted)), B.btn('Começar a aula', '#proximo', 'solid', {alignSelf: 'center'})], {inner: {alignItems: 'center'}})),
    A('galeria', 'Galeria', 'camera', c => stn([B.h('[Título da galeria]', 2, ctr), N('gallery', {imgs: [], cols: 3}, st({width: '100%'})), B.tx('[Legenda ou explicação da galeria]', Object.assign({}, ctr, muted), null, null, 'small')])),
    A('carrossel', 'Carrossel', 'camera', c => stn([B.h('[Título do carrossel]', 2, ctr), N('carousel', {slides: [{cap: '[Legenda 1]'}, {cap: '[Legenda 2]'}, {cap: '[Legenda 3]'}]}, st({width: '100%', maxWidth: 860, margin: '0 auto', borderRadius: 'var(--mz-r-md)'}))])),
    A('antes-depois', 'Antes e depois', 'eye', c => stn([B.h('[Título da comparação]', 2, ctr), N('beforeafter', {bLab: 'Antes', aLab: 'Depois'}, st({width: '100%', maxWidth: 860, margin: '0 auto'})), B.tx('[O que mudou entre o antes e o depois]', Object.assign({}, ctr, muted))])),
    A('cartoes', 'Cartões', 'layers', c => stn([B.h('[Título dos cartões]', 2, ctr), B.grid(3, [0, 1, 2].map(i => B.card([B.ic(['book', 'target', 'zap'][i], 36), B.h('[Título do cartão ' + (i + 1) + ']', 3), B.tx('[Texto curto do cartão]', {color: '#5d6068'}, null, null, 'small')])), {width: '100%'})])),
    A('passos', 'Passos', 'arrow-right', c => stn([B.h('[Título do passo a passo]', 2), N('step', {num: '1', title: '[Título do passo 1]', text: '[Explique este passo em uma frase]'}, st({})), N('step', {num: '2', title: '[Título do passo 2]', text: '[Explique este passo em uma frase]'}, st({})), N('step', {num: '3', title: '[Título do passo 3]', text: '[Explique este passo em uma frase]'}, st({})), N('step', {num: '4', title: '[Título do passo 4]', text: '[Explique este passo em uma frase]'}, st({}))], {inner: {maxWidth: 760}})),
    A('perguntas', 'Perguntas', 'search', c => stn([B.h('Teste o que você aprendeu', 2, ctr), N('reveal', {q: '[Pergunta 1]?', a: '[Resposta 1]'}, st({})), N('reveal', {q: '[Pergunta 2]?', a: '[Resposta 2]'}, st({})), N('reveal', {q: '[Pergunta 3]?', a: '[Resposta 3]'}, st({}))], {inner: {maxWidth: 760}})),
    A('citacao', 'Citação', 'chat', c => stn([B.tx('“[Frase marcante da aula]”', Object.assign({fontSize: 38, fontWeight: 700, lineHeight: 1.25, maxWidth: 820, margin: '0 auto'}, ctr), {fontSize: 30}, {fontSize: 24}), B.tx('— [Autor ou fonte]', Object.assign({}, ctr, muted))], {inner: {alignItems: 'center'}})),
    A('video', 'Vídeo', 'play', c => stn([B.h('[Título do vídeo]', 2, ctr), N('video', {url: '', ratio: '16/9'}, st({width: '100%', maxWidth: 900, margin: '0 auto', borderRadius: 'var(--mz-r-md)', overflow: 'hidden'})), B.tx('[Resumo do que o vídeo mostra]', Object.assign({}, ctr, muted))])),
    A('seq-horizontal', 'Sequência horizontal', 'arrow-right', c => stn([B.h('[Título da sequência]', 2), cardsRow([1, 2, 3, 4].map(i => seqCard(i)), {overflowX: 'auto', padding: '8px 4px 16px'})], {inner: {maxWidth: 'none'}})),
    A('seq-vertical', 'Sequência vertical', 'arrow-down', c => stn([B.h('[Título da sequência]', 2), ...[1, 2, 3, 4].map(i => N('step', {num: String(i), title: '[Etapa ' + i + ']', text: '[Descreva a etapa]'}, st({borderLeft: '3px solid var(--mz-c-accent)', paddingLeft: 20, paddingBottom: 24})))], {inner: {maxWidth: 720}})),
    A('seq-zoom', 'Sequência com zoom', 'search', c => stn([B.h('[Título da sequência]', 2, ctr), B.tx('Passe o mouse (ou toque) numa etapa para ampliar.', Object.assign({}, ctr, muted), null, null, 'small'), cardsRow([1, 2, 3, 4].map(i => seqCard(i, {flex: '1 1 0', position: 'relative'}, 'self{transition:transform .25s ease,box-shadow .25s ease}self:hover,self:focus-within{transform:scale(1.1);z-index:3;box-shadow:var(--mz-sh-lg)}')), {flexWrap: 'wrap', padding: '16px 0'})])),
    A('estacao', 'Estação de mapa', 'map-pin', c => stn([B.badge('Estação [N]', {alignSelf: 'center'}), B.h('[Nome da estação]', 2, ctr), B.tx('[Explique o que se aprende nesta estação]', Object.assign({maxWidth: 620, margin: '0 auto'}, ctr, muted)), B.row([B.btn('← Voltar ao mapa', '#mapa', 'outline'), B.btn('Próxima estação →', '#proximo')], {gap: 12, justifyContent: 'center', flexWrap: 'wrap'}, {flexDirection: 'row'}, {flexDirection: 'column', alignItems: 'stretch'})], {inner: {alignItems: 'center'}})),
    A('texto-imagem', 'Texto e imagem', 'file', c => stn([B.row([B.im('', {flex: '1 1 45%', aspectRatio: '4/3', objectFit: 'cover'}, null, null, 'Imagem da aula'), B.col([B.h('[Título do conteúdo]', 2), B.tx('[Explique o conteúdo em 3 ou 4 linhas]'), B.btn('Continuar', '#proximo', 'outline')], {flex: '1 1 50%'})], {gap: 48, width: '100%'})])),
    A('resumo', 'Resumo', 'check', c => stn([B.h('Resumo da aula', 2), B.li(['[Ponto-chave 1]', '[Ponto-chave 2]', '[Ponto-chave 3]'], 'check-circle'), B.btn('Próximo', '#proximo', 'solid', {alignSelf: 'flex-start'})], {inner: {maxWidth: 720}})),
    A('exercicio', 'Exercício', 'target', c => stn([B.badge('Hora de praticar', {alignSelf: 'flex-start'}), B.h('[Título do exercício]', 2), B.tx('[Enunciado: o que a pessoa deve fazer]'), N('reveal', {q: '[Pergunta final]?', a: '[Resposta ou gabarito]', btn: 'Ver o gabarito', btn2: 'Esconder o gabarito'}, st({}))], {inner: {maxWidth: 720}}))
  );
  /* modelos de página de Aula (cada um já vem com a navegação certa) */
  MZ_TEMPLATES.push(
    {id: 'aula-faixas', name: 'Aula em faixas', desc: 'Telas lado a lado (navegação horizontal): capa, texto e imagem, carrossel, passos, perguntas e resumo.', blocks: ['aula-capa', 'aula-texto-imagem', 'aula-carrossel', 'aula-passos', 'aula-perguntas', 'aula-resumo'], nav: 'h'},
    {id: 'aula-mapa', name: 'Aula em mapa', desc: 'Estações num mapa com zoom: capa, três estações e resumo.', blocks: ['aula-capa', 'aula-estacao', 'aula-estacao', 'aula-estacao', 'aula-resumo'], nav: 'map'},
    {id: 'aula-vertical', name: 'Aula vertical', desc: 'Uma tela por vez, de cima para baixo: capa, vídeo, passos, antes e depois, exercício e resumo.', blocks: ['aula-capa', 'aula-video', 'aula-passos', 'aula-antes-depois', 'aula-exercicio', 'aula-resumo'], nav: 'v'}
  );
  /* comandos locais da IA para os blocos de Aula */
  if (typeof MZ_BLK_KW !== 'undefined') MZ_BLK_KW.unshift([/carrossel/, 'aula-carrossel'], [/antes e depois/, 'aula-antes-depois'], [/cita[cç][aã]o/, 'aula-citacao'], [/exerc[ií]cio/, 'aula-exercicio'], [/resumo/, 'aula-resumo'], [/esta[cç][aã]o/, 'aula-estacao'], [/galeria/, 'aula-galeria']);
})();
const MZ_NAV_NAMES = {'': 'Rolagem normal', h: 'Horizontal', v: 'Vertical', map: 'Mapa com zoom'};
