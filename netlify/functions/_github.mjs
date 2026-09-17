const OWNER=process.env.GITHUB_OWNER||'jangssam-class';
const REPO=process.env.GITHUB_REPO||'WAWA';
const BRANCH=process.env.GITHUB_BRANCH||'main';
const TOKEN=process.env.GITHUB_TOKEN;
const headers=()=>({Authorization:`Bearer ${TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'});
export function auth(req){const p=req.headers.get('x-admin-password')||'';return !!process.env.ADMIN_PASSWORD && p===process.env.ADMIN_PASSWORD}
export async function gh(path,opt={}){if(!TOKEN)throw new Error('GITHUB_TOKEN 환경변수가 없습니다.');let r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`,{...opt,headers:{...headers(),...(opt.headers||{})}});if(!r.ok){let t=await r.text();throw new Error(`GitHub ${r.status}: ${t.slice(0,300)}`)}return r.status===204?null:r.json()}
export async function getJson(path,fallback){try{let r=await gh(`/contents/${path}?ref=${BRANCH}`);return JSON.parse(Buffer.from(r.content,'base64').toString('utf8'))}catch(e){if(String(e).includes('404'))return fallback;throw e}}
export async function commitFiles(files,message){const ref=await gh(`/git/ref/heads/${BRANCH}`);const head=ref.object.sha;const commit=await gh(`/git/commits/${head}`);const entries=[];for(const f of files){let body=f.base64?{content:f.content,encoding:'base64'}:{content:f.content,encoding:'utf-8'};let blob=await gh('/git/blobs',{method:'POST',body:JSON.stringify(body)});entries.push({path:f.path,mode:'100644',type:'blob',sha:blob.sha})}const tree=await gh('/git/trees',{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:entries})});const nc=await gh('/git/commits',{method:'POST',body:JSON.stringify({message,tree:tree.sha,parents:[head]})});await gh(`/git/refs/heads/${BRANCH}`,{method:'PATCH',body:JSON.stringify({sha:nc.sha,force:false})});return nc.sha}
export {OWNER,REPO,BRANCH};
