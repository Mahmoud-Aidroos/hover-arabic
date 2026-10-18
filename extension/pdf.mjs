import * as pdfjs from './vendor/pdfjs/build/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc=chrome.runtime.getURL('vendor/pdfjs/build/pdf.worker.mjs');
const $=id=>document.getElementById(id),host=$('pageHost'),status=$('readerStatus');
let loadingTask,doc,renderTask,textTask,currentPage=1,revision=0,resizeTimer,downloadController,downloadRevision=0;
function announce(text,error=false){status.textContent=text;status.classList.toggle('error',error);}
function controls(busy=false){const unavailable=!doc||busy;$('previous').disabled=unavailable||currentPage<=1;$('next').disabled=unavailable||currentPage>=doc.numPages;$('pageNumber').disabled=unavailable;$('zoom').disabled=unavailable;}
function dismiss(){document.dispatchEvent(new Event('hover-arabic-dismiss'));getSelection()?.removeAllRanges();}
function cancelRender(){renderTask?.cancel();textTask?.cancel();renderTask=null;textTask=null;dismiss();}
async function renderPage(number){
  if(!doc)return;const token=++revision;cancelRender();currentPage=Math.max(1,Math.min(doc.numPages,Math.round(number)||1));controls(true);$('pageNumber').value=currentPage;announce('Rendering page…');
  try{
    const page=await doc.getPage(currentPage);if(token!==revision)return;
    const unscaled=page.getViewport({scale:1});const available=Math.max(180,$('reader').clientWidth-50);
    const scale=$('zoom').value==='fit'?Math.min(3,available/unscaled.width):Number($('zoom').value);
    const viewport=page.getViewport({scale});
    if(viewport.width>16000||viewport.height>16000)throw Error('This page is too large at this zoom. Choose a smaller zoom.');
    const ratio=Math.min(window.devicePixelRatio||1,2,Math.sqrt(16000000/(viewport.width*viewport.height)));
    const canvas=document.createElement('canvas'),layer=document.createElement('div');layer.className='textLayer';layer.setAttribute('aria-label','PDF page text');
    canvas.width=Math.max(1,Math.floor(viewport.width*ratio));canvas.height=Math.max(1,Math.floor(viewport.height*ratio));canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';canvas.setAttribute('aria-hidden','true');
    host.style.width=viewport.width+'px';host.style.height=viewport.height+'px';host.style.setProperty('--scale-factor',scale);host.style.setProperty('--total-scale-factor',scale*viewport.userUnit);host.replaceChildren(canvas,layer);host.hidden=false;$('empty').hidden=true;
    const task=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:ratio===1?null:[ratio,0,0,ratio,0,0]});renderTask=task;await task.promise;
    if(token!==revision)return;
    const content=await page.getTextContent();if(token!==revision)return;
    const text=new pdfjs.TextLayer({textContentSource:content,container:layer,viewport});textTask=text;await text.render();if(token!==revision)return;
    host.dataset.renderedPage=String(currentPage);$('pageCount').textContent='of '+doc.numPages;$('pageNumber').max=doc.numPages;
    const hasText=content.items.some(item=>typeof item.str==='string'&&item.str.trim());
    announce(hasText?'Hover over English words, or select a short phrase, to translate into Arabic.':'No selectable text on this page. Scanned pages need OCR, which this reader does not include.');
    controls();
  }catch(error){
    if(token!==revision||error.name==='RenderingCancelledException'||error.name==='AbortException')return;
    announce(error.message?.startsWith('This page is too large')?error.message:'Could not render this page. Try another page, a lower zoom, or another PDF.',true);controls();
  }
}
async function openFile(file){
  if(!file)return;
  if(file.size>100*1024*1024){announce('This PDF is larger than 100 MB. Please open a smaller copy.',true);return;}
  if(!file.name.toLowerCase().endsWith('.pdf')&&file.type!=='application/pdf'){announce('Choose a PDF file.',true);return;}
  const token=++revision;cancelRender();const previousTask=loadingTask;loadingTask=null;doc=null;controls(true);host.hidden=true;host.replaceChildren();host.removeAttribute('data-rendered-page');$('empty').hidden=false;$('filename').textContent=file.name;$('pageCount').textContent='of 0';announce('Opening PDF locally…');
  try{
    if(previousTask)await previousTask.destroy();if(token!==revision)return;
    const data=new Uint8Array(await file.arrayBuffer());if(token!==revision)return;
    const base=chrome.runtime.getURL('vendor/pdfjs/');
    const task=pdfjs.getDocument({data,cMapUrl:base+'cmaps/',cMapPacked:true,standardFontDataUrl:base+'standard_fonts/',wasmUrl:base+'wasm/',iccUrl:base+'iccs/',useWorkerFetch:false,enableXfa:false,isEvalSupported:false});loadingTask=task;
    const pdf=await task.promise;if(token!==revision){await task.destroy();return;}
    doc=pdf;currentPage=1;$('pageCount').textContent='of '+doc.numPages;await renderPage(1);
  }catch(error){if(token!==revision)return;announce(error.name==='PasswordException'?'This PDF needs a password. Open an unlocked copy in this reader.':'Could not open this PDF. It may be damaged or unsupported. Try another PDF.',true);controls();}
}

