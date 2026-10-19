import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const cats=JSON.parse(fs.readFileSync(new URL('../content/categories.json',import.meta.url)));
const all=cats.flatMap(c=>JSON.parse(fs.readFileSync(new URL(`../content/${c.id}.json`,import.meta.url))));
test('launch library has sixty complete discoveries, ten per collection',()=>{
 assert.equal(cats.length,6);assert.equal(all.length,60);
 for(const c of cats)assert.equal(all.filter(a=>a.category===c.id).length,10,c.id);
 assert.equal(new Set(all.map(a=>a.id)).size,60);
 assert.equal(new Set(all.map(a=>a.title)).size,60);
 assert.equal(new Set(all.map(a=>a.opening)).size,60);
 for(const a of all){
  for(const key of ['id','title','category','opening','reflection','readingTime','visual'])assert.equal(typeof a[key],'string',`${a.id}: ${key}`);
  assert.ok(a.paragraphs.length>=2,`${a.id}: paragraphs`);
  const words=[a.opening,...a.paragraphs,a.reflection].join(' ').trim().split(/\s+/).length;
  assert.ok(words>=100&&words<=185,`${a.id}: ${words} words`);
  assert.ok(a.keywords.length>0,`${a.id}: keywords`);
  assert.ok(a.sources.length>0,`${a.id}: sources`);
  for(const s of a.sources){assert.ok(s.title);assert.equal(new URL(s.url).protocol,'https:');}
 }
});
