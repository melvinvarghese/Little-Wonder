import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base=process.env.TEST_URL||'http://localhost:8011/Little-Wonder/';
const articles=JSON.parse(fs.readFileSync(new URL('../assets/articles.json',import.meta.url)));
const categories=JSON.parse(fs.readFileSync(new URL('../content/categories.json',import.meta.url)));
const categoryTitles=new Map(categories.map(category=>[category.id,category.title]));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1366,height:900},timezoneId:'Asia/Kolkata'});
context.setDefaultTimeout(5000);
context.setDefaultNavigationTimeout(10000);
const page=await context.newPage();
const results=[];

function expectedArticle(date){
 const day=Math.floor(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())/86400000);
 const index=((day%articles.length)+articles.length)%articles.length;
 return {article:articles[index],number:String(index+1).padStart(2,'0')};
}

async function go(path=''){
 await page.goto(new URL(path,base).href);
 await page.waitForLoadState('networkidle');
}

async function assertDailyPlate(date){
 const {article,number}=expectedArticle(date);
 const art=page.locator('[data-daily-art]');
 const title=page.locator('[data-daily-title]');
 const category=page.locator('[data-daily-category]');
 const dailyNumber=page.locator('[data-daily-number]');
 const imageSrc=await art.getAttribute('src');
 assert.match(imageSrc||'',new RegExp(`assets/specimens/${article.id}\\.webp$`),'daily specimen art should match the selected article');
 assert.equal(await title.textContent().then(value=>value.trim()),article.title,'daily title should match the selected article');
 assert.equal(await category.textContent().then(value=>value.trim()),categoryTitles.get(article.category),'daily category should match the selected article');
 assert.match((await dailyNumber.textContent())||'',new RegExp(`\\b${number}\\b`),'daily number should be the article’s one-based padded position');
 await art.evaluate(image=>image.decode());
 assert.ok(await art.evaluate(image=>image.complete&&image.naturalWidth>0),'daily specimen image should load');
 const link=await page.locator('.open-book').getAttribute('href');
 assert.ok(link,'daily link should not be empty');
 assert.ok(new URL(link,page.url()).pathname.replace(/index\.html$/,'').endsWith(`/wonders/${article.id}/`),'daily link should open the article shown by the plate');
}

async function run(name,fn){
 try{await fn();results.push({name,passed:true});console.log('PASS',name);}
 catch(error){results.push({name,passed:false,error:error.message});console.error('FAIL',name,error.message);}
}

try{
 await run('daily specimen, title, category, number, image and link stay synchronized across local midnight',async()=>{
  const firstDate=new Date(Date.UTC(2026,9,19,12));
  await page.clock.install({time:new Date('2026-10-19T23:59:50+05:30')});
  await go();
  await assertDailyPlate(firstDate);

  const nextDate=new Date(Date.UTC(2026,9,20,12));
  await page.clock.fastForward(31000);
  await assertDailyPlate(nextDate);

  const reopenedDate=new Date(Date.UTC(2026,9,21,12));
  await page.clock.setSystemTime(reopenedDate);
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await assertDailyPlate(reopenedDate);
 });

 await run('reader specimen art belongs to the article being read',async()=>{
  const date=new Date(Date.UTC(2026,9,19,12));
  const {article}=expectedArticle(date);
  await page.clock.install({time:date});
  await go(`wonders/${article.id}/`);
  const readerArt=page.locator('.reader-specimen img');
  const src=await readerArt.getAttribute('src');
  assert.ok(src&&src.includes(article.id),'reader specimen source should identify the current article');
  assert.ok(await readerArt.evaluate(image=>image.complete&&image.naturalWidth>0),'reader specimen image should load');
 });

 await run('homepage keeps a meaningful daily plate and nonempty reading link without JavaScript',async()=>{
  const noScript=await browser.newContext({javaScriptEnabled:false,viewport:{width:1366,height:900},timezoneId:'UTC'});
  noScript.setDefaultTimeout(5000);
  try{
   const noScriptPage=await noScript.newPage();
   await noScriptPage.goto(new URL('',base).href);
   const image=noScriptPage.locator('[data-daily-art]');
   const imageSrc=await image.getAttribute('src');
   assert.ok(imageSrc,'static daily plate should include its specimen image');
   assert.ok(await image.evaluate(element=>element.complete&&element.naturalWidth>0),'static specimen image should load without JavaScript');
   assert.ok((await noScriptPage.locator('[data-daily-title]').textContent()||'').trim(),'static daily plate should have a title');
   const link=await noScriptPage.locator('.open-book').getAttribute('href');
   assert.ok(link&&link.trim()&&!link.startsWith('#'),'no-JavaScript reading link should be nonempty and useful');
  }finally{await noScript.close();}
 });
}finally{
 await browser.close();
}

console.log(`\n${results.filter(result=>result.passed).length}/${results.length} atlas checks passed.`);
if(results.some(result=>!result.passed))process.exitCode=1;