function cancelDownload(){downloadRevision++;downloadController?.abort();downloadController=null;$('openPdfLink').disabled=false;}
async function openLink(raw){
  let url;
  try{url=new URL(raw);}catch{announce('Enter a valid arXiv PDF link.',true);return;}
  if(url.protocol!=='https:'||url.hostname!=='arxiv.org'||!url.pathname.startsWith('/pdf/')||url.username||url.password){announce('Online opening supports https://arxiv.org/pdf/ links. For other sites, download the PDF and use Open PDF.',true);return;}
  url.hash='';url.search='';cancelDownload();dismiss();
  const token=downloadRevision,controller=new AbortController();downloadController=controller;$('openPdfLink').disabled=true;$('pdfUrl').value=url.href;
  let timedOut=false;const timer=setTimeout(()=>{timedOut=true;controller.abort();},30000);
  announce('Downloading PDF from arXiv. It will open here with hover translation…');
  try{
    const response=await fetch(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw Error(response.status===404?'This arXiv PDF was not found. Check the link.':'arXiv could not provide this PDF. Download it manually and use Open PDF.');
    if(new URL(response.url).hostname!=='arxiv.org')throw Error('This link redirected outside arXiv. Download the PDF manually and use Open PDF.');
    const limit=100*1024*1024;if(Number(response.headers.get('Content-Length'))>limit)throw Error('This PDF is larger than 100 MB. Please use a smaller copy.');
    const reader=response.body.getReader(),chunks=[];let total=0;
    while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit){await reader.cancel();throw Error('This PDF is larger than 100 MB. Please use a smaller copy.');}chunks.push(value);}
    if(token!==downloadRevision)return;
    const blob=new Blob(chunks,{type:'application/pdf'});const prefix=await blob.slice(0,1024).text();
    if(!prefix.includes('%PDF-'))throw Error('The server returned a webpage instead of a PDF. Download the PDF manually and use Open PDF.');
    const id=url.pathname.slice('/pdf/'.length).replace(/[^A-Za-z0-9._-]/g,'-')||'arxiv-paper';
    const file=new File([blob],id.endsWith('.pdf')?id:id+'.pdf',{type:'application/pdf'});
    if(token===downloadRevision)await openFile(file);
  }catch(error){if(token!==downloadRevision)return;announce(timedOut?'PDF download timed out. Try again or download it manually and use Open PDF.':error.name==='AbortError'?'PDF download cancelled.':error.message?.startsWith('This ')||error.message?.startsWith('arXiv ')||error.message?.startsWith('The server ')?error.message:'Could not download the arXiv PDF. Check your connection, or save it and use Open PDF.',true);}
  finally{clearTimeout(timer);if(token===downloadRevision){downloadController=null;$('openPdfLink').disabled=false;}}
}
$('pdfLinkForm').addEventListener('submit',e=>{e.preventDefault();void openLink($('pdfUrl').value.trim());});
$('choosePdf').addEventListener('click',()=>$('pdfFile').click());
$('pdfFile').addEventListener('change',e=>{cancelDownload();void openFile(e.target.files[0]);e.target.value='';});
$('previous').addEventListener('click',()=>renderPage(currentPage-1));$('next').addEventListener('click',()=>renderPage(currentPage+1));
$('pageNumber').addEventListener('change',e=>renderPage(Number(e.target.value)));$('zoom').addEventListener('change',()=>renderPage(currentPage));
$('readerSettings').addEventListener('click',()=>chrome.runtime.openOptionsPage());
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(doc&&$('zoom').value==='fit')void renderPage(currentPage);},200);});
window.addEventListener('pagehide',()=>{cancelDownload();revision++;cancelRender();void loadingTask?.destroy();});

const linkedPdf=new URL(location.href).searchParams.get('pdf');if(linkedPdf)void openLink(linkedPdf);
