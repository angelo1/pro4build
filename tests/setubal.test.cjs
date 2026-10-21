const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync(require.resolve('../public/setubal.js'),'utf8');
function setup(ok){
  let submit,calls=0,body;
  const button={disabled:false},status={setAttribute(k,v){this[k]=v},focus(){},append(){}},mobile={hidden:false};
  const form={querySelector:()=>button,reportValidity:()=>true,setAttribute(){},removeAttribute(){},addEventListener(type,fn){submit=fn}};
  const nodes={'#setubal-form':form,'#form-status':status,'.mobile-cta':mobile,'#year':{}};
  const fields=[['nome','Teste'],['email','teste@example.test'],['telefone','+351 912 345 678'],['local','Setúbal'],['fase','Já tenho terreno'],['origem','/setubal']];
  vm.runInNewContext(script,{document:{querySelector:s=>nodes[s],createElement:()=>({})},window:{},FormData:class{[Symbol.iterator](){return fields[Symbol.iterator]()}},fetch:async(url,options)=>{assert.equal(url,'/api/contacto');calls++;body=JSON.parse(options.body);return {ok,json:async()=>ok?{ok:true}:{error:'SMTP indisponível'}}},AbortController,setTimeout,clearTimeout,Date,Error,TypeError});
  return {submit:()=>submit({preventDefault(){}}),button,status,mobile,calls:()=>calls,body:()=>body};
}
test('landing envia origem e bloqueia repetição após aceitação',async()=>{
  const page=setup(true);await page.submit();assert.equal(page.body().origem,'/setubal');assert.equal(page.button.disabled,true);assert.match(page.status.textContent,/aceite/);assert.equal(page.mobile.hidden,true);await page.submit();assert.equal(page.calls(),1);
});
test('landing permite corrigir falhas sem apresentar sucesso',async()=>{
  const page=setup(false);await page.submit();assert.equal(page.button.disabled,false);assert.equal(page.status.role,'alert');assert.match(page.status.textContent,/SMTP indisponível/);assert(!page.status.textContent.includes('Obrigado'));
});
