const crypto = require('node:crypto');
const blob = require('@vercel/blob');
const ORIGINS = new Set(['https://pro4build.com','https://www.pro4build.com']);
const MAX_SIZE = 50 * 1024 * 1024;
const TYPES = {
  memoria: {label:'Memória descritiva',extensions:['pdf','doc','docx']},
  arquitetura: {label:'Projeto de arquitetura',extensions:['zip']},
  especialidades: {label:'Projetos de especialidades',extensions:['zip']},
  quantidades: {label:'Mapas de quantidades',extensions:['pdf','xls','xlsx','csv','zip']}
};
const options = () => ({token:process.env.BLOB_READ_WRITE_TOKEN});
function sign(value) { return crypto.createHmac('sha256',process.env.BLOB_READ_WRITE_TOKEN).update(value).digest('hex'); }
function signed(value) { const encoded=Buffer.from(JSON.stringify(value)).toString('base64url'); return encoded+'.'+sign(encoded); }
function verify(token) {
  if(typeof token!=='string'||token.length>2000)throw Error('Invalid token');
  const [encoded,signature]=token.split('.');const expected=sign(encoded);
  if(!signature||signature.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))throw Error('Invalid token');
  const value=JSON.parse(Buffer.from(encoded,'base64url').toString());
  if(!Number.isFinite(value.expires)||value.expires<Date.now())throw Error('Expired token');
  return value;
}
function validPath(path,session) {
  if(typeof path!=='string')return false;
  const match=/^uploads\/([a-f0-9-]{36})\/(memoria|arquitetura|especialidades|quantidades)\.([a-z0-9]+)$/.exec(path);
  return !!match&&match[1]===session.id&&TYPES[match[2]].extensions.includes(match[3]);
}
async function documents(input) {
  if(input.documentos===undefined)return [];
  if(!Array.isArray(input.documentos)||input.documentos.length>4)throw Error('Invalid documents');
  if(!input.documentos.length)return [];
  const session=verify(input.sessaoDocumentos);const seen=new Set();
  const result=[];
  for(const item of input.documentos){
    if(!item||!validPath(item.path,session)||!TYPES[item.kind]||item.path.split('/')[2].split('.')[0]!==item.kind||seen.has(item.kind)||typeof item.name!=='string'||item.name.length>180||/[\r\n\x00-\x1f]/.test(item.name))throw Error('Invalid documents');
    seen.add(item.kind);
    const info=await blob.head(item.path,options());
    if(info.size>MAX_SIZE||info.size===0)throw Error('Invalid size');
    const ticket=signed({path:item.path,expires:Date.now()+30*86400000});
    result.push({kind:item.kind,name:item.name,size:info.size,label:TYPES[item.kind].label,url:'https://www.pro4build.com/api/documentos?ticket='+encodeURIComponent(ticket)});
  }
  return result;
}
async function claim(data,files){
  const normalized={...data,email:data.email.toLowerCase(),documentos:files.map(({kind,name,size})=>({kind,name,size}))};
  const hash=crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  const path='pedidos/'+hash+'.json';
  const opts={...options(),access:'private',addRandomSuffix:false,contentType:'application/json',ttlDays:7};
  try{await blob.put(path,JSON.stringify({state:'pending'}),{...opts,allowOverwrite:false});}
  catch(error){
    // Re-read only after a collision; a storage outage must never trigger email.
    const existing=await blob.get(path,{...options(),access:'private',useCache:false});
    if(!existing)throw error;
    const previous=await new Response(existing.stream).json();
    return {state:previous.state};
  }
  return {state:'new',async complete(){await blob.put(path,JSON.stringify({state:'sent'}),{...opts,allowOverwrite:true});}};
}
module.exports={ORIGINS,MAX_SIZE,TYPES,signed,verify,validPath,documents,claim,blob,options};
