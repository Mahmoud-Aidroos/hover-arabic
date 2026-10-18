/* Shared pure input handling; no network or page access. */
(function(root){
  const defaults={enabled:false,hover:true,selection:true,altOnly:false,delay:650,provider:'mymemory'};
  function normalize(s){return typeof s==='string'?s.replace(/’/g,"'").trim().replace(/\s+/g,' '):'';}
  function valid(s){return typeof s==='string'&&s.length<=160&&/^[A-Za-z]+(?:['-][A-Za-z]+)*(?: [A-Za-z]+(?:['-][A-Za-z]+)*)*$/.test(s);}
  function wordAt(text,offset){const rx=/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g;let m;while((m=rx.exec(text))){if(offset>=m.index&&offset<=m.index+m[0].length)return {word:m[0],start:m.index,end:m.index+m[0].length};}return null;}
  root.HoverCore={defaults,normalize,valid,wordAt};
})(globalThis);
