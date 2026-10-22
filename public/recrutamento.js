(function(){
 const form=document.querySelector('#recruitment-form');
 const role=document.querySelector('#recruitment-role');
 const status=document.querySelector('#recruitment-status');
 const button=form.querySelector('[type="submit"]');
 let sent=false;
 document.querySelectorAll('[data-job]').forEach(link=>link.addEventListener('click',()=>{role.value=link.dataset.job;}));
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(sent||button.disabled||!form.reportValidity())return;
  button.disabled=true;form.setAttribute('aria-busy','true');status.hidden=false;status.setAttribute('role','status');status.textContent='A enviar a candidatura…';
  try{
   const response=await fetch('/api/contacto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:AbortSignal.timeout(35000)});
   const result=await response.json();
   if(!response.ok||result.ok!==true)throw Error('Não foi possível confirmar o envio.');
   sent=true;button.textContent='Candidatura enviada ✓';status.textContent='A candidatura foi aceite pelo serviço de email para envio à equipa de recrutamento. Obrigado pelo seu interesse na Pro4build.';
  }catch{
   status.setAttribute('role','alert');status.textContent='Não foi possível confirmar o envio. Antes de repetir a candidatura, contacte ';
   const email=document.createElement('a');email.href='mailto:recrutamento@pro4build.com';email.textContent='recrutamento@pro4build.com';status.append(email);button.disabled=false;
  }finally{form.removeAttribute('aria-busy');status.focus({preventScroll:true});}
 });
})();
