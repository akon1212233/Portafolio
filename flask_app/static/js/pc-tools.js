(() => {
'use strict';
const el=(tag,cls='',text='')=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n;};
const btn=(text,fn)=>{const b=el('button','',text);b.type='button';b.addEventListener('click',fn);return b;};
let built={},files=Object.create(null);
const valid=name=>/^[a-zA-Z0-9_.-]{1,48}$/.test(name)&&!['__proto__','prototype','constructor','.','..'].includes(name);
function persist(){try{localStorage.setItem('akon-pc-files',JSON.stringify(files));return true;}catch{return false;}}
const read=name=>Object.hasOwn(built,name)?built[name]:Object.hasOwn(files,name)?files[name]:null;
function create(name){if(!valid(name))throw Error('Usa un nombre de hasta 48 letras, números, puntos, guiones o _.');if(read(name)!==null)return;if(Object.keys(files).length>=20)throw Error('Límite de 20 archivos alcanzado.');files[name]='';persist();}
function editor(host,name,back){
 create(name);const panel=el('section','terminal-editor');const head=el('div','editor-head','GNU nano / '+name);const label=el('label','sr-only','Contenido de '+name);label.htmlFor='nano-content';const area=el('textarea','nano-content');area.id='nano-content';area.value=read(name);area.maxLength=10000;area.spellcheck=false;area.readOnly=Object.hasOwn(built,name);
 const status=el('p','tool-status',area.readOnly?'Archivo del sistema: solo lectura.':'Editando · guarda con Ctrl+S');status.setAttribute('role','status');
 const save=()=>{if(area.readOnly)return;files[name]=area.value;status.textContent=persist()?'Guardado en este navegador.':'Guardado solo durante esta visita; almacenamiento bloqueado.';};
 let dirty=false;area.addEventListener('input',()=>{dirty=true;status.textContent='Cambios sin guardar';});const leave=()=>{if(dirty&&!confirm('¿Salir y descartar los cambios sin guardar?'))return;back();};
 const tools=el('div','tool-actions');tools.append(btn('^S Guardar',()=>{save();dirty=false;}),btn('Salir',leave));panel.append(head,label,area,status,tools);host.append(panel);
 panel.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save();dirty=false;}if(e.key==='Tab'&&e.target===area){e.preventDefault();area.setRangeText('  ',area.selectionStart,area.selectionEnd,'end');dirty=true;}});area.focus();
}
function manager(host,back,open){
 const box=el('section','terminal-files');box.tabIndex=0;const heading=el('div','editor-head','yazi / ~ /');const layout=el('div','yazi-layout'),list=el('div','yazi-list'),preview=el('pre','yazi-preview');let index=0,hidden=false,names=[];
 const status=el('p','tool-status','↑ ↓ o j/k · Enter/l abrir · h/q volver · . ocultos');
 function render(){names=Object.keys({...built,...files}).filter(n=>hidden||!n.startsWith('.'));index=Math.max(0,Math.min(index,names.length-1));list.replaceChildren();names.forEach((name,i)=>{const b=btn(name,()=>{index=i;render();});b.className=i===index?'selected':'';b.setAttribute('aria-pressed',String(i===index));b.addEventListener('dblclick',()=>open(name));list.append(b);});preview.textContent=read(names[index])||'[archivo vacío]';box.focus({preventScroll:true});}
 box.addEventListener('keydown',e=>{if(['ArrowDown','j','ArrowUp','k','Enter','l','h','q','.'].includes(e.key)){e.preventDefault();if(['ArrowDown','j'].includes(e.key))index++;else if(['ArrowUp','k'].includes(e.key))index--;else if(['Enter','l'].includes(e.key)){open(names[index]);return;}else if(['h','q'].includes(e.key)){back();return;}else hidden=!hidden;render();}});
 const actions=el('div','tool-actions');actions.append(btn('Abrir seleccionado',()=>open(names[index])),btn('Volver a terminal',back));layout.append(list,preview);box.append(heading,layout,status,actions);host.append(box);render();box.focus();
}
function paint(host,pixels,palette,savePixels,download){
 const box=el('section','pixel-studio');let color=palette[1],drawing=false,last=-1,undo=[],redo=[];
 const head=el('div','editor-head','PIXEL STUDIO / 12 × 8');const tools=el('div','pixel-colors');const status=el('p','tool-status','Arrastra para dibujar. Cada trazo puede deshacerse.');status.setAttribute('role','status');
 const names=['Borrador','Verde','Ámbar','Coral','Azul','Marfil'];const grid=el('div','pixel-canvas');grid.setAttribute('role','group');grid.setAttribute('aria-label','Lienzo de 12 por 8');
 const snapshot=()=>{undo.push([...pixels]);if(undo.length>50)undo.shift();redo=[];};
 const sync=()=>{[...grid.children].forEach((n,i)=>{n.style.background=pixels[i];n.setAttribute('aria-label',`Píxel ${i+1}, ${names[palette.indexOf(pixels[i])]}`);});status.textContent=savePixels(pixels)?'Dibujo guardado.':'Dibujo solo durante esta visita.';};
 const fill=i=>{if(i===last)return;last=i;pixels[i]=color;sync();};
 palette.forEach((value,i)=>{const b=btn(names[i],()=>{color=value;[...tools.children].forEach(n=>n.setAttribute('aria-pressed',String(n===b)));});b.style.setProperty('--swatch',value);b.setAttribute('aria-pressed',String(value===color));tools.append(b);});
 pixels.forEach((_,i)=>{const b=btn('',event=>{if(drawing||event.detail>0)return;snapshot();last=-1;fill(i);});b.addEventListener('pointerdown',e=>{e.preventDefault();snapshot();drawing=true;last=-1;grid.setPointerCapture(e.pointerId);fill(i);});grid.append(b);});
 grid.addEventListener('pointermove',e=>{if(!drawing)return;const hit=document.elementFromPoint(e.clientX,e.clientY);const i=[...grid.children].indexOf(hit);if(i>=0)fill(i);});
 const end=()=>{drawing=false;last=-1;};for(const type of ['pointerup','pointercancel','lostpointercapture'])grid.addEventListener(type,end);
 const actions=el('div','tool-actions');actions.append(btn('↶ Deshacer',()=>{if(!undo.length)return;redo.push([...pixels]);pixels.splice(0,pixels.length,...undo.pop());sync();}),btn('↷ Rehacer',()=>{if(!redo.length)return;undo.push([...pixels]);pixels.splice(0,pixels.length,...redo.pop());sync();}),btn('Limpiar',()=>{if(!confirm('¿Limpiar el lienzo? Podrás deshacerlo.'))return;snapshot();pixels.fill(palette[0]);sync();}),btn('Descargar SVG',()=>{const squares=pixels.map((v,i)=>`<rect x="${i%12}" y="${Math.floor(i/12)}" width="1" height="1" fill="${v}"/>`).join('');download('pixel-akon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" width="600" height="400" shape-rendering="crispEdges">${squares}</svg>`,'image/svg+xml');}));box.append(head,tools,grid,status,actions);host.append(box);sync();
}
window.AkonTools={configure(system,legacy){built=system;try{const data=JSON.parse(localStorage.getItem('akon-pc-files')||'{}');for(const [name,value]of Object.entries(data)){if(valid(name)&&!Object.hasOwn(built,name)&&typeof value==='string'&&value.length<=10000&&Object.keys(files).length<20)files[name]=value;}}catch{}if(!Object.hasOwn(files,'notas.txt'))files['notas.txt']=legacy;},read,create,names:()=>Object.keys({...built,...files}),editor,manager,paint};
})();
