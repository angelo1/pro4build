const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../public/setubal-pixel.js'),'utf8');
function page(previous){
 const controls={};for(const id of ['marketing-consent','marketing-accept','marketing-reject','marketing-preferences'])controls['#'+id]={hidden:true,addEventListener(type,fn){this.click=fn},focus(){}};
 const scripts=[],cookies=[];let saved=previous?JSON.stringify(previous):null;
 const document={querySelector:s=>controls[s],createElement:()=>({}),head:{append:s=>scripts.push(s)}};
 Object.defineProperty(document,'cookie',{set:value=>cookies.push(value)});
 const window={};
 vm.runInNewContext(source,{document,window,location:{hostname:'www.pro4build.com'},localStorage:{getItem:()=>saved,setItem:(key,value)=>{saved=value}},Date,JSON});
 return {window,scripts,cookies,controls,saved:()=>JSON.parse(saved),events:()=>window.fbq?window.fbq.queue.map(args=>Array.from(args)):[]};
}
test('nenhuma ligação à Meta nem Lead antes do consentimento ou após recusa',()=>{
 const p=page();assert.equal(p.scripts.length,0);assert.equal(p.controls['#marketing-consent'].hidden,false);p.window.pro4buildPixel.lead();assert.equal(p.events().length,0);p.controls['#marketing-reject'].click();assert.equal(p.saved().accepted,false);assert.equal(p.scripts.length,0);p.window.pro4buildPixel.lead();assert.equal(p.events().length,0);
});
test('aceitação carrega o Pixel correto uma vez, e Lead é enviado uma única vez',()=>{
 const p=page();p.controls['#marketing-accept'].click();assert.equal(p.scripts.length,1);assert.equal(p.scripts[0].src,'https://connect.facebook.net/en_US/fbevents.js');assert(p.events().some(e=>e[0]==='init'&&e[1]==='1188357206101087'));assert.equal(p.events().filter(e=>e[1]==='PageView').length,1);
 p.window.pro4buildPixel.lead();p.window.pro4buildPixel.lead();assert.equal(p.events().filter(e=>e[1]==='Lead').length,1);assert(!JSON.stringify(p.events()).includes('email'));
 p.controls['#marketing-preferences'].click();assert.equal(p.controls['#marketing-consent'].hidden,false);p.controls['#marketing-reject'].click();assert(p.events().some(e=>e[0]==='consent'&&e[1]==='revoke'));assert(p.cookies.some(c=>c.startsWith('_fbp=')));assert(p.cookies.some(c=>c.startsWith('_fbc=')));
});
test('escolhas guardadas são respeitadas e consentimentos expirados não carregam o Pixel',()=>{
 const accepted=page({accepted:true,at:Date.now()});assert.equal(accepted.scripts.length,1);
 const rejected=page({accepted:false,at:Date.now()});assert.equal(rejected.scripts.length,0);assert.equal(rejected.controls['#marketing-consent'].hidden,true);
 const expired=page({accepted:true,at:Date.now()-181*24*60*60*1000});assert.equal(expired.scripts.length,0);assert.equal(expired.controls['#marketing-consent'].hidden,false);
});
