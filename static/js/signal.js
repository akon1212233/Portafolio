(function(root){
'use strict';
const tile=(x,y,type,dir=0,extra={})=>({x,y,type,dir,...extra});
const LEVELS=[
 {name:'01 / LA SEÑAL ROTA',voice:'Una criatura de luz quedó atrapada entre instrucciones. Dale un camino de salida.',hint:'Gira las flechas. Recoge el fragmento ✧ antes de llegar a la puerta ◇.',tiles:[tile(0,1,'start'),tile(1,1,'arrow',1),tile(2,1,'shard',1),tile(2,2,'arrow',2),tile(3,2,'arrow',3),tile(3,1,'exit')]},
 {name:'02 / LLAMADA EQUIVOCADA',voice:'La llamada apunta a un lugar que no existe. No todo destino merece ser obedecido.',hint:'CALL cambia de destino al pulsarlo. Los números señalan sus posibles puntos de llegada.',tiles:[tile(0,2,'start'),tile(1,2,'arrow',3),tile(1,1,'shard',0),tile(2,1,'call',0,{targets:[17,10],choice:0}),tile(5,2,'error',0),tile(4,1,'arrow',1),tile(4,2,'shard',2),tile(3,2,'arrow',3),tile(3,1,'exit')]},
 {name:'03 / EL PARCHE',voice:'El sistema insiste en que el error eres tú. Quizá debas cambiar el sistema.',hint:'Pasa primero por PATCH. Después podrás cruzar el bloque ERR sin perder la señal.',tiles:[tile(0,1,'start'),tile(1,1,'arrow',0),tile(1,0,'patch',0),tile(2,0,'arrow',1),tile(2,1,'shard',0),tile(3,1,'error',0),tile(4,1,'exit')]},
 {name:'04 / SALIR DEL BUCLE',voice:'El programa quiere volver a empezar. Tú ya sabes que hay otra salida.',hint:'Desvía la llamada, activa el parche y recupera ambos fragmentos. El orden importa.',tiles:[tile(0,3,'start'),tile(1,3,'arrow',1),tile(1,2,'shard',3),tile(1,1,'call',0,{targets:[18,9],choice:0}),tile(3,1,'arrow',3),tile(3,0,'patch',0),tile(4,0,'arrow',1),tile(4,1,'error',1),tile(4,2,'shard',0),tile(3,2,'arrow',1),tile(3,3,'exit')]},
 {name:'05 / SUBRUTINA',voice:'La señal puede visitar otro fragmento del programa y volver al punto exacto donde la dejaste.',hint:'INVOKE guarda la casilla siguiente. RETURN vuelve allí. Recoge la luz en la función antes de regresar.',tiles:[tile(0,2,'start'),tile(1,2,'invoke',0,{targets:[2],choice:0}),tile(2,2,'arrow',1),tile(3,2,'exit'),tile(2,0,'shard',0),tile(3,0,'return')]},
 {name:'06 / REUBICAR EL CÓDIGO',voice:'Esta vez, girar no basta. El programa tiene las instrucciones correctas en los lugares equivocados.',hint:'Activa Mover. Pulsa una flecha y luego una casilla vacía. Lleva las flechas desde la fila inferior hasta los huecos de la ruta.',tiles:[tile(0,1,'start'),tile(3,1,'shard',1),tile(3,2,'exit'),tile(1,3,'arrow',1),tile(2,3,'arrow',2)]}

];
// El movimiento es una mecánica desbloqueada en zonas concretas.
LEVELS[5].moveZone=[7,8];LEVELS[5].tiles.forEach(t=>{if(t.type==='arrow')t.movable=true;});
LEVELS.push(
 {name:'07 / EL PARCHE REMOTO',voice:'El parche está en una subrutina. Entra, recupéralo y vuelve para cruzar el error.',hint:'INVOKE debe visitar PATCH antes de volver. Después ordena la ruta hacia la luz.',tiles:[tile(0,2,'start'),tile(1,2,'invoke',0,{targets:[0,2],choice:0}),tile(2,2,'error',0,{channel:'A'}),tile(3,2,'shard',3),tile(3,1,'exit'),tile(2,0,'patch',0,{channel:'A'}),tile(3,0,'return')]},
 {name:'08 / DOS TIPOS DE ERROR',voice:'Un parche no arregla todo. Cada error necesita su propio canal.',hint:'Recoge A y B. Los errores consumen un parche del mismo canal.',tiles:[tile(0,1,'start'),tile(1,1,'patch',1,{channel:'A'}),tile(2,1,'error',0,{channel:'A'}),tile(3,1,'patch',1,{channel:'B'}),tile(3,2,'error',2,{channel:'B'}),tile(2,2,'shard',0),tile(1,2,'exit')]},
 {name:'09 / LLAMADAS ANIDADAS',voice:'Una función llama a otra. Cada RETURN debe encontrar a quien la espera.',hint:'La función en 1 llama a la función en 4. Después vuelve primero a 2 y luego a 14.',tiles:[tile(0,2,'start'),tile(1,2,'invoke',0,{targets:[0,1],choice:0}),tile(2,2,'error',0,{channel:'A'}),tile(3,2,'exit'),tile(1,0,'invoke',0,{targets:[0,4],choice:0}),tile(2,0,'return'),tile(4,0,'patch',0,{channel:'A'}),tile(5,0,'return')]}
);
const assemblySolutions=[];
for(let stage=10;stage<=15;stage++){
 const nested=stage>=11,mirror=stage===12||stage===14;
 const map=id=>mirror?Math.floor(id/6)*6+5-id%6:id;
 const make=(id,type,dir=0,extra={})=>{const t=tile(map(id)%6,Math.floor(map(id)/6),type,mirror?(dir===0?2:dir===2?0:dir):dir,extra);if(t.targets)t.targets=t.targets.map(map);if(t.returnTo!==undefined)t.returnTo=map(t.returnTo);return t;};
 const fixed=[make(6,'start',0),make(19,'exit'),make(9,'error',0,{channel:'A'}),make(21,'error',2,{channel:'B'}),make(10,'shard',0),make(22,'shard',2),make(3,'return')];
 const pieces=[make(7,'arrow',0),make(8,'invoke',0,{targets:[18,1],choice:0,returnTo:9}),make(11,'arrow',1),make(17,'arrow',1),make(23,'arrow',2),make(20,'arrow',3),make(14,'arrow',2),make(13,'arrow',1)];
 const functionPieces=[make(1,'patch',0,{channel:'A',charges:stage>=13?2:1})];
 if(nested){functionPieces.push(make(2,'invoke',0,{targets:[0,4],choice:0,returnTo:3}),make(4,'patch',0,{channel:'B',charges:stage>=14?2:1}));fixed.push(make(5,'return'));}
 else functionPieces.push(make(2,'patch',0,{channel:'B'}));
 if(stage>=13){const i=pieces.findIndex(t=>t.y*6+t.x===map(14));pieces.splice(i,1);fixed.push(make(14,'error',2,{channel:'A'}));}
 if(stage>=14){const i=pieces.findIndex(t=>t.y*6+t.x===map(17));pieces.splice(i,1);fixed.push(make(17,'error',1,{channel:'B'}));}
 if(stage>=12)pieces.push(...functionPieces);else fixed.push(...functionPieces);
 const solution=[];pieces.forEach((t,i)=>{solution.push({bank:-100-i,to:t.y*6+t.x,dir:t.dir,choice:t.type==='invoke'?1:0});t.bankId=-100-i;t.inBank=true;t.movable=true;t.dir=(t.dir+(stage-9)%4+1)%4;});
 // Las llamadas fijas también empiezan apuntando a un destino incorrecto.
 const names=['MESA VACÍA','DOBLE PROFUNDIDAD','EL PROGRAMA INVERTIDO','RECURSOS LIMITADOS','CUATRO HERIDAS','RECONSTRUIR EL SISTEMA'];
 LEVELS.push({name:String(stage).padStart(2,'0')+' / '+names[stage-10],voice:'El camino no está montado. Ensambla el programa y libera la señal.',hint:'Elige un bloque del inventario y colócalo en una casilla punteada. Los canales A y B se consumen al atravesar ERR. INVOKE necesita el destino correcto y RETURN recupera la llamada.',moveZone:Array.from({length:24},(_,i)=>i).filter(i=>!fixed.some(t=>t.y*6+t.x===i)),tiles:[...fixed,...pieces]});
 assemblySolutions.push(solution);
}

const arrows=['→','↓','←','↑'];
function create(index=0){
 const level=LEVELS[index]||LEVELS[0],tiles=level.tiles.map(t=>({...t,targets:t.targets?[...t.targets]:undefined}));
 const s={index,pos:0,tiles,status:'ready',fragments:new Set(),patched:false,patches:{},stack:[],visited:new Set(),trail:[],message:'Gira los bloques y libera la señal.'};
 const id=t=>t.inBank?t.bankId:t.y*6+t.x;
 function reset(){s.pos=id(tiles.find(t=>t.type==='start'));s.status='ready';s.fragments.clear();s.patched=false;s.patches={};s.stack=[];s.visited.clear();s.trail=[];s.message='Lista para ejecutar.';}
 function rotate(cell){if(s.status==='running')return false;const t=tiles.find(t=>id(t)===cell);if(!t||t.inBank)return false;if(['call','invoke'].includes(t.type)){t.choice=(t.choice+1)%t.targets.length;}else if(['arrow','shard','patch'].includes(t.type))t.dir=(t.dir+1)%4;else return false;reset();return true;}
 function move(from,to){if(!level.moveZone||!level.moveZone.includes(to)||s.status==='running'||!Number.isInteger(to)||to<0||to>=24||tiles.some(t=>id(t)===to))return false;const t=tiles.find(t=>id(t)===from);if(!t||!t.movable)return false;t.inBank=false;t.x=to%6;t.y=Math.floor(to/6);reset();return true;}
 function start(){reset();s.status='running';}
 function step(){if(s.status!=='running')return;if(s.trail.length>=128){s.status='lost';s.message='Límite de 128 instrucciones: revisa los bucles que recargan parches.';return;}const t=tiles.find(t=>id(t)===s.pos);const fail=text=>{s.status='lost';s.message=text;};
 if(!t){fail('La señal cayó al vacío. Revisa la última flecha.');return;}
 const signature=[s.pos,[...s.fragments].sort().join(','),s.patched,JSON.stringify(s.patches),s.stack.join(',')].join('|');if(s.visited.has(signature)){fail('Bucle detectado. Esta llamada te devuelve al mismo lugar.');return;}s.visited.add(signature);s.trail.push(s.pos);
 if(t.type==='shard')s.fragments.add(s.pos);
 if(t.type==='patch'){s.patched=true;if(t.channel)s.patches[t.channel]=(s.patches[t.channel]||0)+(t.charges||1);}
 if(t.type==='error'&&t.channel){if(!s.patches[t.channel]){fail('ERR '+t.channel+': ningún parche disponible para este canal.');return;}s.patches[t.channel]--;}
 if(t.type==='error'&&!t.channel&&!s.patched){fail('ERR: la señal se rompió. Busca un parche o una ruta alternativa.');return;}
 if(t.type==='exit'){if(s.stack.length){fail('Quedan funciones sin retornar.');return;}if(s.fragments.size===tiles.filter(t=>t.type==='shard').length){s.status='won';s.message='La puerta se abrió. Has cambiado las reglas.';}else fail('Puerta cerrada. Aún queda un fragmento de luz.');return;}
 if(t.type==='invoke'){if(s.stack.length>=8){fail('Pile de llamadas llena. Revisa la recursión.');return;}s.stack.push(t.returnTo??(id(t)+1));s.pos=t.targets[t.choice];return;}
 if(t.type==='return'){if(!s.stack.length){fail('RETURN sin llamada.');return;}s.pos=s.stack.pop();return;}
 if(t.type==='call')s.pos=t.targets[t.choice];else{const [dx,dy]=[[1,0],[0,1],[-1,0],[0,-1]][t.dir];const x=t.x+dx,y=t.y+dy;s.pos=x<0||x>=6||y<0||y>=4?-1:y*6+x;}
 }
 reset();return {state:s,level,rotate,move,start,step};
}
function mount(host){
 const el=(tag,text='')=>{const n=document.createElement(tag);n.textContent=text;return n;};
 let unlocked=0;try{const n=Number(localStorage.getItem('akon-signal-level'));if(Number.isInteger(n)&&n>=0&&n<LEVELS.length)unlocked=n;}catch{}
 let engine=create(unlocked),timer=null,running=false,disposed=false;
 const box=el('section');box.className='signal-game';
 const banner=el('div','SIGNAL / un programa que puedes romper');banner.className='signal-banner';
 const title=el('h3');const voice=el('p');voice.className='signal-voice';
 const picker=el('select');picker.setAttribute('aria-label','Elegir nivel');
 function options(){picker.replaceChildren();LEVELS.forEach((l,i)=>{const o=el('option',l.name);o.value=i;o.disabled=i>unlocked;picker.append(o);});picker.value=engine.state.index;}
 const inventory=el('div');inventory.className='signal-inventory';
 const board=el('div');board.className='signal-board';board.setAttribute('role','group');board.setAttribute('aria-label','Bloques de instrucciones. Pulsa las flechas para girarlas y CALL para cambiar su destino.');
 const wire=document.createElementNS('http://www.w3.org/2000/svg','svg');wire.setAttribute('viewBox','0 0 600 400');wire.setAttribute('preserveAspectRatio','none');wire.classList.add('signal-wires');wire.setAttribute('aria-hidden','true');
 const hud=el('p');hud.className='signal-hud';const log=el('p');log.className='signal-log';log.setAttribute('role','status');
 const controls=el('div');controls.className='signal-controls';
 const button=(text,fn)=>{const b=el('button',text);b.type='button';b.addEventListener('click',fn);return b;};
 function stop(){clearTimeout(timer);timer=null;running=false;}
 function won(){if(engine.state.status!=='won')return;unlocked=Math.max(unlocked,Math.min(LEVELS.length-1,engine.state.index+1));try{localStorage.setItem('akon-signal-level',String(unlocked));}catch{engine.state.message+=' El navegador no pudo guardar el progreso.';}options();}
 function tick(){if(disposed)return;engine.step();won();update();if(engine.state.status==='running'&&running)timer=setTimeout(tick,500);else{running=false;update();}}
 const run=button('▶ Ejecutar',()=>{if(running)return;engine.start();running=true;tick();});
 const step=button('▸ Un paso',()=>{stop();if(engine.state.status!=='running')engine.start();tick();});
 const pause=button('Ⅱ Pausar',()=>{stop();update();});
 const retry=button('↺ Restaurar',()=>{stop();moving=false;selected=null;engine=create(engine.state.index);build();});
 const next=button('Cruzar la puerta →',()=>{stop();if(engine.state.status!=='won')return;engine=create(engine.state.index<LEVELS.length-1?engine.state.index+1:0);build();});
 const hint=el('details');const summary=el('summary','Necesito una pista');const hintText=el('p');hint.append(summary,hintText);
 controls.append(run,step,pause,retry);
 const instructions=el('p','Pulsa las flechas para girarlas. CALL cambia su destino. Ejecuta la señal y observa dónde se rompe.');instructions.className='signal-instructions';
 const head=el('div');head.className='signal-heading';head.append(banner,picker);
 const stage=el('div');stage.className='signal-stage';const playfield=el('div');playfield.className='signal-playfield';playfield.append(board,hud);
 const console=el('aside');console.className='signal-console';console.append(title,voice,inventory,controls,log,next,instructions,hint);stage.append(playfield,console);box.append(head,stage);host.append(box);
 run.className='game-action-primary';
 let cells=[],moving=false,selected=null;const moveButton=button('✥ Mover bloques',()=>{moving=!moving;selected=null;moveButton.setAttribute('aria-pressed',String(moving));log.textContent=moving?'Selecciona un bloque móvil y después un hueco.':'Modo girar.';build();});controls.append(moveButton);
 function build(){options();if(!engine.level.moveZone){moving=false;selected=null;}moveButton.hidden=!engine.level.moveZone;inventory.replaceChildren();for(const t of engine.state.tiles.filter(t=>t.inBank)){const b=button(t.type.toUpperCase()+' '+arrows[t.dir]+(t.channel?' '+t.channel:''),()=>{moving=true;selected=t.bankId;moveButton.setAttribute('aria-pressed','true');build();log.textContent='Coloca '+t.type.toUpperCase()+' en una zona punteada.';});b.className=selected===t.bankId?'selected':'';inventory.append(b);}inventory.hidden=!inventory.children.length;title.textContent=engine.level.name;voice.textContent=engine.level.voice;hintText.textContent=engine.level.hint;hint.open=false;board.replaceChildren(wire);cells=[];
 for(let i=0;i<24;i++){const t=engine.state.tiles.find(t=>!t.inBank&&t.y*6+t.x===i);const b=button('',()=>{if(moving){if(engine.state.status==='running'&&!running)engine.state.status='ready';if(engine.state.status==='running')return;if(selected===null){const chosen=engine.state.tiles.find(t=>!t.inBank&&t.y*6+t.x===i);if(!chosen||!chosen.movable){log.textContent='Elige una flecha, CALL, INVOKE o PATCH.';return;}selected=i;b.style.outline='2px solid #ffe0a2';log.textContent='Ahora pulsa una casilla vacía.';}else{engine.move(selected,i);selected=null;build();}return;}if(engine.state.status==='running'&&!running){engine.state.status='ready';}if(engine.rotate(i))update();});b.className='signal-cell';b.dataset.cell=i;if(!t){b.disabled=!moving||!engine.level.moveZone?.includes(i);b.classList.add('void');b.setAttribute('aria-label','Vacío');}else{b.dataset.type=t.type;b.setAttribute('aria-label',`Bloque ${i}: ${t.type}`);}
 b.addEventListener('keydown',e=>{const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-6,ArrowDown:6}[e.key];if(d){e.preventDefault();let j=i+d;while(j>=0&&j<24&&cells[j].disabled)j+=d;cells[j]?.focus();}});board.append(b);cells.push(b);}update();}
 function update(){const s=engine.state;cells.forEach((b,i)=>{const t=s.tiles.find(t=>!t.inBank&&t.y*6+t.x===i);if(!t)return;b.replaceChildren();const symbol=el('span'),label=el('small');symbol.className='signal-glyph';const fixed={start:'◈',exit:'◇',error:'×',patch:'⌘',shard:'✧',invoke:'ƒ',return:'↩'};symbol.textContent=t.type==='call'?'↗':t.type==='arrow'?arrows[t.dir]:fixed[t.type];label.textContent=t.type==='invoke'?'INVOKE '+t.targets[t.choice]:t.type==='call'?'CALL '+t.targets[t.choice]:t.type==='arrow'?'ROUTE':t.type==='shard'?'LIGHT '+arrows[t.dir]:t.type==='patch'?'PATCH '+(t.channel||'')+arrows[t.dir]:t.type==='error'?'ERR '+(t.channel||'')+arrows[t.dir]:t.type==='start'?'START →':'EXIT';b.append(symbol,label);b.style.setProperty('--direction',t.dir*90+'deg');b.classList.toggle('current',i===s.pos);b.classList.toggle('visited',s.trail.includes(i));b.classList.toggle('collected',s.fragments.has(i));b.classList.toggle('patched',s.patched&&t.type==='error');b.disabled=running;b.setAttribute('aria-label',`Bloque ${i}: ${label.textContent}${i===s.pos?', señal aquí':''}`);
 const destinations=s.tiles.filter(t=>['call','invoke'].includes(t.type)).flatMap(t=>t.targets);if(destinations.includes(i)){const tag=el('i',String(i));b.append(tag);}});
 wire.replaceChildren();if(s.trail.length>1){const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');line.setAttribute('points',s.trail.map(i=>`${i%6*100+50},${Math.floor(i/6)*100+50}`).join(' '));wire.append(line);}
 hud.textContent=`LUZ ${s.fragments.size}/${s.tiles.filter(t=>t.type==='shard').length} · PARCHE ${s.patched?'ACTIVO':'INACTIVO'} · A:${s.patches.A||0} B:${s.patches.B||0} · PILA ${s.stack.length} · ${s.trail.length} PASOS`;log.textContent=s.status==='running'?(running?'La señal está viajando…':'Pausa. Puedes dar otro paso o girar un bloque para reiniciar.'):s.message;
 box.dataset.status=s.status;run.disabled=running;step.disabled=running;pause.disabled=!running;next.hidden=s.status!=='won';next.textContent=s.index===LEVELS.length-1?'Has escapado. Volver al inicio ↺':'Cruzar la puerta →';picker.disabled=running;moveButton.disabled=running;inventory.inert=running;
 }
 picker.addEventListener('change',()=>{stop();moving=false;selected=null;engine=create(Number(picker.value));build();});
 function suspend(){if(running){stop();update();}}
 document.addEventListener('visibilitychange',suspend);build();return()=>{disposed=true;stop();document.removeEventListener('visibilitychange',suspend);};
}
const api={create,mount,LEVELS,assemblySolutions};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AkonSignal=api;
})(globalThis);
