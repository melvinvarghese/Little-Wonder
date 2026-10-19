import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.TEST_URL||'http://localhost:8011/Little-Wonder/';
const articles=JSON.parse(fs.readFileSync(new URL('../assets/articles.json',import.meta.url)));
const browser=await chromium.launch();
let failures=0;
async function run(name,fn){try{await fn();console.log('PASS',name);}catch(e){failures++;console.error('FAIL',name,e.message);}}
await run('localStorage clear in another tab updates the visible saved state',async()=>{
 const c=await browser.newContext();const a=await c.newPage(),b=await c.newPage();
 await a.goto(new URL(`wonders/${articles[0].id}/`,base).href);await b.goto(base);await a.locator('[data-save]').click();await a.waitForFunction(()=>document.querySelector('[data-save]').getAttribute('aria-pressed')==='true');
 await b.evaluate(()=>localStorage.clear());await a.waitForTimeout(150);assert.equal(await a.locator('[data-save]').getAttribute('aria-pressed'),'false');await c.close();
});
await run('corrupted collection offers a raw backup that preserves the original bytes',async()=>{
 const c=await browser.newContext({acceptDownloads:true});const p=await c.newPage();await p.goto(base);await p.evaluate(()=>localStorage.setItem('little-wonder-collection-v1','{my broken data'));
 await p.goto(new URL('collection/',base).href);const recovery=p.locator('[data-recovery]');assert.ok(await recovery.isVisible());const dl=p.waitForEvent('download');await recovery.click();const download=await dl;assert.equal(fs.readFileSync(await download.path(),'utf8'),'{my broken data');assert.equal(await p.evaluate(()=>localStorage.getItem('little-wonder-collection-v1')),'{my broken data');await c.close();
});
await run('nested custom 404 keeps its assets and navigation at the project base',async()=>{
 const c=await browser.newContext();const p=await c.newPage();
 await c.route('**/missing/deep/',async route=>route.fulfill({status:404,contentType:'text/html',body:fs.readFileSync(new URL('../404.html',import.meta.url),'utf8')}));
 await c.route('https://melvinvarghese.github.io/Little-Wonder/**',async route=>{const target=route.request().url().replace('https://melvinvarghese.github.io/Little-Wonder/',base);const response=await c.request.get(target);await route.fulfill({response});});
 await p.goto(new URL('missing/deep/',base).href);const href=await p.locator('link[rel=stylesheet]').evaluate(e=>e.href);const asset=new URL(href);assert.equal(asset.origin+asset.pathname,'https://melvinvarghese.github.io/Little-Wonder/assets/style.css');assert.equal(await p.locator('.wordmark').evaluate(e=>e.href),'https://melvinvarghese.github.io/Little-Wonder/index.html');await c.close();
});
await browser.close();if(failures)process.exitCode=1;
