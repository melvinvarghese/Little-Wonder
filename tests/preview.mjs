import {chromium} from 'playwright';
import fs from 'node:fs';
const base=process.env.TEST_URL||'http://localhost:8011/Little-Wonder/';
const out=new URL('../test-results/atlas-preview/',import.meta.url);
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
for(const [name,width,height] of [['desktop',1440,1060],['tablet',768,1024],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.goto(base);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:new URL(`home-${name}.png`,out).pathname,fullPage:true});
 if(name==='desktop')await page.locator('.home-hero').screenshot({path:new URL('atlas-social-source.png',out).pathname});
 const daily=await page.locator('.open-book').getAttribute('href');
 for(const [view,route] of [['reader',daily],['shelf','shelf/'],['categories','categories/'],['collection','collection/']]){
  await page.goto(new URL(route,base).href);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:new URL(`${view}-${name}.png`,out).pathname,fullPage:view!=='shelf'});
 }
 await page.close();console.log(`Saved ${name} previews`);
}
await browser.close();
console.log(out.pathname);
