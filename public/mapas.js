const tr=text=>window.setubalLanguage?.t(text)||text;
const form=document.querySelector('#mapas-form');
const status=document.querySelector('#form-status');
const button=form.querySelector('[type="submit"]');
const mobileCta=document.querySelector('.mobile-cta');
document.querySelector('#year').textContent=new Date().getFullYear();
let sent=false;
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(button.disabled||sent||!form.reportValidity())return;
  button.disabled=true;form.setAttribute('aria-busy','true');status.hidden=false;
  status.setAttribute('role','status');status.textContent=tr('A enviar o seu pedido…');
  let timeout;
  const controller=new AbortController();
  try{
    const payload=Object.fromEntries(new FormData(form));payload.etapa='2';
    for(const key of Object.keys(payload))if(typeof payload[key]!=='string')delete payload[key];
    await window.pro4buildDocuments?.prepare(form,payload);
    status.textContent=tr('A enviar o seu pedido…');
    timeout=setTimeout(()=>controller.abort(),35000);
    const response=await fetch('/api/contacto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
    const data=await response.json();
    if(!response.ok||data.ok!==true)throw new Error(data.error||tr('Não foi possível confirmar o envio.'));
    sent=true;try{window.pro4buildPixel?.lead();}catch{}
    status.textContent=tr('Obrigado! O seu pedido de mapas de quantidades foi recebido. Vamos analisar os elementos e entrar em contacto para confirmar o âmbito, as condições e o início do prazo. Não precisa de voltar a enviar.');
    button.textContent=tr('Pedido enviado ✓');mobileCta.hidden=true;
  }catch(error){
    status.setAttribute('role','alert');
    const message=error.name==='AbortError'||error instanceof TypeError?tr('A ligação foi interrompida e não foi possível confirmar o envio. Contacte-nos antes de repetir o pedido.'):error.message;
    status.textContent=tr(message)+tr(' Pode escrever para ');
    const link=document.createElement('a');link.href='mailto:geral@pro4build.com';link.textContent='geral@pro4build.com';status.append(link);button.disabled=false;
  }finally{clearTimeout(timeout);form.removeAttribute('aria-busy');status.focus({preventScroll:true});}
});
if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{if(!sent)mobileCta.hidden=entries[0].isIntersecting},{threshold:0.05}).observe(form);
}

window.addEventListener?.('pro4build:language',()=>{
 if(sent){
  status.textContent=tr('Obrigado! O seu pedido de mapas de quantidades foi recebido. Vamos analisar os elementos e entrar em contacto para confirmar o âmbito, as condições e o início do prazo. Não precisa de voltar a enviar.');
  button.textContent=tr('Pedido enviado ✓');
 }
});
