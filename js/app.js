document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
document.querySelectorAll('#projectNav button').forEach(b=>b.addEventListener('click',()=>{state.projectTab=b.dataset.tab;renderProjectTab()}));

renderMatrix();renderHome();renderProjects();renderLibrary();renderProjectTab();
