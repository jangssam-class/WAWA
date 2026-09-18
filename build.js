const fs=require('fs'), path=require('path');
const ROOT=__dirname, SITE='https://wawa-academy.netlify.app';
const postDir=path.join(ROOT,'content/posts');
let rawPosts=[];
if(fs.existsSync(postDir)) for(const name of fs.readdirSync(postDir).filter(n=>n.endsWith('.json'))){try{rawPosts.push(JSON.parse(fs.readFileSync(path.join(postDir,name),'utf8')))}catch(e){console.warn('skip invalid post',name)}}
// 게시글의 단일 기준(Source of Truth)은 관리자 CMS가 관리하는 content/posts/*.json 뿐입니다.
// 구버전 content/posts.json은 절대 읽지 않습니다. 관리자에 없는 글이 다시 노출되는 문제를 방지합니다.
// _helper 안전 복구: 실제 필드가 비어 있을 때만 자동작성 원본으로 채웁니다.
const normalized=rawPosts.map(p=>{
  if(!p||!p._helper)return p;
  try{const h=typeof p._helper==='string'?JSON.parse(p._helper):p._helper;return h&&typeof h==='object'?{...h,...p}:p;}catch(e){return p;}
});
const posts=normalized.filter(p=>p && p.slug && p.title && p.published!==false).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const md=s=>String(s||'').split(/\n+/).filter(Boolean).map(x=>x.startsWith('## ')?`<h2>${esc(x.slice(3))}</h2>`:`<p>${esc(x)}</p>`).join('\n');
const detailBlock=p=>{if(!p.detailImage)return '';const src=p.detailImage.startsWith('/')?p.detailImage:'/'+p.detailImage;return `<figure class="detail-page"><img src="${esc(src)}" alt="${esc(p.detailImageAlt||p.title+' 상세페이지')}"></figure>`};
const bodyWithDetail=p=>{const raw=String(p.body||'');const block=detailBlock(p);if(!block)return md(raw);const pos=p.detailImagePosition||'middle';if(pos==='top')return block+md(raw);if(pos==='bottom')return md(raw)+block;const parts=raw.split(/\n+/).filter(Boolean);const cut=Math.max(1,Math.ceil(parts.length/2));return md(parts.slice(0,cut).join('\n'))+block+md(parts.slice(cut).join('\n'));};
const faq=p=>[1,2,3].map(n=>({q:p['q'+n],a:p['a'+n]})).filter(x=>x.q&&x.a);
const generatedDir=path.join(ROOT,'posts');
fs.mkdirSync(generatedDir,{recursive:true});
// CMS에서 삭제된 글의 예전 HTML이 배포 폴더에 남지 않도록 매 빌드마다 생성 HTML을 정리합니다.
for(const name of fs.readdirSync(generatedDir)){if(name.endsWith('.html'))fs.unlinkSync(path.join(generatedDir,name));}
for(const p of posts){const url=`${SITE}/posts/${p.slug}.html`, f=faq(p), image=p.image?`${SITE}${p.image.startsWith('/')?p.image:'/'+p.image}`:'';
const articleJson={"@context":"https://schema.org","@type":"Article",headline:p.title,description:p.excerpt,datePublished:p.date,dateModified:p.date,author:{"@type":"Organization",name:"WAWA 소수정예학원"},publisher:{"@type":"Organization",name:"WAWA 소수정예학원"},mainEntityOfPage:url}; if(image)articleJson.image=image;
const schemas=[articleJson];if(f.length)schemas.push({"@context":"https://schema.org","@type":"FAQPage",mainEntity:f.map(x=>({"@type":"Question",name:x.q,acceptedAnswer:{"@type":"Answer",text:x.a}}))});
const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)} | WAWA 소수정예학원</title><meta name="description" content="${esc(p.excerpt)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${url}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.excerpt)}"><meta property="og:url" content="${url}">${image?`<meta property="og:image" content="${image}">`:''}<script type="application/ld+json">${JSON.stringify(schemas)}</script><style>*{box-sizing:border-box}body{margin:0;color:#12284b;font-family:Pretendard,"Noto Sans KR","Apple SD Gothic Neo",Arial,sans-serif;line-height:1.85}header{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 max(24px,calc((100% - 1040px)/2));border-bottom:1px solid #e5eef9}header a{text-decoration:none;color:#0d2d62;font-weight:800}.brand{font-size:22px;color:#1677ff}.wrap{max-width:860px;margin:auto;padding:70px 24px}.cat{color:#1677ff;font-weight:800}.wrap h1{font-size:42px;line-height:1.25;margin:12px 0 18px}.meta{color:#7a8ba4}.lead{background:#eef7ff;border-radius:18px;padding:22px;margin:30px 0;font-weight:700}.heroimg{width:100%;border-radius:22px;margin:20px 0}.detail-page{margin:38px 0;padding:0}.detail-page img{display:block;width:100%;height:auto;border-radius:18px}.content h2{font-size:27px;margin-top:46px}.content p{font-size:17px;color:#344d70}.faq{margin-top:55px}.faq details{border-top:1px solid #dce8f7;padding:17px 0}.faq summary{font-weight:800}.cta{margin-top:60px;padding:30px;border-radius:22px;background:#eaf5ff}.cta a{display:inline-block;margin:8px 8px 0 0;padding:12px 17px;border-radius:12px;background:#1677ff;color:#fff;text-decoration:none;font-weight:800}@media(max-width:650px){.wrap h1{font-size:31px}}</style></head><body><header><a class="brand" href="../index.html">WAWA</a><a href="../blog.html">교육정보</a></header><main class="wrap"><div class="cat">${esc([p.region,p.target,p.category].filter(Boolean).join(' · '))}</div><h1>${esc(p.title)}</h1><div class="meta">${esc(p.date)} · WAWA 소수정예학원</div>${image?`<img class="heroimg" src="${esc(p.image)}" alt="${esc(p.imageAlt||p.title)}">`:''}<div class="lead">${esc(p.answer||p.excerpt)}</div><article class="content">${bodyWithDetail(p)}</article>${f.length?`<section class="faq"><h2>자주 묻는 질문</h2>${f.map(x=>`<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}</section>`:''}<section class="cta"><h2>가까운 WAWA 센터에서 상담받아보세요.</h2><p>학생의 현재 학습 상황에 맞는 수업과 학습관리 방법을 안내해드립니다.</p><a href="tel:01097680911">전화 010-9768-0911</a><a href="https://naver.me/GZ6iPX5b" target="_blank" rel="noopener">네이버폼 상담</a></section></main></body></html>`;
fs.writeFileSync(path.join(ROOT,'posts',p.slug+'.html'),html);}
const thumb=(p,i=0)=>{
  // 대표이미지를 최우선으로 사용하고, 없으면 상세페이지 이미지, 그것도 없으면 글마다 다른 WAWA 기본 이미지를 사용합니다.
  const src=p.image||p.detailImage||`feature-${(i%4)+1}.png`;
  return src.startsWith('/')?src:src;
};
const cards=posts.map((p,i)=>`<a class="post-card" href="posts/${p.slug}.html"><img class="post-thumb" src="${esc(thumb(p,i))}" alt="${esc(p.imageAlt||p.detailImageAlt||p.title)}" loading="lazy"><div class="post-card-body"><small>${esc(p.category)}</small><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="post-arrow">자세히 읽기 →</span></div></a>`).join('');
let blog=fs.readFileSync(path.join(ROOT,'blog.html'),'utf8');
// 목록은 매 빌드마다 통째로 다시 생성합니다. 이전 카드 HTML이 남아 중복되는 문제를 차단합니다.
const gridStart=blog.indexOf('<div class="post-grid">');
const contactStart=gridStart>=0?blog.indexOf('<section class="blog-contact"',gridStart):-1;
if(gridStart>=0&&contactStart>=0) blog=blog.slice(0,gridStart)+`<div class="post-grid">${cards}</div>`+blog.slice(contactStart);
fs.writeFileSync(path.join(ROOT,'blog.html'),blog);
// 메인 홈페이지 최신 교육정보 3개 자동 연결
const homeCards=posts.slice(0,3).map((p,i)=>`<a class="home-edu-card" href="posts/${p.slug}.html"><img src="${esc(thumb(p,i))}" alt="${esc(p.imageAlt||p.detailImageAlt||p.title)}" loading="lazy"><div><small>${esc([p.region,p.category].filter(Boolean).join(' · '))}</small><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><b>교육정보 보기 →</b></div></a>`).join('');
const homeSection=`<!-- WAWA_EDU_START --><section class="home-education reveal" id="education"><div class="home-edu-head"><div><p class="eyebrow">WAWA EDUCATION CONTENT</p><h2>최신 교육정보</h2><p>학생과 학부모가 실제로 궁금해하는 학습·학원 선택 정보를 확인해보세요.</p></div><a href="blog.html">교육정보 전체보기 →</a></div><div class="home-edu-grid">${homeCards||'<p class="home-edu-empty">등록된 교육정보가 없습니다.</p>'}</div></section><!-- WAWA_EDU_END -->`;
let home=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const hs=home.indexOf('<!-- WAWA_EDU_START -->'), he=home.indexOf('<!-- WAWA_EDU_END -->');
if(hs>=0&&he>=0) home=home.slice(0,hs)+homeSection+home.slice(he+'<!-- WAWA_EDU_END -->'.length);
else { const anchor='<section id="consult"'; const ai=home.indexOf(anchor); if(ai>=0) home=home.slice(0,ai)+homeSection+home.slice(ai); else home=home.replace('</main>',homeSection+'</main>'); }
fs.writeFileSync(path.join(ROOT,'index.html'),home);
fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}/</loc></url><url><loc>${SITE}/blog.html</loc></url>${posts.map(p=>`<url><loc>${SITE}/posts/${p.slug}.html</loc><lastmod>${p.date}</lastmod></url>`).join('')}</urlset>`);
fs.writeFileSync(path.join(ROOT,'rss.xml'),`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>WAWA 교육정보</title><link>${SITE}/blog.html</link><description>WAWA 학습·교육정보</description>${posts.slice(0,30).map(p=>`<item><title><![CDATA[${p.title}]]></title><link>${SITE}/posts/${p.slug}.html</link><description><![CDATA[${p.excerpt}]]></description><pubDate>${new Date(p.date+'T09:00:00+09:00').toUTCString()}</pubDate><guid>${SITE}/posts/${p.slug}.html</guid></item>`).join('')}</channel></rss>`);
fs.writeFileSync(path.join(ROOT,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`WAWA build complete: ${posts.length} posts`);
