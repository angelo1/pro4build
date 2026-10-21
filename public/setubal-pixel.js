(function(){
  const PIXEL='1188357206101087';
  const KEY='pro4build-marketing-v1';
  const TTL=180*24*60*60*1000;
  const banner=document.querySelector('#marketing-consent');
  let consent=false,loaded=false,leadSent=false;
  function save(accepted){try{localStorage.setItem(KEY,JSON.stringify({accepted,at:Date.now()}));}catch{}}
  function loadPixel(){
    if(loaded)return;
    loaded=true;
    if(!window.fbq){
      const q=function(){q.callMethod?q.callMethod.apply(q,arguments):q.queue.push(arguments)};
      window.fbq=q;window._fbq=q;q.push=q;q.loaded=true;q.version='2.0';q.queue=[];
      const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(script);
    }
    window.fbq('consent','grant');
    // No automatic form events or advanced matching: only explicit events below.
    window.fbq('set','autoConfig',false,PIXEL);
    window.fbq('init',PIXEL);
    window.fbq('track','PageView');
  }
  function removeMarketingCookies(){
    for(const cookie of ['_fbp','_fbc']){
      for(const domain of ['',location.hostname,'.pro4build.com']){
        document.cookie=cookie+'=; Max-Age=0; path=/; SameSite=Lax; Secure'+(domain?'; domain='+domain:'');
      }
    }
  }
  function choose(accepted){
    consent=accepted;save(accepted);banner.hidden=true;
    if(accepted){
      if(loaded)window.fbq('consent','grant');else loadPixel();
    }else{
      if(window.fbq)window.fbq('consent','revoke');
      removeMarketingCookies();
    }
  }
  document.querySelector('#marketing-accept').addEventListener('click',()=>choose(true));
  document.querySelector('#marketing-reject').addEventListener('click',()=>choose(false));
  document.querySelector('#marketing-preferences').addEventListener('click',()=>{banner.hidden=false;document.querySelector('#marketing-reject').focus();});
  window.pro4buildPixel={lead(){
    if(!consent||!loaded||leadSent)return;
    leadSent=true;
    try{window.fbq('track','Lead',{content_name:'Landing Setubal'});}catch{}
  }};
  let previous;
  try{previous=JSON.parse(localStorage.getItem(KEY));}catch{}
  if(previous&&typeof previous.accepted==='boolean'&&typeof previous.at==='number'&&Date.now()-previous.at>=0&&Date.now()-previous.at<TTL){
    consent=previous.accepted;banner.hidden=true;if(consent)loadPixel();
  }else banner.hidden=false;
})();
