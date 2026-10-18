(async()=>{
  const status=document.getElementById('status');
  document.getElementById('openCurrentPdf').addEventListener('click',async()=>{
    try{
      const [tab]=await chrome.tabs.query({active:true,currentWindow:true});const url=new URL(tab?.url||'');
      if(url.protocol!=='https:'||url.hostname!=='arxiv.org'||!url.pathname.startsWith('/pdf/')){status.textContent='Open an arXiv PDF tab first, then click the extension icon. Or paste its link in the PDF reader.';return;}
      await chrome.tabs.create({url:chrome.runtime.getURL('pdf.html')+'?pdf='+encodeURIComponent(url.href)});
    }catch{status.textContent='Open an arXiv PDF tab and click the extension icon, or paste its link in the PDF reader.';}
  });
  document.getElementById('openPdf').addEventListener('click',()=>chrome.tabs.create({url:chrome.runtime.getURL('pdf.html')}));
  // Wait for the worker to restrict storage to trusted extension contexts.
  await chrome.runtime.sendMessage({type:'getSettings'});
  const stored=await chrome.storage.local.get({...HoverCore.defaults,azureKey:'',azureRegion:'',mymemoryEmail:'',privacyConsentV1:false});
  let consent=!!stored.privacyConsentV1;document.getElementById('privacyNotice').hidden=consent;
  document.getElementById('acceptPrivacy').addEventListener('click',async()=>{
    const button=document.getElementById('acceptPrivacy');button.disabled=true;
    try{await chrome.storage.local.set({privacyConsentV1:true,enabled:true});consent=true;document.getElementById('enabled').checked=true;document.getElementById('privacyNotice').hidden=true;status.textContent='Automatic translation enabled. You can pause it anytime.';}
    catch{status.textContent='Could not save your choice. Try again.';}finally{button.disabled=false;}
  });
  for(const key of ['enabled','hover','selection','altOnly','delay']){
    const el=document.getElementById(key);if(el.type==='checkbox')el.checked=!!stored[key];else el.value=String(stored[key]);
    if(key==='delay'&&!el.value)el.value='650';
    el.addEventListener('change',async()=>{
      if(key==='enabled'&&el.checked&&!consent){el.checked=false;document.getElementById('privacyNotice').hidden=false;status.textContent='Read the privacy notice and choose Enable automatic translation first.';return;}
      el.disabled=true;try{await chrome.storage.local.set({[key]:el.type==='checkbox'?el.checked:Number(el.value)});status.textContent='Saved. Applies to open pages immediately.';}
      catch{status.textContent='Could not save. Try again.';}finally{el.disabled=false;}
    });
  }
  const provider=document.getElementById('provider');provider.value=stored.provider;
  for(const key of ['azureKey','azureRegion','mymemoryEmail'])document.getElementById(key).value=stored[key];
  function fields(){document.getElementById('azureFields').hidden=provider.value!=='azure';document.getElementById('mymemoryFields').hidden=provider.value!=='mymemory';}
  fields();provider.addEventListener('change',fields);
  document.getElementById('providerForm').addEventListener('submit',async e=>{
    e.preventDefault();const key=document.getElementById('azureKey').value.trim(),region=document.getElementById('azureRegion').value.trim(),email=document.getElementById('mymemoryEmail').value.trim();
    if(provider.value==='azure'&&!key){status.textContent='Enter an Azure API key, or choose MyMemory.';return;}
    if(key&&/\s/.test(key)){status.textContent='The API key must not contain whitespace.';return;}
    if(region&&!/^[a-z0-9-]+$/.test(region)){status.textContent='Use the region identifier, such as westeurope.';return;}
    const button=document.getElementById('saveProvider');button.disabled=true;status.textContent='Saving provider…';
    try{await chrome.storage.local.set({provider:provider.value,azureKey:key,azureRegion:region,mymemoryEmail:email});await chrome.runtime.sendMessage({type:'clearCache'});status.textContent='Provider saved. Hover a word to translate.';}
    catch{status.textContent='Could not save provider. Try again.';}finally{button.disabled=false;}
  });
  document.getElementById('clearCache').addEventListener('click',async()=>{
    try{const result=await chrome.runtime.sendMessage({type:'clearCache'});status.textContent=result.ok?'Translation cache cleared.':result.error;}
    catch{status.textContent='Could not clear cache. Reload the extension.';}
  });
})();
