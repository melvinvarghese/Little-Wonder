import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root = path.resolve(new URL('..',import.meta.url).pathname);
test('static build creates all required public entry points',()=>{
  assert.ok(fs.existsSync(path.join(root,'scripts/build.mjs')),'Static generator not implemented');
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root});
  for(const route of ['index.html','shelf/index.html','collection/index.html','categories/index.html','about/index.html','how-it-works/index.html','sources/index.html','privacy/index.html','404.html']) assert.ok(fs.existsSync(path.join(root,route)),route);
});
test('all generated local links and assets resolve beneath project base path',()=>{
  const manifest=path.join(root,'site-manifest.json');
  assert.ok(fs.existsSync(manifest),'Build manifest missing');
  for(const file of JSON.parse(fs.readFileSync(manifest)).pages){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(html,/<html lang="en"/);
    assert.match(html,/<h1[ >]/);
    for(const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
      if(/^(?:https?:|mailto:|data:|#)/.test(link)) continue;
      assert.ok(!link.startsWith('/'),`${file}: root-relative ${link}`);
      const target=path.resolve(path.dirname(path.join(root,file)),decodeURIComponent(link.split(/[?#]/)[0]));
      assert.ok(target.startsWith(root+path.sep),`${file}: escapes project`);
      assert.ok(fs.existsSync(target),`${file}: broken ${link}`);
    }
  }
});
