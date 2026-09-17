const cards=[...document.querySelectorAll('.center-card')];
const input=document.querySelector('#search');
const state=document.querySelector('#searchState');
const noResults=document.querySelector('#noResults');
function runSearch(){
  const q=(input?.value||'').trim().toLowerCase();
  let shown=0;
  cards.forEach(card=>{
    const ok=q.length>0 && (card.dataset.search||'').toLowerCase().includes(q) && shown<9;
    card.classList.toggle('show',ok);
    if(ok) shown++;
  });
  if(state) state.style.display=q?'none':'block';
  if(noResults) noResults.style.display=q && shown===0?'block':'none';
}
input?.addEventListener('input',runSearch);
document.querySelector('#searchBtn')?.addEventListener('click',runSearch);
input?.addEventListener('keydown',e=>{if(e.key==='Enter')runSearch()});
runSearch();

// Subject curriculum tabs
const subjectTabs=[...document.querySelectorAll('.subject-tab')];
const subjectPanels=[...document.querySelectorAll('.curriculum')];
subjectTabs.forEach(tab=>tab.addEventListener('click',()=>{
  subjectTabs.forEach(t=>t.classList.toggle('active',t===tab));
  subjectPanels.forEach(p=>p.classList.toggle('active',p.dataset.panel===tab.dataset.subject));
}));

// Scroll reveal animation
const revealTargets=[...document.querySelectorAll('.why,.detail,.subjects,.cta,.why-grid article,.detail-grid article')];
revealTargets.forEach(el=>el.classList.add('reveal'));
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  }),{threshold:.12});
  revealTargets.forEach(el=>observer.observe(el));
}else{revealTargets.forEach(el=>el.classList.add('is-visible'))}
