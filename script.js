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
