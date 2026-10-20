const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createHandler} = require('../api/contacto.js');
const env = {SMTP_HOST:'smtp.example.test',SMTP_PORT:'587',SMTP_USER:'geral@pro4build.com',SMTP_PASSWORD:'test-only'};
const body = {nome:'Ana',email:'ana@example.test',telefone:'+351 912 345 678',local:'Sesimbra',fase:'Já tenho terreno',ideia:'Moradia T3'};
function request(overrides={}) { return {method:'POST',headers:{origin:'https://www.pro4build.com','content-type':'application/json'},body:{...body},...overrides}; }
function response() { return {headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(data){this.data=data;return this}}; }

test('aceita o pedido só após confirmação SMTP, com destino fixo e Reply-To do visitante',async()=>{
  let options,mail,closed=false;
  const handler=createHandler({env,createTransport:opts=>{options=opts;return {sendMail:async data=>{mail=data;return {accepted:['geral@pro4build.com']}},close(){closed=true}}}});
  const res=response();await handler(request({body:{...body,to:'intruso@example.test'}}),res);
  assert.equal(res.code,202);assert.equal(res.data.ok,true);assert.equal(mail.to,'geral@pro4build.com');
  assert.equal(mail.replyTo.address,body.email);assert.equal(mail.from.address,env.SMTP_USER);
  assert.equal(options.requireTLS,true);assert.equal(options.secure,false);assert(closed);assert.match(mail.text,/Sesimbra/);
});
test('porta 465 usa TLS desde o início',async()=>{
  let options;const handler=createHandler({env:{...env,SMTP_PORT:'465'},createTransport:opts=>{options=opts;return {sendMail:async()=>({accepted:['geral@pro4build.com']}),close(){}}}});
  await handler(request(),response());assert.equal(options.secure,true);
});
test('falha SMTP não apresenta sucesso nem expõe informação interna',async()=>{
  const handler=createHandler({env,createTransport:()=>({sendMail:async()=>{throw Error('password-private')},close(){}})});
  const res=response();await handler(request(),res);assert.equal(res.code,502);assert(!JSON.stringify(res.data).includes('password-private'));assert.equal(res.data.ok,undefined);
});
test('SMTP sem destinatário aceite não confirma o envio',async()=>{
  const handler=createHandler({env,createTransport:()=>({sendMail:async()=>({accepted:[],rejected:['geral@pro4build.com']}),close(){}})});
  const res=response();await handler(request(),res);assert.equal(res.code,502);
});
test('sem credenciais não tenta enviar',async()=>{
  const handler=createHandler({env:{},createTransport:()=>{throw Error('Não deve ser chamado')}});
  const res=response();await handler(request(),res);assert.equal(res.code,503);
});
test('rejeita origem externa, métodos errados, JSON inválido e honeypot',async()=>{
  const handler=createHandler({env,createTransport:()=>{throw Error('Não deve ser chamado')}});
  for(const [req,expected] of [[request({method:'GET'}),405],[request({headers:{origin:'https://outro.test','content-type':'application/json'}}),403],[request({body:'{'}),400],[request({body:{...body,website:'spam'}}),400]]){
    const res=response();await handler(req,res);assert.equal(res.code,expected);
  }
});
test('rejeita email com injeção de cabeçalhos, campos obrigatórios vazios e mensagens longas',async()=>{
  const handler=createHandler({env,createTransport:()=>{throw Error('Não deve ser chamado')}});
  for(const fields of [{email:'ana@example.test\r\nBcc: intruso@example.test'},{telefone:''},{nome:[]},{ideia:'x'.repeat(10001)}]){
    const res=response();await handler(request({body:{...body,...fields}}),res);assert.equal(res.code,400);
  }
});
