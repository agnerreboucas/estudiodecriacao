const matrixData={
 hooks:['Problema','Curiosidade','Alerta','Identificação','Contradição','Pergunta','Número','História'],
 angles:['Problema','Educação','Erro','Oportunidade','Comparação','Checklist','História','Prova','Objeção'],
 formats:['UGC','Especialista','Cinemático','Demo','Storytelling','Voice-over'],
 ctas:['Saiba mais','Entenda seu caso','Veja como funciona','Fale conosco','Acesse','Salve e compartilhe'],
 direction:['Close','Plano médio','POV','Push-in','Handheld','Luz natural','Editorial','Performance']
};
function renderMatrix(){
 Object.entries(matrixData).forEach(([key,vals])=>{
   const el=$(key); if(!el)return;
   el.innerHTML=vals.map((v,i)=>`<button class="matrix-opt ${i<3?'selected':''}" onclick="toggleMatrix(this)">${v}</button>`).join('');
 });
 updateMatrixCount();
 const scenes=[
  ['01','0–2s','Hook','Close + push-in','Modelo: vídeo rápido'],
  ['02','2–5s','Problema','Plano médio','Luz natural'],
  ['03','5–8s','Ideia','POV','Handheld'],
  ['04','8–10s','Solução','Close','Editorial'],
  ['05','10–13s','Prova','Plano médio','Especialista'],
  ['06','13–15s','CTA','Close + static','Performance']
 ];
 $('sceneGrid').innerHTML=scenes.map(x=>`<article class="scene-card"><div class="scene-top"><span>CENA ${x[0]} · ${x[1]}</span><b>${x[2]}</b></div><div class="scene-body"><strong>${x[3]}</strong><small>${x[4]} · modelo roteado automaticamente · créditos estimados</small></div></article>`).join('');
}
function toggleMatrix(el){el.classList.toggle('selected');updateMatrixCount()}
function updateMatrixCount(){
 let n=1;
 ['hooks','angles','formats','ctas','direction'].forEach(id=>{const c=$(id);n*=Math.max(1,c?c.querySelectorAll('.selected').length:1)});
 $('matrixCount').textContent=n.toLocaleString('pt-BR');
}
function selectAllMatrix(){
 document.querySelectorAll('.matrix-opt').forEach(x=>x.classList.add('selected'));updateMatrixCount();toast('Núcleo completo selecionado');
}
function generateConcepts(){
 const hooks=['Problema','Curiosidade','Alerta','Pergunta','Contradição','Número'];
 const angles=['Educação','Erro','Checklist','Prova','Objeção','Oportunidade'];
 $('concepts').innerHTML=Array.from({length:12},(_,i)=>{
  const h=hooks[i%hooks.length],a=angles[(i*2)%angles.length];
  return `<article class="concept"><span class="badge ${i<3?'hot':''}">${i<3?'TOP 12':'CONCEITO'}</span><strong>${h} × ${a}</strong><small>15s · 0–2s hook · UGC especialista · CTA “Entenda seu caso”</small></article>`
 }).join('');
 toast('12 conceitos derivados da matriz');
}

