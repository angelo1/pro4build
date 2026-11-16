const {test}=require('node:test');const assert=require('node:assert/strict');
process.env.BLOB_READ_WRITE_TOKEN='test-only-document-token';
const docs=require('../lib/documentos');
const id='12345678-1234-1234-1234-123456789abc';
test('sessão assinada rejeita adulteração e expiração',()=>{
 const valid=docs.signed({id,expires:Date.now()+60000});assert.equal(docs.verify(valid).id,id);
 assert.throws(()=>docs.verify(valid+'x'));assert.throws(()=>docs.verify(docs.signed({id,expires:1})));
});
test('documentos respeitam categoria, extensão e sessão',()=>{
 assert(docs.validPath('uploads/'+id+'/arquitetura.zip',{id}));
 for(const path of ['uploads/'+id+'/arquitetura.exe','uploads/'+id+'/memoria.zip','pedidos/private.json','uploads/00000000-1234-1234-1234-123456789abc/memoria.pdf'])assert.equal(docs.validPath(path,{id}),false);
});
test('formulário sem documentos continua válido; URLs externas e documentos repetidos são rejeitados',async()=>{
 assert.deepEqual(await docs.documents({}),[]);
 await assert.rejects(()=>docs.documents({sessaoDocumentos:docs.signed({id,expires:Date.now()+60000}),documentos:[{kind:'memoria',name:'memoria.pdf',path:'https://evil.test/memoria.pdf'}]}));
});
test('reserva persistente impede concorrência e distingue confirmação de estado incerto',async()=>{
 const originalPut=docs.blob.put,originalGet=docs.blob.get;const saved=new Map();
 docs.blob.put=async(path,content,options)=>{if(saved.has(path)&&!options.allowOverwrite)throw Error('exists');saved.set(path,content);};
 docs.blob.get=async path=>saved.has(path)?{stream:new Response(saved.get(path)).body}:null;
 try{
  const data={email:'ana@example.test',nome:'Ana'};
  const results=await Promise.all([docs.claim(data,[]),docs.claim(data,[]),docs.claim(data,[])]);
  assert.equal(results.filter(x=>x.state==='new').length,1);assert.equal(results.filter(x=>x.state==='pending').length,2);
  await results.find(x=>x.state==='new').complete();assert.equal((await docs.claim(data,[])).state,'sent');
 }finally{docs.blob.put=originalPut;docs.blob.get=originalGet;}
});
