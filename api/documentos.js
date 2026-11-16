const {randomUUID,createHash} = require('node:crypto');
const {Readable} = require('node:stream');
const {handleUpload} = require('@vercel/blob/client');
const {ORIGINS,MAX_SIZE,TYPES,signed,verify,validPath,blob,options} = require('../lib/documentos');
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  if(req.method==='GET'){
   const {path}=verify(req.query?.ticket);
   if(typeof path!=='string'||!path.startsWith('uploads/'))throw Error('Invalid ticket');
   const result=await blob.get(path,{...options(),access:'private'});
   if(!result)return res.status(404).json({error:'Documento indisponível.'});
   res.setHeader('Content-Type','application/octet-stream');
   res.setHeader('Content-Disposition','attachment; filename="'+path.split('/').pop()+'"');
   res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
   return Readable.fromWeb(result.stream).pipe(res);
  }
  if(req.method!=='POST')return res.status(405).json({error:'Método não permitido.'});
  if(!ORIGINS.has(req.headers.origin))return res.status(403).json({error:'Origem não permitida.'});
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')||Number(req.headers['content-length'])>20000)throw Error('Invalid request');
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(body?.action==='session'){
   if(body.website||!/^\S+@\S+\.\S+$/.test(body.email||''))throw Error('Invalid session');
   const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
   const hash=createHash('sha256').update(ip+Math.floor(Date.now()/3600000)).digest('hex');
   let reserved=false;
   for(let i=0;i<10;i++){
    const path='limites/'+hash+'-'+i;
    try{await blob.put(path,'1',{...options(),access:'private',ttlDays:1,allowOverwrite:false,addRandomSuffix:false});reserved=true;break;}
    catch(error){if(!await blob.get(path,{...options(),access:'private',useCache:false}))throw error;}
   }
   if(!reserved)return res.status(429).json({error:'Demasiadas tentativas. Contacte geral@pro4build.com.'});
   return res.status(200).json({session:signed({id:randomUUID(),expires:Date.now()+3600000})});
  }
  const result=await handleUpload({body,request:req,token:process.env.BLOB_READ_WRITE_TOKEN,
   onBeforeGenerateToken:async(path,payload)=>{
    const session=verify(payload);if(!validPath(path,session))throw Error('Invalid path');
    return {maximumSizeInBytes:MAX_SIZE,validUntil:Math.min(session.expires,Date.now()+900000),addRandomSuffix:false,allowOverwrite:false,ttlDays:30,
     allowedContentTypes:['application/pdf','application/zip','application/x-zip-compressed','application/octet-stream','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv']};
   }});
  return res.status(200).json(result);
 }catch{return res.status(400).json({error:'Não foi possível carregar ou aceder ao documento. Verifique o formato, o tamanho e tente novamente.'});}
};
