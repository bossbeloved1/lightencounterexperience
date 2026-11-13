(() => {
 const canvas=document.getElementById('embers'); if(!canvas)return;
 const ctx=canvas.getContext('2d'); let w,h,particles=[];
 function resize(){w=canvas.width=innerWidth*devicePixelRatio;h=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';particles=Array.from({length:Math.min(100,Math.floor(innerWidth/9))},()=>spawn(true));}
 function spawn(initial=false){return{x:Math.random()*w,y:initial?Math.random()*h:h+Math.random()*100,r:(Math.random()*2+0.5)*devicePixelRatio,vx:(Math.random()-.5)*.45*devicePixelRatio,vy:-(Math.random()*1.25+.35)*devicePixelRatio,a:Math.random()*.65+.2,life:Math.random()*300+120};}
 function frame(){ctx.clearRect(0,0,w,h);particles.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;p.life--;p.a*=.998;ctx.beginPath();ctx.fillStyle=`rgba(255,${Math.floor(90+Math.random()*100)},${Math.floor(20+Math.random()*20)},${p.a})`;ctx.shadowBlur=12*devicePixelRatio;ctx.shadowColor='#ff5b14';ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();if(p.y<-20||p.life<0||p.a<.04)particles[i]=spawn();});requestAnimationFrame(frame);}
 addEventListener('resize',resize);resize();frame();
})();