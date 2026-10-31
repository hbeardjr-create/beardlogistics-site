const response=(status)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
export default async function(request){
 if(request.method!=='POST')return response(405);
 const own=new URL(request.url).origin,origin=request.headers.get('origin');
 if(!origin||origin!==own)return response(403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return response(415);
 const raw=await request.text();if(raw.length>3000)return response(413);
 let p;try{p=JSON.parse(raw);}catch{return response(400);}
 const industries=['dump-trucking','janitorial','pressure-washing','landscaping'];
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(!industries.includes(p.industry)||!uuid.test(p.event_id))return response(400);
 const clean=v=>typeof v==='string'?v.replace(/[^a-zA-Z0-9_. -]/g,'').slice(0,80):'';
 const userAgent=request.headers.get('user-agent')||'';
 const likely_automated=/bot\b|spider|crawler|headless|safelinks|proofpoint|mimecast|barracuda|urlscan|preview|scanner/i.test(userAgent)||request.headers.get('purpose')==='prefetch'||request.headers.get('sec-purpose')?.includes('prefetch')||false;
 const payload={event_id:p.event_id,industry:p.industry,link:uuid.test(p.link||'')?p.link:null,source:clean(p.source),medium:clean(p.medium),campaign:clean(p.campaign),referrer_host:typeof p.referrer_host==='string'&&/^[a-z0-9.-]{1,253}$/i.test(p.referrer_host)?p.referrer_host:'',likely_automated:Boolean(likely_automated),is_test:p.is_test===true};
 const key=Netlify.env.get('BLOS_PARTNER_SYNC_SECRET');if(!key)return response(503);
 try{const result=await fetch('https://beardlogistics-crm.netlify.app/.netlify/functions/partner-page-visit-intake',{method:'POST',headers:{'Content-Type':'application/json','x-blos-partner-key':key},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});return response(result.ok?204:502);}catch{return response(502);}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:30}};
