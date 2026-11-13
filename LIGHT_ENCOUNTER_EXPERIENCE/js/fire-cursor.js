(function(){
  if(!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.documentElement.classList.add('lee-fire-cursor');
  const cursor=document.createElement('div');
  cursor.className='lee-cursor'; cursor.setAttribute('aria-hidden','true'); cursor.textContent='🔥';
  document.body.appendChild(cursor);
  let x=-100,y=-100,last=0;
  document.addEventListener('mousemove',function(e){
    x=e.clientX;y=e.clientY;
    cursor.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-50%)';
    const now=performance.now();
    if(now-last>32){
      last=now;
      const spark=document.createElement('i'); spark.className='lee-spark';
      spark.style.left=x+'px';spark.style.top=y+'px';
      spark.style.setProperty('--dx',(Math.random()*34-17)+'px');
      spark.style.setProperty('--dy',(Math.random()*34+12)+'px');
      document.body.appendChild(spark);setTimeout(()=>spark.remove(),700);
    }
  },{passive:true});
  document.addEventListener('mouseover',function(e){
    if(e.target.closest('a,button,input,select,textarea,label')) cursor.classList.add('lee-hover');
  });
  document.addEventListener('mouseout',function(e){
    if(e.target.closest('a,button,input,select,textarea,label')) cursor.classList.remove('lee-hover');
  });
  document.addEventListener('click',function(e){
    for(let i=0;i<7;i++){
      const spark=document.createElement('i');spark.className='lee-spark';
      spark.style.left=e.clientX+'px';spark.style.top=e.clientY+'px';
      const angle=(Math.PI*2*i)/7,dist=22+Math.random()*22;
      spark.style.setProperty('--dx',Math.cos(angle)*dist+'px');
      spark.style.setProperty('--dy',Math.sin(angle)*dist+'px');
      document.body.appendChild(spark);setTimeout(()=>spark.remove(),700);
    }
  });
})();