(()=>{
  const C=HoverCore;let settings={...C.defaults,enabled:false},timer,sequence=0,host,ui,lastKey='',dragging=false;
  const pdfReader=location.protocol==='chrome-extension:'&&location.pathname==='/pdf.html';
  const blocked=el=>!el || (pdfReader&&!el.closest('.textLayer')) || !!el.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],script,style,noscript');
  const inside=e=>host && e.composedPath().includes(host);
  function hide(){clearTimeout(timer);sequence++;lastKey='';if(host)host.style.display='none';}
  function place(x,y){if(!host)return;host.style.left='0px';host.style.top='0px';const r=host.getBoundingClientRect();host.style.left=Math.max(8,Math.min(x+12,innerWidth-r.width-8))+'px';host.style.top=Math.max(8,Math.min(y+18,innerHeight-r.height-8))+'px';}
  function create(){
    if(host)return;
    host=document.createElement('div');host.style.cssText='all:initial;position:fixed!important;z-index:2147483647!important;display:block;';
    const shadow=host.attachShadow({mode:'closed'});
    const style=document.createElement('style');style.textContent=`
      :host{color-scheme:light}*{box-sizing:border-box}.card{width:290px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;background:#fff;color:#162c38;border:1px solid #b8cbd0;border-radius:13px;box-shadow:0 8px 32px #102b3840;padding:14px;font:14px/1.5 system-ui,sans-serif;text-align:left}
      header{display:flex;justify-content:space-between;gap:12px}strong{overflow-wrap:anywhere}button{font:inherit;cursor:pointer;border:1px solid #c1d5d8;border-radius:7px;background:#eef7f6;color:#07594e;padding:5px 9px}button:focus-visible{outline:2px solid #087c6c}.close{padding:0 7px;background:white}.result{text-align:right;margin:12px 0;font:23px/1.7 system-ui,sans-serif;overflow-wrap:anywhere}.status{margin:9px 0;font-size:13px;color:#516774}.source{font-size:11px;color:#52676f}footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}`;
    const card=document.createElement('section');card.className='card';card.setAttribute('role','region');card.setAttribute('aria-label','Arabic translation');
    const header=document.createElement('header'),word=document.createElement('strong'),close=document.createElement('button');close.textContent='×';close.className='close';close.setAttribute('aria-label','Close translation');close.onclick=hide;header.append(word,close);
    const result=document.createElement('div');result.setAttribute('aria-live','polite');
    const footer=document.createElement('footer'),source=document.createElement('span');source.className='source';footer.append(source);card.append(header,result,footer);shadow.append(style,card);document.documentElement.append(host);ui={word,result,source};
  }
  async function show(text,x,y){
    if(!settings.enabled)return;const normalized=C.normalize(text);if(!C.valid(normalized))return;
    const id=++sequence;create();host.style.display='block';ui.word.textContent=text;ui.result.className='status';ui.result.removeAttribute('dir');ui.result.removeAttribute('lang');ui.result.textContent='Translating online…';ui.source.textContent='';place(x,y);
    let response;try{response=await chrome.runtime.sendMessage({type:'translate',text:normalized});}catch{response={error:'Extension updated. Reload this page.'};}
    if(id!==sequence || !settings.enabled)return;
    ui.result.textContent=response?.text || response?.error || 'Translation unavailable. Check extension settings.';
    if(response?.text){ui.result.className='result';ui.result.dir='rtl';ui.result.lang='ar';}else ui.result.className='status';
    ui.source.textContent=response?.source ? response.source+(response.cached?' · cached':' · online') : 'Online translation';place(x,y);
  }
  function hovered(x,y){
    let caret;
    if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(x,y);if(p)caret={node:p.offsetNode,offset:p.offset};}
    else if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(x,y);if(r)caret={node:r.startContainer,offset:r.startOffset};}
    if(!caret || caret.node.nodeType!==Node.TEXT_NODE || blocked(caret.node.parentElement))return null;
    // Join inline text within the same block so <b>trans</b>lation works.
    let block=caret.node.parentElement;
    while(block.parentElement && getComputedStyle(block).display==='inline')block=block.parentElement;
    let nodes=[],text='',offset=-1;
    const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT,{acceptNode:n=>blocked(n.parentElement)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    let n;while((n=walker.nextNode())){if(text.length+n.length>12000){nodes=[];break;}if(n===caret.node)offset=text.length+caret.offset;nodes.push({node:n,start:text.length});text+=n.textContent;}
    if(!nodes.length || offset<0){nodes=[{node:caret.node,start:0}];text=caret.node.textContent;offset=caret.offset;}
    const match=C.wordAt(text,offset);if(!match)return null;
    const first=nodes.find(a=>match.start>=a.start && match.start<a.start+a.node.length);
    const last=nodes.find(a=>match.end>a.start && match.end<=a.start+a.node.length);if(!first || !last)return null;
    const range=document.createRange();range.setStart(first.node,match.start-first.start);range.setEnd(last.node,match.end-last.start);
    // Caret APIs snap to nearby text, so require the pointer to touch a glyph box.
    if(!Array.from(range.getClientRects()).some(r=>x>=r.left && x<=r.right && y>=r.top && y<=r.bottom))return null;
    return {word:match.word,node:first.node,start:match.start};
  }
  let lastNode,lastStart;
  document.addEventListener('pointermove',e=>{
    if(inside(e))return;
    if(!settings.enabled || !settings.hover || dragging || (settings.altOnly&&!e.altKey) || blocked(e.target) || !getSelection()?.isCollapsed){hide();return;}
    const hit=hovered(e.clientX,e.clientY);if(!hit){hide();return;}
    if(lastKey===hit.word && lastNode===hit.node && lastStart===hit.start)return;
    hide();lastKey=hit.word;lastNode=hit.node;lastStart=hit.start;
    timer=setTimeout(()=>show(hit.word,e.clientX,e.clientY),Math.max(150,Math.min(1500,Number(settings.delay)||650)));
  },{passive:true});
  document.addEventListener('pointerdown',e=>{if(inside(e))return;dragging=true;hide();},true);
  document.addEventListener('pointerup',e=>{
    dragging=false;if(inside(e)||!settings.enabled||!settings.selection||blocked(e.target))return;
    const selection=getSelection();if(!selection || selection.isCollapsed || !selection.rangeCount)return;
    if(blocked(selection.anchorNode?.parentElement)||blocked(selection.focusNode?.parentElement))return;
    const text=selection.toString().trim().replace(/\s+/g,' ');if(!C.valid(text))return;
    const r=selection.getRangeAt(0).getBoundingClientRect();show(text,r.left,r.bottom);
  });
  document.addEventListener('keyup',e=>{if(e.key==='Alt'&&settings.altOnly)hide();if(e.key.startsWith('Arrow')&&e.shiftKey&&settings.selection&&settings.enabled){const s=getSelection();if(s&&!s.isCollapsed&&!blocked(s.anchorNode?.parentElement)&&!blocked(s.focusNode?.parentElement)){const r=s.getRangeAt(0).getBoundingClientRect();show(s.toString().trim().replace(/\s+/g,' '),r.left,r.bottom);}}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  document.addEventListener('hover-arabic-dismiss',hide);
  document.addEventListener('pointerleave',hide);window.addEventListener('blur',()=>{dragging=false;hide();});window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
  chrome.runtime.sendMessage({type:'getSettings'}).then(s=>{if(s&&!s.error)settings={...C.defaults,...s};}).catch(()=>{});
  if(pdfReader)chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local')chrome.runtime.sendMessage({type:'getSettings'}).then(s=>{if(s&&!s.error){settings={...C.defaults,...s};hide();}}).catch(()=>{});});
  chrome.runtime.onMessage.addListener(msg=>{if(msg?.type==='settingsChanged'){settings={...C.defaults,...msg.settings};hide();}});
})();
