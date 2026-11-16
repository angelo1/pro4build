(function(){
 document.querySelectorAll('form[data-two-step]').forEach(form=>{
  const steps=[...form.querySelectorAll('[data-form-step]')];
  const next=form.querySelector('[data-step-next]');
  const back=form.querySelector('[data-step-back]');
  const indicators=[...form.querySelectorAll('[data-step-indicator]')];
  let current=0;
  function show(index,focus=true){
   current=index;
   steps.forEach((step,i)=>{step.hidden=i!==index;step.disabled=i!==index&&i===1;});
   indicators.forEach((indicator,i)=>{if(i===index)indicator.setAttribute('aria-current','step');else indicator.removeAttribute('aria-current');});
   if(focus)steps[index].querySelector('input,select,textarea')?.focus();
  }
  function advance(){
   for(const field of steps[0].querySelectorAll('input'))if(!field.reportValidity())return;
   show(1);
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
