importScripts('core.js');
const C=HoverCore,TTL=24*60*60*1000,MAX_CACHE=500,CACHE_KEY='onlineCacheV2';
const cache=new Map(),pending=new Map(),cooldown=new Map();
let epoch=0,active=0,nextStart=0,saveChain=Promise.resolve();
const ready=(async()=>{
  // Keys and cached text are available only to trusted extension contexts.
  await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
  await chrome.storage.session.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
  const consent=await chrome.storage.local.get({privacyConsentV1:false});
  if(!consent.privacyConsentV1)await chrome.storage.local.set({enabled:false});
  await chrome.storage.local.remove('online'); // Remove obsolete v1 manual-lookup setting.
  const stored=(await chrome.storage.session.get(CACHE_KEY))[CACHE_KEY];
  if(Array.isArray(stored))for(const [key,value] of stored.slice(-MAX_CACHE)){
    if(typeof key==='string'&&value&&typeof value.text==='string'&&value.expires>Date.now())cache.set(key,value);
  }
})();
function persist(){saveChain=saveChain.catch(()=>{}).then(()=>chrome.storage.session.set({[CACHE_KEY]:[...cache]}));return saveChain;}
async function clearCache(){await ready;epoch++;cache.clear();await persist();}
async function publicSettings(){const stored=await chrome.storage.local.get(C.defaults);return Object.fromEntries(Object.keys(C.defaults).map(k=>[k,stored[k]]));}
function providerName(p){return p==='azure'?'Azure Translator':'MyMemory';}
function arabic(text){return typeof text==='string'&&text.length<=4000&&/\p{Script=Arabic}/u.test(text);}
function pauseFor(provider,milliseconds){cooldown.set(provider,Date.now()+milliseconds);}
async function request(text,settings,generation){
  const provider=settings.provider;
  if(provider!=='azure'&&provider!=='mymemory')return {error:'Choose a translation provider in extension settings.'};
  if(provider==='azure'&&!settings.azureKey?.trim())return {error:'Add your Azure Translator key in extension settings, or choose MyMemory (no key).'};
  if((cooldown.get(provider)||0)>Date.now())return {error:'Provider is temporarily paused after an error or quota limit. Try again later.'};
  if(active>=3)return {error:'Several translations are in progress. Hover again in a moment.'};
  active++;
  const scheduled=Math.max(Date.now(),nextStart);nextStart=scheduled+350;
  const controller=new AbortController();let timer;
  try{
    const wait=scheduled-Date.now();if(wait>0)await new Promise(resolve=>setTimeout(resolve,wait));
    const current=await chrome.storage.local.get({enabled:true});
    if(generation!==epoch||!current.enabled)return {error:'Settings changed. Hover again.'};
    timer=setTimeout(()=>controller.abort(),10000);
    const options={signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'};
    let url;
    if(provider==='azure'){
      url=new URL('https://api.cognitive.microsofttranslator.com/translate');
      url.search=new URLSearchParams({'api-version':'3.0',from:'en',to:'ar',textType:'plain'}).toString();
      options.method='POST';options.headers={'Content-Type':'application/json; charset=UTF-8','Ocp-Apim-Subscription-Key':settings.azureKey.trim()};
      if(settings.azureRegion?.trim())options.headers['Ocp-Apim-Subscription-Region']=settings.azureRegion.trim();
      options.body=JSON.stringify([{Text:text}]);
    }else{
      url=new URL('https://api.mymemory.translated.net/get');url.searchParams.set('q',text);url.searchParams.set('langpair','en|ar');
      if(settings.mymemoryEmail?.trim())url.searchParams.set('de',settings.mymemoryEmail.trim());
    }
    const response=await fetch(url,options);
    if(response.status===401||response.status===403){pauseFor(provider,30000);return {error:'Provider denied access. Check your API key, region, quota and subscription in settings.'};}
    if(response.status===429){const seconds=Number(response.headers.get('Retry-After'));pauseFor(provider,Math.max(30000,Math.min(300000,Number.isFinite(seconds)?seconds*1000:60000)));return {error:'Translation quota or rate limit reached. Wait a minute or change provider in settings.'};}
    if(!response.ok){pauseFor(provider,10000);return {error:'Translation service is unavailable. Try again later.'};}
    const data=await response.json();let result;
    if(provider==='azure')result=data?.[0]?.translations?.find(t=>t.to==='ar')?.text;
    else{
      if(data.quotaFinished||Number(data.responseStatus)===429||Number(data.responseStatus)===403){pauseFor(provider,60000);return {error:'MyMemory quota reached. Try later or switch to Azure in settings.'};}
      if(Number(data.responseStatus)!==200)return {error:'MyMemory could not translate this text. Try again later.'};
      result=data.responseData?.translatedText;
      // Some translation-memory records use legacy, visually ordered Arabic glyphs.
      // Prefer a near-exact modern Unicode alternative before normalizing those forms.
      if(typeof result==='string'&&/[\uFB50-\uFDFF\uFE70-\uFEFF]/.test(result)){
        const alternative=data.matches?.find(m=>Number(m.match)>=0.95&&arabic(m.translation)&&!/[\uFB50-\uFDFF\uFE70-\uFEFF]/.test(m.translation));
        if(alternative)result=alternative.translation;
      }
    }
    if(typeof result==='string')result=result.normalize('NFKC');
    if(!arabic(result))return {error:'The service returned no usable Arabic translation. Try another word or provider.'};
    return {text:result,source:providerName(provider),cached:false};
  }catch(e){pauseFor(provider,5000);return {error:e.name==='AbortError'?'Translation timed out. Hover again to retry.':'Cannot reach the translation service. Check your internet connection.'};}
  finally{clearTimeout(timer);active--;}
}
async function translate(raw){
  await ready;
  const text=C.normalize(raw);if(!C.valid(text))return {error:'Select English words only (up to 160 characters).'};
  const settings=await chrome.storage.local.get({...C.defaults,azureKey:'',azureRegion:'',mymemoryEmail:'',privacyConsentV1:false});
  if(!settings.enabled||!settings.privacyConsentV1)return {error:'Open extension settings and enable translation after reading the privacy notice.'};
  const key=JSON.stringify([settings.provider,'en','ar',text]);
  const cached=cache.get(key);
  if(cached&&cached.expires>Date.now()){
    cache.delete(key);cache.set(key,cached);return {text:cached.text,source:cached.source,cached:true};
  }
  if(cached)cache.delete(key);
  const generation=epoch,pendingKey=generation+':'+key;
  if(pending.has(pendingKey))return pending.get(pendingKey);
  const promise=(async()=>{
    const result=await request(text,settings,generation);
    if(generation!==epoch)return {error:'Settings or cache changed. Hover again.'};
    if(result.text){
      cache.set(key,{text:result.text,source:result.source,expires:Date.now()+TTL});
      while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
      // A full session store must not discard an otherwise successful translation.
      await persist().catch(()=>{});
    }
    return result;
  })();
  pending.set(pendingKey,promise);
  try{return await promise;}finally{pending.delete(pendingKey);}
}
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
  const isExtensionPage=sender.url?.startsWith(chrome.runtime.getURL(''));
  let job;
  if(msg?.type==='getSettings')job=ready.then(publicSettings);
  else if(msg?.type==='translate')job=translate(msg.text);
  else if(msg?.type==='clearCache'&&isExtensionPage)job=clearCache().then(()=>({ok:true}));
  else return;
  job.then(reply,()=>reply({error:'Could not translate. Reload the page or extension and try again.'}));return true;
});
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area!=='local')return;
  if(['provider','azureKey','azureRegion','mymemoryEmail','enabled'].some(key=>key in changes)){
    // Invalidate immediately, including requests still in flight.
    epoch++;cache.clear();void ready.then(persist).catch(()=>{});cooldown.clear();
  }
  if(Object.keys(changes).some(k=>k in C.defaults)){
    void ready.then(publicSettings).then(async settings=>{
      const tabs=await chrome.tabs.query({});
      await Promise.allSettled(tabs.map(tab=>chrome.tabs.sendMessage(tab.id,{type:'settingsChanged',settings})));
    }).catch(()=>{});
  }
});
