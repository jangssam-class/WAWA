const cards=[...document.querySelectorAll('.center-card')];
const input=document.querySelector('#search');
const state=document.querySelector('#searchState');
const noResults=document.querySelector('#noResults');

function ensureCenterMap(card){
  if(card.querySelector('.center-map')) return;
  const addrEl=card.querySelector('.addr');
  const address=(addrEl?.textContent||'').trim();
  if(!address) return;
  const title=(card.querySelector('h3')?.textContent||'WAWA 센터').trim();
  const q=encodeURIComponent(address);
  const naverQ=encodeURIComponent(title+' '+address);
  const wrap=document.createElement('div');
  wrap.className='center-map';
  wrap.innerHTML=`
    <div class="center-map-title"><strong>📍 센터 위치</strong><a href="https://map.naver.com/p/search/${naverQ}" target="_blank" rel="noopener">네이버 지도에서 보기 →</a></div>
    <iframe class="center-map-frame" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${title} 위치 지도" src="https://maps.google.com/maps?q=${q}&z=16&output=embed"></iframe>
    <div class="center-map-actions">
      <a href="https://map.naver.com/p/search/${naverQ}" target="_blank" rel="noopener">네이버 지도</a>
      <a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">큰 지도 보기</a>
    </div>`;
  const contact=card.querySelector('.text-link');
  if(contact) card.insertBefore(wrap,contact); else card.appendChild(wrap);
}

function runSearch(){
  const q=(input?.value||'').trim().toLowerCase();
  let shown=0;
  cards.forEach(card=>{
    const ok=q.length>0 && (card.dataset.search||'').toLowerCase().includes(q) && shown<9;
    card.classList.toggle('show',ok);
    if(ok){
      shown++;
      ensureCenterMap(card);
    }
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
const revealTargets=[...document.querySelectorAll('.why,.stats,.brand-video,.detail,.subjects,.cta,.why-grid article,.detail-grid article')];
revealTargets.forEach(el=>el.classList.add('reveal'));
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  }),{threshold:.12});
  revealTargets.forEach(el=>observer.observe(el));
}else{revealTargets.forEach(el=>el.classList.add('is-visible'))}
