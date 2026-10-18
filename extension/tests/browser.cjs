// npm install --no-save playwright; node tests/browser.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
(async()=>{
 const root=path.resolve(__dirname,'..'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'hover-arabic-'));
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(__dirname,'demo.html')));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let context;let checks=0;const pass=s=>{checks++;console.log('PASS',s)};
 try{
 context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',headless:true,viewport:{width:1280,height:800},ignoreDefaultArgs:['--disable-extensions'],args:['--no-sandbox','--enable-unsafe-extension-debugging']});
 const browserCDP=await context.browser().newBrowserCDPSession();const {id}=await browserCDP.send('Extensions.loadUnpacked',{path:root});pass('Manifest V3 extension loads in Chrome');
 const settings=await context.newPage();await settings.goto(`chrome-extension://${id}/settings.html`);await settings.waitForFunction(()=>!document.getElementById('privacyNotice').hidden);
 const worker=context.serviceWorkers().find(w=>w.url().startsWith(`chrome-extension://${id}/`));assert(worker);
 await worker.evaluate(()=>{globalThis.__realFetch=fetch;globalThis.__calls=[];globalThis.__scenario='ok';globalThis.fetch=async(url,options)=>{
   __calls.push({url:String(url),headers:options.headers||{},body:options.body||'',credentials:options.credentials,referrerPolicy:options.referrerPolicy});
   if(__scenario==='slow')await new Promise(r=>setTimeout(r,1100));
   if(__scenario==='quota')return new Response('{}',{status:429,headers:{'Retry-After':'30'}});
   if(__scenario==='network')throw new TypeError('test network failure');
   const data=String(url).includes('microsofttranslator')?[{translations:[{to:'ar',text:'ترجمة تجريبية'}]}]:{responseStatus:200,responseData:{translatedText:'ترجمة تجريبية'}};
   return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
 };});
 const count=()=>worker.evaluate(()=>__calls.length);
 const message=msg=>settings.evaluate(msg=>chrome.runtime.sendMessage(msg),msg);
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));context.on('request',r=>{if(r.url().startsWith('https://api.mymemory'))requests.push(r.url())});
 await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForTimeout(300);
 page.setDefaultTimeout(5000);const cdp=await context.newCDPSession(page);
 async function card(){const {root:doc}=await cdp.send('DOM.getDocument',{depth:-1,pierce:true});let target;function visit(n){if(n.nodeName==='SECTION'&&n.attributes?.includes('Arabic translation'))target=n;for(const c of [...(n.children||[]),...(n.shadowRoots||[])])visit(c);}visit(doc);if(!target)return null;const {object}=await cdp.send('DOM.resolveNode',{backendNodeId:target.backendNodeId});const {result}=await cdp.send('Runtime.callFunctionOn',{objectId:object.objectId,functionDeclaration:`function(){const h=this.getRootNode().host;const r=h.getBoundingClientRect();return {text:this.innerText,visible:getComputedStyle(h).display!=='none',rtl:!!this.querySelector('[dir="rtl"][lang="ar"]'),x:r.x,y:r.y,right:r.right,bottom:r.bottom}}`,returnByValue:true});return result.value;}
 async function hover(selector){await page.locator(selector).hover();await page.waitForTimeout(900);return card();}
 assert.equal(await settings.locator('#enabled').isChecked(),false);await hover('#hello');assert.equal(await count(),0);assert.equal(await card(),null);pass('Fresh installation sends no text before the privacy enable choice');
 const policyEvent=context.waitForEvent('page');await settings.bringToFront();await settings.locator('a[href="privacy.html"]').click();const policy=await policyEvent;await policy.waitForLoadState();assert((await policy.locator('body').innerText()).includes('aidroos7@gmail.com'));await policy.close();pass('Privacy policy opens locally and includes the confirmed public support address');
 await settings.bringToFront();await settings.locator('#acceptPrivacy').click();await settings.waitForFunction(()=>document.getElementById('enabled').checked);await page.bringToFront();await page.mouse.move(0,0);

 let popup=await hover('#hello');assert(popup?.visible&&popup.text.includes('ترجمة تجريبية'));assert(popup.rtl);pass('Hover automatically calls online provider and renders RTL Arabic');
 await page.screenshot({path:path.join(root,'preview.png')});
 await page.keyboard.press('Escape');await page.waitForTimeout(80);assert(!(await card()).visible);pass('Escape dismisses');
 popup=await hover('#split');assert(popup.text.includes('ترجمة تجريبية'));pass('Words split across inline formatting');
 const initialRequests=await count();await page.keyboard.press('Escape');await page.waitForTimeout(80);await page.mouse.move(0,0);popup=await hover('#hello');assert(popup.text.includes('cached'));assert.equal(await count(),initialRequests);pass('Repeated hover uses cached online result without another request');
 popup=await hover('#extra');assert(popup.text.includes('ترجمة تجريبية'));assert(popup.text.includes('online'));pass('Arbitrary English word translates online without a dictionary');
 await page.locator('input').hover();await page.waitForTimeout(600);assert(!(await card()).visible);pass('Editable input skipped');
 await page.locator('#space').hover();await page.waitForTimeout(600);assert(!(await card()).visible);pass('Whitespace does not snap to a nearby word');
 // Real drag selection triggers pointerup.
 const b=await page.locator('#phrase').boundingBox();await page.mouse.move(b.x,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+125,b.y+b.height/2,{steps:12});await page.mouse.up();await page.waitForTimeout(500);popup=await card();assert(popup.visible&&popup.text.includes('hello world'));pass('Mouse text selection');
 await page.evaluate(()=>getSelection().removeAllRanges());await page.keyboard.press('Escape');await page.waitForTimeout(80);
 await settings.bringToFront();await settings.locator('#altOnly').check();await page.bringToFront();await page.mouse.move(0,0);await hover('#book');assert(!(await card()).visible);await page.keyboard.down('Alt');popup=await hover('#book');assert(popup.visible&&popup.text.includes('ترجمة تجريبية'));await page.keyboard.up('Alt');await page.waitForTimeout(80);assert(!(await card()).visible);pass('Alt-only mode and Alt release');
 await settings.bringToFront();await settings.locator('#altOnly').uncheck();await settings.locator('#enabled').uncheck();await page.bringToFront();await hover('#hello');assert(!(await card()).visible);pass('Pause updates open page');
 await settings.bringToFront();await settings.locator('#enabled').check();await page.bringToFront();popup=await hover('#edge');const viewport=page.viewportSize();assert(popup.visible&&popup.x>=0&&popup.y>=0&&popup.right<=viewport.width&&popup.bottom<=viewport.height);pass('Popup clamped at viewport edge');
 await page.evaluate(()=>window.scrollBy(0,50));await page.waitForTimeout(100);assert(!(await card()).visible);pass('Scroll dismisses');
 await page.locator('#phrase').scrollIntoViewIfNeeded();await page.waitForTimeout(100);await page.evaluate(()=>{const n=document.getElementById('phrase').firstChild;const r=document.createRange();r.setStart(n,0);r.setEnd(n,1);const s=getSelection();s.removeAllRanges();s.addRange(r);});
 await page.keyboard.down('Shift');for(let i=0;i<4;i++)await page.keyboard.press('ArrowRight');await page.keyboard.up('Shift');await page.waitForTimeout(250);popup=await card();assert(popup.visible&&popup.text.includes('ترجمة تجريبية'));pass('Keyboard text selection');
 await page.evaluate(()=>getSelection().removeAllRanges());await page.keyboard.press('Escape');await page.waitForTimeout(80);
 await page.locator('iframe').scrollIntoViewIfNeeded();const frame=page.frames().find(f=>f.parentFrame());await frame.locator('p').hover({position:{x:20,y:8}});await page.waitForTimeout(900);
 assert(await frame.evaluate(()=>[...document.documentElement.children].some(el=>el.style.zIndex==='2147483647'&&el.style.display==='block')));pass('Inherited srcdoc iframe receives hover translation');
 // Reload settings to confirm persistence.
 await settings.reload();assert(await settings.locator('#enabled').isChecked());assert.equal(await settings.locator('#provider').inputValue(),'mymemory');pass('Settings persist with no-key online provider');

 await settings.bringToFront();await settings.locator('#clearCache').click();await settings.waitForFunction(()=>document.getElementById('status').textContent.includes('cache cleared'));const beforeClear=await count();
 await page.bringToFront();await page.locator('#hello').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await hover('#hello');assert.equal(await count(),beforeClear+1);pass('Clear-cache settings action forces next hover to call provider');
 // Hide before a deliberately slow translation completes. It must not reopen.
 await message({type:'clearCache'});await worker.evaluate(()=>__scenario='slow');await page.mouse.move(0,0);await page.locator('#extra').hover();await page.waitForTimeout(730);await page.keyboard.press('Escape');await page.waitForTimeout(1200);assert(!(await card()).visible);pass('Late online response cannot reopen dismissed popup');await worker.evaluate(()=>__scenario='ok');
 await settings.bringToFront();await settings.locator('#provider').selectOption('azure');await settings.locator('#azureKey').fill('fake-test-key');await settings.locator('#azureRegion').fill('westeurope');await settings.locator('#saveProvider').click();await settings.waitForFunction(()=>document.getElementById('status').textContent.includes('Provider saved'));
 await page.bringToFront();await page.mouse.move(0,0);popup=await hover('#hello');assert(popup.text.includes('Azure Translator'));const azureCall=await worker.evaluate(()=>__calls.at(-1));assert.equal(azureCall.headers['Ocp-Apim-Subscription-Key'],'fake-test-key');assert.equal(azureCall.headers['Ocp-Apim-Subscription-Region'],'westeurope');assert.equal(JSON.parse(azureCall.body)[0].Text,'hello');assert(!azureCall.url.includes('fake-test-key'));const publicSettings=await message({type:'getSettings'});assert(!('azureKey' in publicSettings));pass('Provider form configures Azure POST and never exposes credentials in public settings');
 // Test trusted-only storage from the real isolated content-script world.
 const contexts=[];cdp.on('Runtime.executionContextCreated',event=>contexts.push(event.context));await cdp.send('Runtime.enable');await page.waitForTimeout(100);const isolated=contexts.find(c=>c.name==='Hover Arabic — Online Translator');assert(isolated,'Content-script execution context should be present');
 const access=await cdp.send('Runtime.evaluate',{contextId:isolated.id,expression:"chrome.storage.local.get('azureKey').then(v=>({leaked:!!v.azureKey}),()=>({denied:true}))",awaitPromise:true,returnByValue:true});assert(!access.exceptionDetails&&access.result.value&&(access.result.value.denied||access.result.value.leaked===false));pass('Webpage content-script context cannot read stored API key');
 await message({type:'clearCache'});await worker.evaluate(()=>__scenario='quota');await page.mouse.move(0,0);popup=await hover('#extra');assert(popup.text.includes('quota or rate limit'));const afterQuota=await count();await page.keyboard.press('Escape');await page.mouse.move(0,0);popup=await hover('#extra');assert(popup.text.includes('temporarily paused'));assert.equal(await count(),afterQuota);pass('Provider quota response produces helpful error and suppresses retry storms');
 assert.deepEqual(errors,[]);pass('No page errors during tested online flow');
 if(process.env.LIVE_TRANSLATION==='1'){
   await settings.bringToFront();await settings.locator('#provider').selectOption('mymemory');await settings.locator('#saveProvider').click();await settings.waitForFunction(()=>document.getElementById('status').textContent.includes('Provider saved'));await message({type:'clearCache'});await worker.evaluate(()=>{fetch=__realFetch;});
   const live=await message({type:'translate',text:'hello'});console.log('LIVE MYMEMORY',JSON.stringify(live));assert(live.text&&/[\u0600-\u06ff]/.test(live.text),'Live MyMemory must return Arabic');pass('Live no-key MyMemory HTTPS translation');await page.bringToFront();await page.locator('#hello').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await hover('#hello');await page.screenshot({path:path.join(root,'preview.png')});
 }

 console.log(`${checks} browser checks passed; Chrome ${context.browser().version()}`);
 }finally{await context?.close();await new Promise(r=>server.close(r));fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1});
