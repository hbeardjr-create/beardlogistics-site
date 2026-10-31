import { createHash } from 'node:crypto';
export default {
 async formSubmitted(event){
  const data=event.data||{};
  const industry=data['partner-industry'];
  if(!['dump-trucking','janitorial','pressure-washing','landscaping'].includes(industry))return;
  if(data['bot-field'])return;
  const key=Netlify.env.get('BLOS_PARTNER_SYNC_SECRET');if(!key)throw Error('Partner sync is not configured');
  const source_id='netlify:'+industry+':'+(data['submission-key']||createHash('sha256').update(JSON.stringify(data)).digest('hex'));
  const response=await fetch('https://beardlogistics-crm.netlify.app/.netlify/functions/industry-partner-intake',{method:'POST',headers:{'Content-Type':'application/json','x-blos-partner-key':key},body:JSON.stringify({industry,source_id,company_name:data.company||data['company-name']||'',email:data.email||'',phone:data.phone||'',raw_payload:data}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Partner sync failed: '+response.status);
 }
};
