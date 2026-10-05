(function () {
	'use strict';
	if (window.__ampLeadForm) { return; } window.__ampLeadForm = 1;
	try {
		var q = new URLSearchParams(location.search), u = JSON.parse(sessionStorage.getItem('amp_utm') || '{}'), ch = false;
		q.forEach(function (v, k) { if (/^utm_/.test(k)) { u[k] = v; ch = true; } });
		if (ch) { sessionStorage.setItem('amp_utm', JSON.stringify(u)); }
	} catch (e) { /* sem armazenamento */ }
	document.addEventListener('submit', function (e) {
		var f = e.target.closest && e.target.closest('.amp-form form');
		if (!f) { return; }
		e.preventDefault();
		var box = f.parentNode, msg = f.querySelector('.amp-msg'), d = {}, utm = {};
		new FormData(f).forEach(function (v, k) { d[k] = v; });
		var say = function (t, bad) { msg.hidden = false; msg.textContent = t; msg.className = 'amp-msg' + (bad ? ' bad' : ''); };
		if (d.website) { return; }
		if (!d.name || !d.phone || !d.consent) { say('Preencha nome, WhatsApp e aceite o contato.', true); return; }
		var url = box.getAttribute('data-leads');
		try { utm = JSON.parse(sessionStorage.getItem('amp_utm') || '{}'); } catch (x) { utm = {}; }
		var body = { source: document.title || 'site', name: d.name, phone: d.phone, email: d.email || '', message: d.message || '', consent: 'sim' };
		Object.keys(utm).forEach(function (k) { if (/^utm_/.test(k)) { body[k] = utm[k]; } });
		var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
		fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) {
			if (!r.ok) { throw 0; }
			var t = box.getAttribute('data-thanks');
			if (t) { location.href = t + (t.indexOf('?') < 0 ? location.search : ''); } else { say('Recebemos os seus dados. Obrigado!', false); f.reset(); btn.disabled = false; }
		}).catch(function () { btn.disabled = false; say('Não foi possível enviar. Tente pelo WhatsApp.', true); });
	});
})();
