import {upload} from '@vercel/blob/client';
let session;
const uploaded=new Map();
window.pro4buildDocuments={async prepare(form,payload){
 const inputs=[...form.querySelectorAll('input[type="file"][data-document]')].filter(input=>input.files.length);
 if(!inputs.length)return;
 const status=form.querySelector('#form-status, #send-status');
 for(const input of inputs){
  const file=input.files[0];const extension=file.name.split('.').pop().toLowerCase();
  if(file.size===0||file.size>50*1024*1024)throw Error((window.setubalLanguage?.t||((text)=>text))('Cada documento deve ter entre 1 byte e 50 MB.'));
  if(!input.accept.split(',').includes('.'+extension))throw Error((window.setubalLanguage?.t||((text)=>text))('Selecione um ficheiro num dos formatos indicados.'));
 }
 if(!session){
  const response=await fetch('/api/documentos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'session',email:payload.email,website:payload.website})});
  const result=await response.json();if(!response.ok||!result.session)throw Error((window.setubalLanguage?.t||((text)=>text))('Não foi possível iniciar o carregamento dos documentos.'));
  session=result.session;
 }
 const id=JSON.parse(atob(session.split('.')[0].replace(/-/g,'+').replace(/_/g,'/'))).id;
 payload.documentos=[];payload.sessaoDocumentos=session;
 for(const input of inputs){
  const file=input.files[0];const kind=input.dataset.document;
  const path='uploads/'+id+'/'+kind+'.'+file.name.split('.').pop().toLowerCase();
  const prior=uploaded.get(kind);
  if(prior&&prior.file!==file)throw Error((window.setubalLanguage?.t||((text)=>text))('Para alterar um documento já carregado, atualize a página antes de enviar o pedido.'));
  if(!prior){
   status.textContent=(window.setubalLanguage?.t||((text)=>text))('A carregar documentos…');
   await upload(path,file,{access:'private',handleUploadUrl:'/api/documentos',clientPayload:session,multipart:true,contentType:file.type||'application/octet-stream'});
   uploaded.set(kind,{file});
  }
  payload.documentos.push({kind,path,name:file.name});
 }
}};
