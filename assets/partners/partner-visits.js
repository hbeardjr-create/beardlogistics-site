/* Cookie-free page views. No IP, email, or persistent visitor identifier is collected by this script. */
(function(){
'use strict';
const paths={'dump-truck-partners':'dump-trucking','janitorial-partners':'janitorial','pressure-washing-partners':'pressure-washing','landscaping-partners':'landscaping'};
const slug=location.pathname.replace(/^\/+|\/+$/g,'').replace(/\.html$/,''),industry=paths[slug];if(!industry)return;
const params=new URLSearchParams(location.search),event_id=crypto.randomUUID();let sent=false;
function track(){
 if(sent||document.visibilityState!=='visible')return;sent=true;
 let referrer_host='';try{referrer_host=new URL(document.referrer).hostname;}catch{}
 const clean=k=>(params.get(k)||'').replace(/[^a-zA-Z0-9_. -]/g,'').slice(0,80);
 const data={event_id,industry,link:params.get('ref')||'',source:clean('utm_source'),medium:clean('utm_medium'),campaign:clean('utm_campaign'),referrer_host,is_test:params.get('tracking_test')==='1'};
 fetch('/.netlify/functions/partner-page-visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),keepalive:true}).catch(()=>{});
}
if(document.visibilityState==='visible')track();else document.addEventListener('visibilitychange',track);
})();
