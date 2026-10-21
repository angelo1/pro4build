const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync(require.resolve('../public/setubal-i18n.js'),'utf8');
function page(hash){
 const listeners={};const location={hash};
 const text={nodeValue:'  O teu nome * ',parentElement:{closest:()=>null}};
 const option={textContent:'Já tenho terreno',hasAttribute:()=>false};
 const input={value:'Ana',getAttribute:()=> 'Como te chamas?',setAttribute(k,v){this[k]=v}};
 const description={content:'Descrição em português'};
 const switches=['pt','en'].map(language=>({dataset:{language},setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]}}));
 const document={body:{},documentElement:{},title:'Uma moradia pelo valor de um apartamento? | Pro4build Setúbal',
  querySelectorAll(selector){if(selector==='select option')return [option];if(selector==='[placeholder]')return [input];if(selector==='[data-language]')return switches;if(selector.startsWith('meta['))return [description];return []},
  createTreeWalker(){let used=false;return {nextNode(){if(used)return null;used=true;return text}}}};
 const window={addEventListener:(name,fn)=>{listeners[name]=fn},dispatchEvent(){}};
 vm.runInNewContext(script,{document,window,location,NodeFilter:{SHOW_TEXT:4},CustomEvent:class{}});
 return {document,window,text,option,input,switches,change(hash){location.hash=hash;listeners.hashchange()}};
}
test('#en traduz conteúdo, placeholders, título e idioma mantendo os valores do formulário',()=>{
 const p=page('#en');assert.equal(p.document.documentElement.lang,'en');assert.equal(p.text.nodeValue,'  Your name * ');assert.equal(p.input.placeholder,'Your name');assert.equal(p.input.value,'Ana');assert.equal(p.option.value,'Já tenho terreno');assert.match(p.document.title,/A house/);assert.equal(p.switches[1]['aria-current'],'true');
 p.change('#pedido');assert.equal(p.document.documentElement.lang,'en');
 p.change('#pt');assert.equal(p.text.nodeValue,'  O teu nome * ');assert.equal(p.input.placeholder,'Como te chamas?');assert.equal(p.document.documentElement.lang,'pt-PT');assert.equal(p.input.value,'Ana');
});
test('português é o idioma inicial e as mensagens de envio têm tradução',()=>{
 const p=page('');assert.equal(p.window.setubalLanguage.get(),'pt');p.change('#en');assert.equal(p.window.setubalLanguage.t('A enviar o teu pedido…'),'Sending your enquiry…');assert.equal(p.window.setubalLanguage.t('Pedido enviado ✓'),'Enquiry sent ✓');
});
