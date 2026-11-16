(function(){
 document.querySelectorAll('form[data-two-step]').forEach(form=>{
  const steps=[...form.querySelectorAll('[data-form-step]')];
  const next=form.querySelector('[data-step-next]');
  const back=form.querySelector('[data-step-back]');
  const indicators=[...form.querySelectorAll('[data-step-indicator]')];
  const status=form.querySelector('[data-step-status]');
  const tr=text=>window.setubalLanguage?.t(text)||text;
  let current=0,acceptedContacts='',pending=false;
  function message(text,error=false){status.hidden=false;status.setAttribute('role',error?'alert':'status');status.textContent=tr(text);}

  function show(index,focus=true){
   current=index;
   steps.forEach((step,i)=>{step.hidden=i!==index;step.disabled=i!==index&&i===1;});
   indicators.forEach((indicator,i)=>{if(i===index)indicator.setAttribute('aria-current','step');else indicator.removeAttribute('aria-current');});
   if(focus)steps[index].querySelector('input,select,textarea')?.focus();
  }
  async function advance(){
   if(pending)return;
   for(const field of steps[0].querySelectorAll('input'))if(!field.reportValidity())return;
   const payload={etapa:'1',origem:form.querySelector('[name="origem"]')?.value||'/'};
   steps[0].querySelectorAll('input[name]').forEach(input=>{payload[input.name]=input.value;});
   payload.website=form.querySelector('[name="website"]')?.value||'';
   const fingerprint=JSON.stringify(payload);
   if(acceptedContacts===fingerprint){show(1);return;}
   pending=true;next.disabled=true;form.setAttribute('aria-busy','true');
   message('A enviar os contactos…');
   try{
    const response=await fetch('/api/contacto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(35000)});
    const result=await response.json();
    if(!response.ok||result.ok!==true)throw Error(result.error||'Não foi possível confirmar o envio.');
    acceptedContacts=fingerprint;
    try{window.pro4buildPixel?.lead();}catch{}
    message('Contactos recebidos. Podes agora completar os dados do projeto.');
    show(1);
   }catch(error){
    const text=error.name==='TimeoutError'||error.name==='AbortError'||error instanceof TypeError?'A ligação foi interrompida e não foi possível confirmar o envio. Contacta-nos antes de repetir o pedido.':error.message;
    message(text,true);status.focus({preventScroll:true});
   }finally{pending=false;next.disabled=false;form.removeAttribute('aria-busy');}
  }
  next.addEventListener('click',advance);
  steps[0].addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();advance();}});
  back.addEventListener('click',()=>{if(form.getAttribute('aria-busy')!=='true')show(0);});
  form.addEventListener('submit',event=>{
   if(current===0){event.preventDefault();event.stopImmediatePropagation();advance();}
  },true);
  // Preserve access to every field if JavaScript is unavailable.
  next.hidden=false;back.hidden=false;show(0,false);
 });
})();
