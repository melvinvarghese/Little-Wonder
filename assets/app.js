import {dailyArticle,filterArticles,randomArticle,parseCollection,mergeCollection} from './core.js';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const base=new URL(document.body.dataset.base,document.baseURI);
const urlFor=id=>new URL(`wonders/${id}/index.html`,base).href;
const storageKey='little-wonder-collection-v1';
let articles=[],categories=[],favourites=[],storageReady=true,rawCollection=null,toastTimer,lastSurprise=null;
const status=$('#status');
function announce(message){status.textContent=message;status.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>status.classList.remove('visible'),6500);}
function storageWarning(message){const warning=$('#storage-warning');if(warning){warning.textContent=message;warning.hidden=false;}const recovery=$('[data-recovery]');if(recovery)recovery.hidden=rawCollection===null;announce(message);}
function readCollection(raw){return raw===null?[]:parseCollection(JSON.parse(raw));}
try{rawCollection=localStorage.getItem(storageKey);favourites=readCollection(rawCollection);}
catch{storageReady=false;storageWarning('Your saved collection could not be read. It has not been overwritten. If storage is blocked, allow site storage and reload. If data is damaged, use the recovery backup below before clearing site data.');}
try{lastSurprise=sessionStorage.getItem('little-wonder-last-surprise');}catch{}
// Serialize current-browser edits where Web Locks are supported. Always re-read before writing.
async function saveCollection(transform){
 if(!storageReady){storageWarning('Collection changes are paused because existing storage could not be read. Nothing has been overwritten.');return false;}
 const update=()=>{
  try{
   rawCollection=localStorage.getItem(storageKey);
   let current;
   try{current=readCollection(rawCollection);}catch{storageReady=false;storageWarning('Existing saved data could not be read. Download a recovery backup from My Little Collection before clearing site data. Nothing was overwritten.');return false;}
   const next=transform(current);
   localStorage.setItem(storageKey,JSON.stringify({version:1,favourites:next}));
   favourites=next;return true;
  }catch{storageWarning('This browser could not save your collection. Existing favourites are unchanged. Allow site storage or export a backup.');return false;}
 };
 try{return navigator.locks?.request?await navigator.locks.request(storageKey,update):update();}
 catch{storageWarning('Your browser could not update the collection. Existing favourites are unchanged. Please reload and try again.');return false;}
}
function syncSaveButtons(){for(const b of $$('[data-save]')){const saved=favourites.includes(b.dataset.save);b.setAttribute('aria-pressed',String(saved));b.textContent=saved?'Remove from my collection':'Save to my collection';}}
for(const b of $$('[data-save]'))b.addEventListener('click',async()=>{
 const id=b.dataset.save;let removed=false;b.disabled=true;
 try{if(await saveCollection(current=>{removed=current.includes(id);return removed?current.filter(x=>x!==id):[...current,id];})){syncSaveButtons();announce(removed?'Removed from your collection.':'Saved to your collection in this browser.');}}
 finally{b.disabled=false;}
});
syncSaveButtons();
window.addEventListener('storage',e=>{
 if(e.key!==storageKey&&e.key!==null)return;
 try{rawCollection=e.key===null?null:e.newValue;favourites=readCollection(rawCollection);storageReady=true;syncSaveButtons();renderLibrary();const warning=$('#storage-warning');if(warning)warning.hidden=true;const recovery=$('[data-recovery]');if(recovery)recovery.hidden=true;}
 catch{storageReady=false;storageWarning('Saved data changed in another tab and could not be read. No data has been overwritten.');}
});
function downloadFile(text,name,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('[data-recovery]')?.addEventListener('click',()=>{if(rawCollection!==null){downloadFile(rawCollection,'little-wonder-recovery.txt','text/plain');announce('Original saved data prepared as a recovery backup. Check your downloads before clearing this site’s browser data.');}});
async function loadData(){
 try{
  const [a,c]=await Promise.all([fetch(new URL('assets/articles.json',base)),fetch(new URL('assets/categories.json',base))]);
  if(!a.ok||!c.ok)throw Error('missing collection');
  const data=await a.json(),catData=await c.json();
  if(!Array.isArray(data)||!Array.isArray(catData))throw Error('invalid collection');
  categories=catData.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string');
  articles=data.filter(x=>x&&typeof x.id==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.id)&&typeof x.title==='string'&&typeof x.opening==='string'&&typeof x.readingTime==='string'&&Array.isArray(x.keywords)&&x.keywords.every(k=>typeof k==='string')&&categories.some(c=>c.id===x.category));
  refreshDaily();renderLibrary();
 }catch{
  for(const b of $$('[data-surprise]'))b.disabled=true;
  announce('The interactive shelf could not load. You can still open the discoveries listed on the Reading Shelf. Please reload to try again.');
 }
}
function refreshDaily(){const today=dailyArticle(articles);if(today)for(const a of $$('[data-daily]'))a.href=urlFor(today.id);}
setInterval(refreshDaily,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDaily();});
for(const link of $$('[data-daily]'))link.addEventListener('click',e=>{
 if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0||!dailyArticle(articles))return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 e.preventDefault();document.body.classList.add('book-opening');const destination=link.href;
 try{sessionStorage.setItem('little-wonder-opening','yes');}catch{}
 setTimeout(()=>location.assign(destination),460);
});
try{if(sessionStorage.getItem('little-wonder-opening')){document.body.classList.add('reader-enter');sessionStorage.removeItem('little-wonder-opening');}}catch{}
window.addEventListener('pageshow',()=>document.body.classList.remove('book-opening'));
for(const b of $$('[data-surprise]'))b.addEventListener('click',()=>{const category=$('#surprise-category')?.value||'all',current=$('[data-article]')?.dataset.article;const a=randomArticle(articles,current||lastSurprise,category);if(!a){announce('No discoveries are available in this collection. Try another collection.');return;}lastSurprise=a.id;try{sessionStorage.setItem('little-wonder-last-surprise',a.id);}catch{}location.assign(urlFor(a.id));});
const library=$('[data-library]'),search=$('#search'),category=$('#category');
function makeEntry(a){
 const c=categories.find(c=>c.id===a.category),li=document.createElement('li');li.className='shelf-entry';li.dataset.id=a.id;
 const link=document.createElement('a');link.className='entry-link';link.href=urlFor(a.id);
 const art=document.createElement('span');art.className='entry-art';art.style.color=c?.accent||'';art.setAttribute('aria-hidden','true');
 const engraving=document.getElementById(`art-${a.category}`)?.content.firstElementChild;
 if(engraving)art.append(engraving.cloneNode(true));else art.textContent='✧';
 const copy=document.createElement('span');copy.className='entry-copy';
 const meta=document.createElement('span');meta.className='entry-meta';meta.textContent=c?.title||'Little Wonder';
 const time=document.createElement('span');time.textContent=`${a.readingTime} read`;meta.append(time);
 const title=document.createElement('h2');title.textContent=a.title;
 const p=document.createElement('p');p.textContent=a.opening;copy.append(meta,title,p);
 const arrow=document.createElement('span');arrow.className='entry-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');link.append(art,copy,arrow);li.append(link);
 if(library?.dataset.saved==='true'){const remove=document.createElement('button');remove.type='button';remove.className='text-button';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${a.title} from my collection`);remove.addEventListener('click',async()=>{if(await saveCollection(current=>current.filter(id=>id!==a.id))){renderLibrary();announce('Removed from your collection.');}});li.append(remove);}
 return li;
}
function renderLibrary(){
 if(!library||!articles.length)return;
 const saved=library.dataset.saved==='true',available=saved?articles.filter(a=>favourites.includes(a.id)):articles;
 const results=filterArticles(available,search?.value||'',category?.value||'all');
 const list=$('.shelf-list',library);list.replaceChildren(...results.map(makeEntry));
 $('#result-count').textContent=`${results.length} ${results.length===1?'discovery':'discoveries'}${saved?' in your collection':' to explore'}`;
 const empty=$('.empty-state',library);empty.hidden=results.length>0;
 if(!results.length){const untouched=saved&&!favourites.length&&!search.value&&category.value==='all';$('h2',empty).textContent=untouched?'A little space for your favourites':'No wonders found';$('p',empty).textContent=untouched?'Save a discovery with “Save to my collection” as you read. It will be waiting here.':'Try another word or choose “Show all” to reset the filters.';}
 const unknown=$('#unknown-saved');if(unknown){const n=favourites.filter(id=>!articles.some(a=>a.id===id)).length;unknown.hidden=!n;unknown.textContent=`${n} saved ${n===1?'identifier is':'identifiers are'} not in this version of the library. They are preserved in your export, not deleted.`;}
}
search?.addEventListener('input',renderLibrary);category?.addEventListener('change',renderLibrary);
$('[data-reset]')?.addEventListener('click',()=>{search.value='';category.value='all';renderLibrary();search.focus();});
$('[data-export]')?.addEventListener('click',()=>{
 if(!storageReady){announce('Your collection could not be read. Use the recovery backup instead of exporting an incomplete collection.');return;}
 try{favourites=readCollection(localStorage.getItem(storageKey));}catch{announce('Your saved data could not be read. Reload to see recovery options.');return;}
 downloadFile(JSON.stringify({version:1,favourites},null,2)+'\n','my-little-wonder-collection.json','application/json');announce('Collection export prepared. Check your browser’s downloads.');
});
$('#import-file')?.addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try{if(file.size>1000000)throw Error('That file is too large. Choose a Little Wonder JSON export under 1 MB.');const incoming=parseCollection(JSON.parse(await file.text()));let added=0;
  if(await saveCollection(current=>{const next=mergeCollection(current,incoming);added=next.length-current.length;return next;})){renderLibrary();announce(`Collection imported. ${added} new ${added===1?'discovery':'discoveries'} added.`);}}
 catch(err){announce(err instanceof SyntaxError?'That file is not valid JSON. Your current collection has not changed.':err.message);}
 finally{e.target.value='';}
});
$('[data-share]')?.addEventListener('click',async()=>{
 const payload={title:document.title.replace(' · Little Wonder',''),text:'One small discovery from Little Wonder.',url:location.href.split('#')[0]};
 if(typeof navigator.share==='function'){
  try{await navigator.share(payload);announce('Share completed.');return;}
  catch(error){if(error.name==='AbortError')return;}
 }
 if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(payload.url);announce('Link copied.');return;}catch{}}
 const fallback=$('#share-fallback'),input=$('#share-link');fallback.hidden=false;input.value=payload.url;input.focus();input.select();announce('Copy the permanent link shown below. Your browser did not copy it automatically.');
});
loadData();
