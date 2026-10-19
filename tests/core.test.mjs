import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const path = new URL('../assets/core.js', import.meta.url);
test('core implementation exists', () => assert.ok(fs.existsSync(path), 'Discovery helpers have not been implemented'));
if (fs.existsSync(path)) {
  const {dailyArticle,filterArticles,randomArticle,parseCollection,mergeCollection} = await import(path);
  const articles=[{id:'a',title:'A ship',category:'thinking-room',keywords:['identity']},{id:'b',title:'A fern',category:'natures-secrets',keywords:['plant']},{id:'c',title:'The moon',category:'natures-secrets',keywords:['space']}];
  test('daily discovery is stable and changes on consecutive calendar dates',()=>{
    assert.equal(dailyArticle(articles,new Date(2026,9,19)).id,dailyArticle(articles,new Date(2026,9,19,23,59)).id);
    assert.notEqual(dailyArticle(articles,new Date(2026,9,19)).id,dailyArticle(articles,new Date(2026,9,20)).id);
    assert.equal(dailyArticle([],new Date()),null);
    assert.equal(dailyArticle(articles,new Date('bad')),null);
  });
  test('search matches title or keywords and respects category',()=>{
    assert.deepEqual(filterArticles(articles,'IDENTITY','all').map(x=>x.id),['a']);
    assert.deepEqual(filterArticles(articles,'fern','natures-secrets').map(x=>x.id),['b']);
    assert.deepEqual(filterArticles(articles,'fern','thinking-room'),[]);
    assert.equal(filterArticles(articles,'','all').length,3);
  });
  test('random article avoids immediate repeats within chosen collection',()=>{
    assert.equal(randomArticle(articles,'b','natures-secrets',()=>0).id,'c');
    assert.equal(randomArticle(articles,'a','thinking-room',()=>0).id,'a');
    assert.equal(randomArticle([],'a','all'),null);
  });
  test('imports reject invalid shapes and retain unknown IDs safely',()=>{
    assert.deepEqual(parseCollection({version:1,favourites:['a','unknown','a']}),['a','unknown']);
    for(const value of [null,{}, {version:2,favourites:[]},{version:1,favourites:[5]},{version:1,favourites:['../escape']}]) assert.throws(()=>parseCollection(value));
    assert.deepEqual(mergeCollection(['a','old'],['a','b']),['a','old','b']);
  });
}
