const tr=text=>window.setubalLanguage?.t(text)||text;
const form=document.querySelector('#setubal-form');
const status=document.querySelector('#form-status');
const button=form.querySelector('[type="submit"]');
const mobileCta=document.querySelector('.mobile-cta');
document.querySelector('#year').textContent=new Date().getFullYear();
let sent=false;
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(button.disabled||sent||!form.reportValidity())return;
  button.disabled=true;form.setAttribute('aria-busy','true');status.hidden=false;
  status.setAttribute('role','status');status.textContent=tr('A enviar o teu pedido…');
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),35000);
  try{
    const response=await fetch('/api/contacto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:controller.signal});
    const data=await response.json();
    if(!response.ok||data.ok!==true)throw new Error(data.error||tr('Não foi possível confirmar o envio.'));
    sent=true;try{window.pro4buildPixel?.lead();}catch{}
    status.textContent=tr('Obrigado! O teu pedido foi aceite pelo serviço de email para envio à Pro4build. Vamos analisar a informação para entrar em contacto contigo. Não precisas de voltar a enviar.');
    button.textContent=tr('Pedido enviado ✓');mobileCta.hidden=true;
  }catch(error){
    status.setAttribute('role','alert');
    const message=error.name==='AbortError'||error instanceof TypeError?tr('A ligação foi interrompida e não foi possível confirmar o envio. Contacta-nos antes de repetir o pedido.'):error.message;
    status.textContent=tr(message)+tr(' Podes escrever para ');
    const link=document.createElement('a');link.href='mailto:geral@pro4build.com';link.textContent='geral@pro4build.com';status.append(link);button.disabled=false;
  }finally{clearTimeout(timeout);form.removeAttribute('aria-busy');status.focus({preventScroll:true});}
});
if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{if(!sent)mobileCta.hidden=entries[0].isIntersecting},{threshold:0.05}).observe(form);
}

window.addEventListener?.('pro4build:language',()=>{
 if(sent){
  status.textContent=tr('Obrigado! O teu pedido foi aceite pelo serviço de email para envio à Pro4build. Vamos analisar a informação para entrar em contacto contigo. Não precisas de voltar a enviar.');
  button.textContent=tr('Pedido enviado ✓');
 }
});
