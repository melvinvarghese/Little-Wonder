import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dailyArticle} from '../assets/core.js';
const base=process.env.TEST_URL||'http://localhost:8011/Little-Wonder/';
const articles=JSON.parse(fs.readFileSync(new URL('../assets/articles.json',import.meta.url)));
const manifest=JSON.parse(fs.readFileSync(new URL('../site-manifest.json',import.meta.url)));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
context.setDefaultTimeout(10000);
context.setDefaultNavigationTimeout(10000);
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];
async function run(name,fn){try{await fn();results.push({name,passed:true});console.log('PASS',name);}catch(e){results.push({name,passed:false,error:e.message});console.error('FAIL',name,e.message);}}
async function go(path=''){await page.goto(new URL(path,base).href);await page.waitForLoadState('networkidle');}
await run('all 75 static pages and article direct links return HTTP 200',async()=>{for(const f of manifest.pages){const res=await context.request.get(new URL(f,base).href);assert.equal(res.status(),200,f);assert.match(await res.text(),/<h1[ >]/,f);}});
await run('daily selection stable, book opens and closes, refresh preserves article',async()=>{
 await go();const target=await page.locator('.open-book').getAttribute('href');assert.match(target,/\/wonders\//);
 await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('.open-book').getAttribute('href'),target);
 await page.locator('.open-book').click();await page.waitForURL('**/wonders/**');await page.waitForLoadState('networkidle');assert.equal(page.url(),target);assert.ok(await page.locator('.article-body').isVisible());
 await page.reload();assert.equal(page.url(),target);await page.locator('[data-close]').click();await page.waitForURL(url=>url.href===base||url.href===new URL('index.html',base).href);assert.equal(await page.locator('.book').count(),1);
});
await run('daily date updates after local midnight and on visibility change',async()=>{
 await page.clock.install({time:new Date(2026,9,19,23,59,50)});await go();
 const first=await page.locator('.open-book').getAttribute('href');await page.clock.fastForward(31000);
 const second=await page.locator('.open-book').getAttribute('href');assert.notEqual(first,second);
 await page.clock.setSystemTime(new Date(2026,9,21,10));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 const third=await page.locator('.open-book').getAttribute('href');assert.notEqual(second,third);
});
await run('shelf search, keyword search, category filters and empty reset work',async()=>{
 await go('shelf/');assert.equal(await page.locator('.shelf-entry').count(),60);
 await page.locator('#category').selectOption('thinking-room');assert.equal(await page.locator('.shelf-entry').count(),10);
 await page.locator('#search').fill('identity');assert.ok(await page.locator('.shelf-entry').count()>0);
 await page.locator('#search').fill('zzzz-no-wonder');assert.equal(await page.locator('.shelf-entry').count(),0);assert.ok(await page.locator('.empty-state').isVisible());
 await page.locator('[data-reset]').click();assert.equal(await page.locator('.shelf-entry').count(),60);
});
await run('surprise respects category and does not immediately repeat',async()=>{
 await go('shelf/');await page.locator('#surprise-category').selectOption('natures-secrets');await page.locator('[data-surprise]').click();await page.waitForURL('**/wonders/**');
 const first=page.url();assert.ok(articles.filter(a=>a.category==='natures-secrets').some(a=>first.includes('/'+a.id+'/')));
 await go('shelf/');await page.locator('#surprise-category').selectOption('natures-secrets');await page.locator('[data-surprise]').click();await page.waitForURL('**/wonders/**');assert.notEqual(page.url(),first);
});
await run('favourites persist, can be viewed, exported, removed and restored with accurate feedback',async()=>{
 await go(`wonders/${articles[0].id}/`);await page.locator('[data-save]').click();await page.waitForFunction(()=>document.querySelector('[data-save]').getAttribute('aria-pressed')==='true');assert.equal(await page.locator('[data-save]').getAttribute('aria-pressed'),'true');
 await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('[data-save]').getAttribute('aria-pressed'),'true');
 await go('collection/');assert.equal(await page.locator('.shelf-entry').count(),1);
 const dlPromise=page.waitForEvent('download');await page.locator('[data-export]').click();const dl=await dlPromise;const path=await dl.path();const payload=JSON.parse(fs.readFileSync(path));assert.deepEqual(payload,{version:1,favourites:[articles[0].id]});
 await page.locator('.shelf-entry button').click();await page.waitForFunction(()=>document.querySelectorAll('.shelf-entry').length===0);assert.equal(await page.locator('.shelf-entry').count(),0);
 await page.locator('#import-file').setInputFiles({name:'collection.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Collection imported'));
 assert.equal(await page.locator('.shelf-entry').count(),1);assert.match(await page.locator('#status').textContent(),/1 new discover/);
});
await run('malformed imports leave saved data untouched and unknown IDs survive export',async()=>{
 await go('collection/');const original=await page.evaluate(()=>localStorage.getItem('little-wonder-collection-v1'));
 await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('not valid JSON'));assert.equal(await page.evaluate(()=>localStorage.getItem('little-wonder-collection-v1')),original);
 await page.locator('#import-file').setInputFiles({name:'old.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,favourites:['an-old-wonder']}))});
 await page.waitForFunction(()=>document.querySelector('#unknown-saved').hidden===false);assert.ok((await page.evaluate(()=>JSON.parse(localStorage.getItem('little-wonder-collection-v1')).favourites)).includes('an-old-wonder'));
});
await run('corrupt existing storage is preserved rather than overwritten',async()=>{
 await page.evaluate(()=>localStorage.setItem('little-wonder-collection-v1','{broken'));await go('collection/');assert.ok(await page.locator('#storage-warning').isVisible());
 await go(`wonders/${articles[0].id}/`);await page.locator('[data-save]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('little-wonder-collection-v1')),'{broken');
 await page.evaluate(()=>localStorage.removeItem('little-wonder-collection-v1'));
});
await run('blocked browser storage reports failure without pretending a save succeeded',async()=>{
 const c=await browser.newContext();await c.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError')};});const p=await c.newPage();await p.goto(new URL(`wonders/${articles[0].id}/`,base).href);await p.locator('[data-save]').click();await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('could not save'));assert.equal(await p.locator('[data-save]').getAttribute('aria-pressed'),'false');assert.match(await p.locator('#status').textContent(),/could not save/);await c.close();
});
await run('share copies only on success and exposes a manual link on rejection',async()=>{
 await go(`wonders/${articles[0].id}/`);
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:async(text)=>{window.copiedWonder=text}},configurable:true});});
 await page.locator('[data-share]').click();assert.equal(await page.locator('#status').textContent(),'Link copied.');assert.ok((await page.evaluate(()=>window.copiedWonder)).includes(articles[0].id));
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('blocked')}},configurable:true}));
 await page.locator('[data-share]').click();assert.ok(await page.locator('#share-fallback').isVisible());assert.match(await page.locator('#status').textContent(),/did not copy/);
});
await run('native share cancellation is quiet, success is confirmed',async()=>{
 await go(`wonders/${articles[0].id}/`);await page.evaluate(()=>Object.defineProperty(navigator,'share',{value:async()=>{throw new DOMException('cancel','AbortError')},configurable:true}));await page.locator('[data-share]').click();assert.notEqual(await page.locator('#status').textContent(),'Share completed.');
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{value:async()=>{},configurable:true}));await page.locator('[data-share]').click();assert.equal(await page.locator('#status').textContent(),'Share completed.');
});
await run('previous and next reader links navigate and return',async()=>{
 await go(`wonders/${articles[0].id}/`);const current=page.url();await page.locator('.page-navigation a').last().click();await page.waitForLoadState('networkidle');assert.notEqual(page.url(),current);await page.locator('.page-navigation a').first().click();await page.waitForLoadState('networkidle');assert.equal(await page.locator('[data-article]').getAttribute('data-article'),articles[0].id);
});
await run('missing/invalid article data keeps static reading usable',async()=>{
 const c=await browser.newContext();await c.route('**/assets/articles.json',route=>route.fulfill({status:200,contentType:'application/json',body:'{"not":"articles"}'}));const p=await c.newPage();await p.goto(new URL(`wonders/${articles[0].id}/`,base).href);await p.waitForLoadState('networkidle');assert.ok(await p.locator('.article-body').isVisible());assert.ok(await p.locator('.article-sources a').count());await c.close();
});
await run('no-JavaScript articles and full shelf remain readable',async()=>{
 const c=await browser.newContext({javaScriptEnabled:false});const p=await c.newPage();await p.goto(new URL(`wonders/${articles[0].id}/`,base).href);assert.ok(await p.locator('.article-body').isVisible());await p.goto(new URL('shelf/',base).href);assert.equal(await p.locator('.shelf-entry').count(),60);await c.close();
});
await run('desktop and phone layouts have no horizontal overflow or clipped book',async()=>{
 for(const width of [320,375,390,768,1366]){await page.setViewportSize({width,height:900});for(const route of ['', 'shelf/','categories/','collection/',`wonders/${articles[0].id}/`]){await go(route);const geometry=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(geometry.scroll<=geometry.w+1,`${width} ${route}: overflow ${geometry.scroll}`);}
 await go();const box=await page.locator('.book').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width,`${width}: clipped book`);}
});
await run('keyboard navigation and visible focus can reach the reading page',async()=>{
 await page.setViewportSize({width:1366,height:900});await go();await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to content');await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'main');
 await page.locator('.open-book').focus();const outline=await page.locator('.open-book').evaluate(e=>getComputedStyle(e).outlineStyle);assert.notEqual(outline,'none');await page.keyboard.press('Enter');await page.waitForURL('**/wonders/**');assert.ok(await page.locator('.article-body').isVisible());
});
await run('reduced motion removes book and reading transitions',async()=>{
 await page.emulateMedia({reducedMotion:'reduce'});await go();const duration=await page.locator('.book-cover').evaluate(e=>getComputedStyle(e).transitionDuration);assert.equal(duration,'0s');await page.locator('.open-book').click();await page.waitForURL('**/wonders/**');assert.equal(await page.locator('.reading-page').evaluate(e=>getComputedStyle(e).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
});
await run('axe WCAG 2.1 AA automated scans have zero violations across key templates',async()=>{
 await page.setViewportSize({width:1366,height:900});
 for(const route of ['', 'shelf/','categories/','collection/','privacy/',...[...new Set(articles.map(a=>a.category))].map(category=>`wonders/${articles.find(a=>a.category===category).id}/`)]){await go(route);const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[],route);}
});
await run('no browser JavaScript errors during all flows',async()=>assert.deepEqual(errors,[]));
fs.mkdirSync(new URL('../test-results/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../test-results/browser-results.json',import.meta.url),JSON.stringify({base,results,errors},null,2));
console.log(`\n${results.filter(r=>r.passed).length}/${results.length} browser checks passed.`);
await browser.close();
if(results.some(r=>!r.passed))process.exitCode=1;
