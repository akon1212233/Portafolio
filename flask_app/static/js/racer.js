(function(root){
'use strict';
const KEY='akon-racer-ranking-v1';
function ranking(raw){try{const rows=JSON.parse(raw);return (Array.isArray(rows)?rows:[]).filter(r=>r&&/^[A-Z0-9]{4}$/.test(r.name)&&Number.isSafeInteger(r.score)&&r.score>=0).sort((a,b)=>b.score-a.score).slice(0,10);}catch{return [];}}
function create(random=Math.random,hard=false){
 const s={x:0,time:0,distance:0,score:0,lives:3,cars:[],speed:0,spawn:1,passed:0,invincible:0,done:false};
 function step(dt,steer,brake){
  if(s.done)return;dt=Math.max(0,Math.min(.05,dt));s.time+=dt;s.invincible=Math.max(0,s.invincible-dt);
  const speed=brake?16:(hard?48:26)+s.time*(hard?1.35:1.0);s.speed=speed;s.x=Math.max(-1.15,Math.min(1.15,s.x+steer*dt*1.65));s.distance+=speed*dt;
  s.spawn-=dt;if(s.spawn<=0){s.cars.push({x:[-.65,0,.65][Math.floor(random()*3)],z:95});s.spawn=Math.max(hard?.24:.36,(hard?.85:1.45)-s.time*(hard?.010:.017))+random()*.18;}
  for(const car of s.cars){const before=car.z;car.z-=speed*dt;if(before>3&&car.z<=3){if(Math.abs(s.x-car.x)<.32){if(!s.invincible){s.lives--;s.invincible=1.2;}}else s.passed++;}}
  s.cars=s.cars.filter(c=>c.z>0);s.score=Math.floor((s.distance*5+s.passed*100)*(hard?1.8:1));
  if(s.lives<=0||s.time>=60)s.done=true;
 }
 return {state:s,step};
}
function mount(host){
 const el=(tag,text='')=>{const n=document.createElement(tag);n.textContent=text;return n;};
 const canvas=el('canvas','Juego de carreras. Usa las flechas o los controles de pantalla.');canvas.width=1280;canvas.height=720;canvas.tabIndex=0;canvas.setAttribute('aria-label','Retro Racer. Flechas izquierda y derecha para conducir; abajo para frenar.');
 const ctx=canvas.getContext('2d');if(!ctx){host.append(el('p','Tu navegador no permite usar este juego.'));return ()=>{};}
 ctx.scale(2,2);
 const box=el('div');box.className='racer';const hud=el('div');hud.className='race-hud';
 function metric(label){const item=el('div');item.className='race-metric';const value=el('strong','0');item.append(el('small',label),value);hud.append(item);return value;}
 const scoreValue=metric('PUNTUACIÓN'),timeValue=metric('TIEMPO'),lifeValue=metric('CARROCERÍA'),speedValue=metric('VELOCIDAD');
 const message=el('p','Esquiva el tráfico durante 60 segundos. Tres choques terminan la carrera.');message.setAttribute('role','status');
 const controls=el('div');controls.className='race-controls';
 const btn=(label,action)=>{const b=el('button',label);b.type='button';if(action)b.addEventListener('click',action);return b;};
 const difficulty=el('select');difficulty.setAttribute('aria-label','Dificultad de carrera');for(const [value,text]of [['normal','Normal · progresivo'],['hard','Difícil · puntos ×1.8']]){const o=el('option',text);o.value=value;difficulty.append(o);}controls.append(difficulty);
 const keys=new Set();let run=create(),started=false,paused=false,frame,last=0,disposed=false,saved=false;
 const pause=btn('Pausar',()=>{if(!started||run.state.done)return;paused=!paused;keys.clear();pause.textContent=paused?'Continuar':'Pausar';message.textContent=paused?'Carrera en pausa.':'¡Sigue conduciendo!';});
 const start=btn('Iniciar carrera',()=>{run=create(Math.random,difficulty.value==='hard');difficulty.disabled=true;started=true;paused=false;saved=false;keys.clear();form.hidden=true;start.textContent='Reiniciar';pause.textContent='Pausar';message.textContent='Flechas o A/D para conducir; ↓ o S para frenar.';canvas.focus();});
 const left=btn('◀'),brake=btn('Frenar'),right=btn('▶');
 const abort=new AbortController();
 for(const [button,key] of [[left,'ArrowLeft'],[right,'ArrowRight'],[brake,'ArrowDown']]){
  button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);keys.add(key);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>keys.delete(key));
  button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();keys.add(key);}});
  button.addEventListener('keyup',()=>keys.delete(key));button.addEventListener('blur',()=>keys.delete(key));
 }
 function key(event,down){if(event.target.matches('input'))return;const k=event.key.toLowerCase(),map={arrowleft:'ArrowLeft',a:'ArrowLeft',arrowright:'ArrowRight',d:'ArrowRight',arrowdown:'ArrowDown',s:'ArrowDown'};if(map[k]){event.preventDefault();down?keys.add(map[k]):keys.delete(map[k]);}}
 box.addEventListener('keydown',e=>key(e,true));box.addEventListener('keyup',e=>key(e,false));
 function suspend(){keys.clear();if(started&&!run.state.done){paused=true;pause.textContent='Continuar';message.textContent='Carrera en pausa. Pulsa Continuar.';}}
 window.addEventListener('blur',suspend,{signal:abort.signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();},{signal:abort.signal});
 box.addEventListener('focusout',event=>{if(!box.contains(event.relatedTarget))suspend();});
 const form=el('form');form.hidden=true;const label=el('label','Tu nombre: 4 letras o números');const input=el('input');input.id='race-name';input.minLength=4;input.maxLength=4;input.pattern='[A-Za-z0-9]{4}';input.required=true;input.autocomplete='off';input.placeholder='AKON';label.htmlFor=input.id;const submit=el('button','Guardar puntuación');submit.type='submit';form.append(label,input,submit);
 const list=el('ol');const rankTitle=el('h3','TOP 10 / ESTE NAVEGADOR');let scores=[];try{scores=ranking(localStorage.getItem(KEY));}catch{}
 function renderRank(){list.replaceChildren();if(!scores.length)list.append(el('li','Todavía no hay marcas. ¡Estrena el ranking!'));scores.forEach(row=>list.append(el('li',`${row.name} · ${row.score} puntos`)));}
 form.addEventListener('submit',event=>{event.preventDefault();if(saved||!run.state.done)return;const name=input.value.trim().toUpperCase();if(!/^[A-Z0-9]{4}$/.test(name)){message.textContent='Usa exactamente 4 letras o números.';return;}const updated=ranking(JSON.stringify([...scores,{name,score:run.state.score}]));try{localStorage.setItem(KEY,JSON.stringify(updated));scores=updated;saved=true;form.hidden=true;renderRank();message.textContent='Puntuación guardada en este navegador.';}catch{message.textContent='El navegador bloqueó el guardado. Habilita el almacenamiento y vuelve a intentarlo.';}});
 start.className='game-action-primary';pause.className='race-pause';left.setAttribute('aria-label','Girar a la izquierda');right.setAttribute('aria-label','Girar a la derecha');
 controls.append(left,brake,right,start,pause);
 const header=el('div');header.className='play-heading';header.append(el('span','01 / AKON MOTOR CLUB'),el('h2','Sunset Run'),el('p','Sesenta segundos de asfalto, luz y reflejos.'));
 const layout=el('div');layout.className='race-layout';const main=el('div');main.className='race-track';main.append(hud,canvas,controls,message,form);
 const aside=el('aside');aside.className='race-scoreboard';aside.append(el('span','HALL OF FAME'),rankTitle,list,el('p','Flechas / A y D para conducir. ↓ / S para frenar.'),el('p','Tu récord queda en este navegador.'));
 layout.append(main,aside);box.append(header,layout);host.append(box);renderRank();
 const poly=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
 function draw(){
  const s=run.state,horizon=125,curve=Math.sin(s.distance/290)*55;
  const sky=ctx.createLinearGradient(0,0,0,160);sky.addColorStop(0,'#202741');sky.addColorStop(.48,'#6c425f');sky.addColorStop(1,'#ee9d7f');ctx.fillStyle=sky;ctx.fillRect(0,0,640,360);
  const sun=ctx.createLinearGradient(0,40,0,140);sun.addColorStop(0,'#fff4b9');sun.addColorStop(1,'#f39c7c');ctx.fillStyle=sun;ctx.beginPath();ctx.arc(420-curve*.15,86,46,0,Math.PI*2);ctx.fill();
  for(let i=0;i<6;i++){ctx.fillStyle='#bd647655';ctx.fillRect(370-curve*.15,93+i*7,100,1+i*.35);}
  for(let layer=0;layer<3;layer++){const points=[[-50,145]];for(let x=-50;x<720;x+=25)points.push([x,118-layer*5-Math.abs(Math.sin(x*.023+layer*2.8+curve*.0008))* (25+layer*9)]);points.push([720,150]);poly(points,['#93627c','#5a4868','#33394e'][layer]);}
  for(let y=horizon;y<360;y+=2){const p=(y-horizon)/(360-horizon),center=320+curve*(1-p)**2,half=18+260*p;const stripe=Math.floor(3/(p+.035)+s.distance/5)%2;
   ctx.fillStyle=stripe?'#7d5f58':'#765950';ctx.fillRect(0,y,640,2);ctx.fillStyle=stripe?'#efcaa3':'#a4524b';ctx.fillRect(center-half-10*p,y,2*half+20*p,2);
   ctx.fillStyle=stripe?'#343941':'#30353d';ctx.fillRect(center-half,y,2*half,2);ctx.fillStyle='#d0bcb2';ctx.fillRect(center-half+4*p,y,2*p+1,2);ctx.fillRect(center+half-6*p,y,2*p+1,2);
   if(stripe){ctx.fillStyle='#cfbfa3';for(const lane of [-1/3,1/3])ctx.fillRect(center+half*lane-1.5*p,y,3*p+1,2);}
  }
  // Balizas y postes a ambos lados, proyectados en la misma carretera.
  for(let i=10;i>=0;i--){const z=i*14+14-(s.distance%14),p=1/(1+z*.08),y=horizon+(360-horizon)*p,center=320+curve*(1-p)**2,half=18+260*p;
    for(const side of [-1,1]){const x=center+side*(half+30*p);ctx.fillStyle='#d4c2a1';ctx.fillRect(x-2*p,y-24*p,4*p,24*p);ctx.fillStyle='#e67e63';ctx.fillRect(x-3*p,y-25*p,6*p,6*p);}
  }
  function car(x,y,scale,player=false){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='#10192777';ctx.beginPath();ctx.ellipse(0,-2,44,9,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#161b25';ctx.fillRect(-35,-29,12,31);ctx.fillRect(23,-29,12,31);
    poly([[-32,0],[-30,-28],[-21,-49],[21,-49],[30,-28],[32,0]],player?'#edb363':'#b9ccd2');
    poly([[-21,-47],[-16,-59],[16,-59],[21,-47]],player?'#fbd596':'#dbe9e2');
    poly([[-25,-29],[-18,-47],[18,-47],[25,-29]],'#293c53');
    poly([[-20,-33],[-15,-44],[14,-44],[20,-33]],'#7aadb8');
    ctx.strokeStyle='#e7d7aa66';ctx.lineWidth=1;for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(-22-j,-29+j*3);ctx.lineTo(22+j,-29+j*3);ctx.stroke();}
    poly([[-32,0],[-29,-17],[29,-17],[32,0]],player?'#bf7549':'#7c9da9');
    ctx.fillStyle='#222839';ctx.fillRect(-29,-6,58,5);ctx.fillStyle=keys.has('ArrowDown')&&player?'#ffb497':'#f16f6b';ctx.fillRect(-27,-15,18,5);ctx.fillRect(9,-15,18,5);
    ctx.fillStyle='#d9d2b0';ctx.fillRect(-6,-12,12,5);ctx.fillStyle='#455065';ctx.fillRect(-33,-28,7,4);ctx.fillRect(26,-28,7,4);
    if(player){ctx.fillStyle='#f9d9a0';ctx.fillRect(-28,-18,56,2);}ctx.restore();
  }
  for(const obstacle of [...s.cars].sort((a,b)=>b.z-a.z)){const p=1/(1+obstacle.z*.08),y=horizon+(360-horizon)*p,x=320+curve*(1-p)**2+obstacle.x*(18+260*p)-s.x*8*p;car(x,y,p);}
  if(!s.invincible||Math.floor(s.invincible*12)%2===0)car(320+s.x*230,344,1.1,true);
  const vignette=ctx.createRadialGradient(320,170,140,320,180,400);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#11182780');ctx.fillStyle=vignette;ctx.fillRect(0,0,640,360);
  if(!started||paused||s.done){ctx.fillStyle='#172032c9';ctx.fillRect(125,123,390,108);ctx.strokeStyle='#e3be8277';ctx.strokeRect(131,129,378,96);ctx.textAlign='center';ctx.fillStyle='#e3bf86';ctx.font='10px monospace';ctx.fillText(!started?'AKON MOTOR CLUB / SUNSET RUN':s.done?'LA CARRETERA RECUERDA':'TÓMATE UN RESPIRO',320,150);ctx.fillStyle='#fff0cb';ctx.font='italic bold 35px Georgia';ctx.fillText(!started?'Retro Racer':s.done?'Fin de carrera':'En pausa',320,186);ctx.font='10px monospace';ctx.fillStyle='#c9c2bd';ctx.fillText(!started?'Pulsa INICIAR CARRERA para salir':s.done?s.score+' PUNTOS · GUARDA TU MARCA':'Pulsa CONTINUAR para volver',320,211);}
  if(started&&!paused&&!s.done&&s.speed>45){ctx.strokeStyle='#f2d2a333';ctx.lineWidth=1;for(let i=0;i<8;i++){const y=150+((i*29+s.distance*4)%190);ctx.beginPath();ctx.moveTo(5,y);ctx.lineTo(24,y-13);ctx.stroke();ctx.beginPath();ctx.moveTo(635,y);ctx.lineTo(616,y-13);ctx.stroke();}}
  scoreValue.textContent=String(s.score).padStart(5,'0');lifeValue.textContent='● '.repeat(s.lives)+'○ '.repeat(3-s.lives);timeValue.textContent=String(Math.max(0,60-Math.floor(s.time))).padStart(2,'0')+' s';speedValue.textContent=started&&!paused&&!s.done?Math.round((keys.has('ArrowDown')?16:s.speed)*5)+' km/h':'0 km/h';
 }
 function loop(now){if(disposed)return;const dt=last?Math.min(.25,(now-last)/1000):0;last=now;if(started&&!paused&&!run.state.done){for(let remaining=dt;remaining>0;){const slice=Math.min(.02,remaining);run.step(slice,(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0),keys.has('ArrowDown'));remaining-=slice;}if(run.state.done){difficulty.disabled=false;keys.clear();message.textContent=`Carrera terminada: ${run.state.score} puntos. Escribe tu nombre para guardarlos.`;form.hidden=false;}}draw();frame=requestAnimationFrame(loop);}
 frame=requestAnimationFrame(loop);
 return ()=>{disposed=true;cancelAnimationFrame(frame);abort.abort();keys.clear();};
}
const api={create,ranking,mount};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AkonRacer=api;
})(globalThis);
