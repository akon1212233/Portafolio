(function(root){
'use strict';
const LEVELS={easy:{size:8,mines:10,label:'8 × 8 / 10 minas'},normal:{size:12,mines:28,label:'12 × 12 / 28 minas'},hard:{size:16,mines:55,label:'16 × 16 / 55 minas'},expert:{size:20,mines:95,label:'20 × 20 / 95 minas'}};
function shuffle(items,random=Math.random){for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
function createMines(level='easy',random=Math.random){
 const config=LEVELS[level]||LEVELS.easy,n=config.size;
 const s={size:n,mines:config.mines,started:false,status:'ready',cells:Array.from({length:n*n},()=>({mine:false,open:false,flag:false,count:0}))};
 const neighbors=i=>{const cells=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=i%n+dx,y=Math.floor(i/n)+dy;if((dx||dy)&&x>=0&&x<n&&y>=0&&y<n)cells.push(y*n+x);}return cells;};
 function plant(first){const safe=new Set([first,...neighbors(first)]);const candidates=shuffle(s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),random);candidates.slice(0,s.mines).forEach(i=>s.cells[i].mine=true);s.cells.forEach((c,i)=>c.count=neighbors(i).filter(j=>s.cells[j].mine).length);s.started=true;s.status='playing';}
 function reveal(i){if(!Number.isInteger(i)||!s.cells[i]||['won','lost'].includes(s.status)||s.cells[i].flag||s.cells[i].open)return;
  if(!s.started)plant(i);
  if(s.cells[i].mine){s.cells[i].open=true;s.status='lost';return;}
  const queue=[i];while(queue.length){const j=queue.pop(),cell=s.cells[j];if(cell.open||cell.flag||cell.mine)continue;cell.open=true;if(!cell.count)queue.push(...neighbors(j).filter(k=>!s.cells[k].open));}
  if(s.cells.filter(c=>c.open).length===n*n-s.mines)s.status='won';
 }
 function flag(i){const c=s.cells[i];if(!c||c.open||['won','lost'].includes(s.status))return;if(!c.flag&&s.cells.filter(c=>c.flag).length>=s.mines)return;c.flag=!c.flag;}
 return {state:s,reveal,flag,neighbors};
}
const node=(tag,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
const button=(text,fn)=>{const b=node('button',text);b.type='button';b.addEventListener('click',fn);return b;};
function readBest(key){try{const value=Number(localStorage.getItem(key));return Number.isSafeInteger(value)&&value>0?value:null;}catch{return null;}}
function record(key,value,lower){const best=readBest(key);if(best!==null&&(lower?best<=value:best>=value))return 'Tu récord sigue siendo '+best+(lower?' segundos.':' puntos.');try{localStorage.setItem(key,String(value));return '¡Nuevo récord local: '+value+(lower?' segundos!':' puntos!');}catch{return 'No se pudo guardar el récord: el navegador bloqueó el almacenamiento.';}}
function mountMines(host){
 const box=node('div');box.className='arcade mines-app';const help=node('p','Descubre las casillas sin minas. El primer clic y sus casillas vecinas son seguros. Clic derecho o modo bandera para marcar; F con teclado.');
 const select=node('select');select.setAttribute('aria-label','Dificultad');for(const [value,c]of Object.entries(LEVELS)){const o=node('option',c.label);o.value=value;select.append(o);}
 let game,flagMode=false,startAt=null,elapsed=0,finished=false;const stat=node('div');stat.className='arcade-hud mine-displays';
 const metrics={};for(const key of ['MINAS','BANDERAS','TIEMPO']){const item=node('div');const value=node('strong','000');item.append(node('small',key),value);stat.append(item);metrics[key]=value;}const feedback=node('p');feedback.setAttribute('role','status');const bestLabel=node('p');
 const grid=node('div');grid.className='mine-grid';grid.setAttribute('role','group');grid.setAttribute('aria-label','Tablero Buscaminas');let buttons=[];
 const mode=button('⚑ Marcar: NO',()=>{flagMode=!flagMode;mode.textContent=flagMode?'⚑ Marcar: SÍ':'⚑ Marcar: NO';mode.setAttribute('aria-pressed',String(flagMode));});mode.setAttribute('aria-pressed','false');
 const tools=node('div');tools.className='arcade-tools';tools.append(select,mode,button('Nueva partida',restart));
 function status(){const s=game.state;if(startAt!==null&&!finished)elapsed=Math.floor((performance.now()-startAt)/1000);metrics.MINAS.textContent=String(s.mines).padStart(2,'0');metrics.BANDERAS.textContent=String(s.cells.filter(c=>c.flag).length).padStart(2,'0');metrics.TIEMPO.textContent=String(elapsed).padStart(3,'0');}
 function render(){const s=game.state;box.dataset.status=s.status;buttons.forEach((b,i)=>{const c=s.cells[i],showMine=c.mine&&['lost','won'].includes(s.status);b.textContent=showMine?'✹':c.flag?'⚑':c.open?(c.count||'·'):'';b.className=c.open?'mine-cell revealed':'mine-cell';if(showMine)b.classList.add('exploded');b.dataset.count=c.count;b.setAttribute('aria-label',`Fila ${Math.floor(i/s.size)+1}, columna ${i%s.size+1}: ${showMine?'mina':c.flag?'bandera':c.open?`${c.count} minas vecinas`:'oculta'}`);b.setAttribute('aria-disabled',String(c.open||['won','lost'].includes(s.status)));});status();
  if(['won','lost'].includes(s.status)&&!finished){finished=true;feedback.textContent=s.status==='won'?'¡Campo despejado! '+record('akon-mines-'+select.value,Math.max(1,elapsed),true):'Pisaste una mina. Prueba otra partida.';updateBest();}}
 function updateBest(){const best=readBest('akon-mines-'+select.value);bestLabel.textContent=best?'Récord de este nivel: '+best+' segundos.':'Todavía no hay récord para este nivel.';}
 function act(i,mark){if(mark)game.flag(i);else{game.reveal(i);if(game.state.started&&startAt===null)startAt=performance.now();}render();}
 function restart(){game=createMines(select.value);startAt=null;elapsed=0;finished=false;feedback.textContent='Elige tu primera casilla.';grid.style.minWidth=game.state.size>12?'440px':'0';grid.style.gridTemplateColumns=`repeat(${game.state.size}, minmax(0, 1fr))`;grid.replaceChildren();buttons=game.state.cells.map((_,i)=>{const b=button('',()=>act(i,flagMode));b.addEventListener('contextmenu',e=>{e.preventDefault();act(i,true);});b.addEventListener('keydown',e=>{const n=game.state.size,row=Math.floor(i/n),col=i%n;if(e.key.toLowerCase()==='f'){e.preventDefault();act(i,true);return;}const moves={ArrowLeft:col?i-1:i,ArrowRight:col<n-1?i+1:i,ArrowUp:row?i-n:i,ArrowDown:row<n-1?i+n:i};if(Object.hasOwn(moves,e.key)){e.preventDefault();buttons[moves[e.key]].focus();}});grid.append(b);return b;});updateBest();render();}
 select.addEventListener('change',restart);
 const head=node('div');head.className='play-heading';head.append(node('span','03 / ZONA DE EXPLORACIÓN'),node('h2','Bajo la superficie'),node('p','Cada número cuenta una historia. Escucha antes de avanzar.'));
 const layout=node('div');layout.className='mine-layout';const panel=node('div');panel.className='mine-panel';const scroll=node('div');scroll.className='mine-scroll';scroll.append(grid);panel.append(stat,scroll);
 const aside=node('aside');aside.className='mine-settings';aside.append(node('h3','Mesa de operaciones'),tools,feedback,bestLabel);
 const guide=node('details');guide.append(node('summary','Cómo explorar el tablero'),help);aside.append(guide);layout.append(panel,aside);box.append(head,layout);host.append(box);restart();const timer=setInterval(status,250);return()=>clearInterval(timer);
}
const api={createMines,mountMines};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AkonArcade=api;
})(globalThis);
