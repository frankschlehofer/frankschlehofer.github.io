import { EXHIBITS, SPAWN } from './exhibits.mjs';

export function buildLandscape(box, random) {
  box('water',0,-4.7,0,100,.2,100);
  box('grass',0,-.55,0,44,1.1,44);
  box('dirt',0,-1.3,0,43.8,.6,43.8);
  box('path',0,.025,3,9,.05,11);
  const routes=EXHIBITS.map(e=>[SPAWN,e.arrival]);
  for(const [,end] of routes) {
    const dx=end.x-SPAWN.x,dz=end.z-SPAWN.z;
    box('path',dx/2,.04,5+dz/2,2.8,.06,Math.hypot(dx,dz)+1,false,Math.atan2(dx,dz));
  }
  // Shallow stone inlays decorate the hub without adding steps to the controller.
  for(const [x,z,w,d] of [[0,-1.6,5,.22],[0,3,5,.22],[-2.6,.7,.22,4.8],[2.6,.7,.22,4.8]])box('stone',x,.065,z,w,.04,d);
  box('stone',-3,.07,1,2.5,.06,2.5);
  box('stone',-3,.3,1,1.3,.6,1.3,true);
  lantern(box,-3,1,3.3,.7);
  // River overlook: broad planked deck, railings, and a clear closed end.
  box('path',0,.03,13,2.8,.06,10);
  for(let i=0;i<12;i++)box('wood',0,.065,18+i*.3,3.1,.12,.25);
  for(const side of [-1,1]) {
    for(const z of [18,19.5,21]) {
      box('wood',side*1.6,.6,z,.18,1.2,.18,true);
      if(z!==19.5)lantern(box,side*1.6,z,1.6,.28);
    }
    box('wood',side*1.6,.65,19.6,.12,.16,3.4,true);
    box('wood',side*1.6,1.02,19.6,.14,.14,3.4,true);
  }
  box('wood',0,.8,21.45,3.4,.2,.16,true);
  // Jagged stone and dirt beneath the grassy island; water remains outside walking bounds.
  for(let i=-21;i<=21;i+=2)for(const side of [-1,1]) {
    const h=2.5+random()*1.5;
    box('stone',i,-1-h/2,side*21.5,1.8,h,1.8);
    box('stone',side*21.5,-1-h/2,i,1.8,h,1.8);
    box('dirt',i,-.7,side*22,1.6,1.2,.7);
    box('dirt',side*22,-.7,i,.7,1.2,1.6);
    if(Math.abs(i)>3 && i%4===-1) {
      fence(box,i,side*21.1,false);
      fence(box,side*21.1,i,true);
    }
  }
  for(const [x,z] of [[-22.4,10],[22.4,-7]]) {
    box('water',x,-2,z,.35,4.5,2.1);
    box('foam',x+.1,-2,z-.45,.4,4.5,.2);
    box('foam',x,-4.52,z,2.6,.06,3.1);
  }
  // Layers of distant, squared peaks and snow caps instead of a costly terrain mesh.
  for(let i=0;i<13;i++) {
    const x=-54+i*9, height=8+random()*12;
    for(let tier=0;tier<8;tier++) {
      const size=24-tier*2.8;
      box(tier>=6&&height>13?'snow':tier>1?'mountain':'leaf',x,height*(tier+.5)/8-3,-46-i%3*5,size,height/8,size);
    }
  }
  box('sun',25,17,-53,5,5,1);
  for(const [x,y,z] of [[-24,18,-29],[-4,21,-42],[24,23,-30],[-35,24,9],[36,20,8]]) {
    box('cloud',x,y,z,10,.6,3);
    box('cloud',x+2,y+.5,z,6,.5,2.7);
  }
  for(const [x,z,height] of [[-18,-16,5],[-17,-1,5.4],[-18,12,5.8],[18,-17,6],[19,10,5],[10,18,4.6],[-9,18,5.3],[1,-20,6.6],[-12,-20,5],[17,18,6]])tree(box,x,z,height,random);
  function clear(x,z) {
    if(Math.hypot(x,z-2)<5.5 || (Math.abs(x)<2.7&&z>7))return false;
    if(EXHIBITS.some(e=>Math.abs(x-e.x)<4.8&&Math.abs(z-e.z)<4.8))return false;
    return routes.every(([a,b])=>distanceToSegment(x,z,a,b)>2.2);
  }
  // Planting is explicitly kept away from paths and exhibit safe arrivals.
  for(let x=-19;x<=19;x+=2.4)for(let z=-19;z<=19;z+=2.8) {
    const px=x+random()*.8,pz=z+random()*.8;
    if(!clear(px,pz))continue;
    if(random()<.35) {
      box('grassLight',px,.045,pz,.7,.04,.7);
      box('leaf',px,.2,pz,.12,.38,.12);
      const key=random()>.5?'purple':'white';
      box(key,px,.43,pz,.26,.15,.26);
      box('gold',px,.52,pz,.1,.06,.1);
    } else if(random()<.4) {
      box('leaf',px,.25,pz,.75,.5,.75);
      box('green',px+.2,.53,pz,.5,.25,.55);
    } else if(random()<.3) {
      box('stone',px,.25,pz,.7,.5,.8);
      box('stone',px+.25,.5,pz,.45,.4,.55);
    }
  }
  // Small lanterns lead the eye toward the exhibit fronts.
  for(const e of EXHIBITS)lantern(box,e.x+4.35,e.z+4.5,1.3,.3);
}
function distanceToSegment(x,z,a,b) {
  const dx=b.x-a.x,dz=b.z-a.z;
  const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));
  return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);
}
function tree(box,x,z,h,random) {
  box('shade',x,.016,z,4.5,.025,4);
  box('wood',x,h*.38,z,.7,h*.76,.7,true);
  box('wood',x+.65,h*.58,z,1.7,.35,.35);
  const crown=h*.8;
  for(const [dx,dy,dz,w] of [[0,0,0,3.7],[-1,.2,0,2],[1,.3,.6,2.3],[0,.4,-1.1,2.6],[.2,1.3,.1,2.6]]) {
    box(random()>.5?'leaf':'green',x+dx,crown+dy,z+dz,w,1.5,w);
  }
  for(let i=0;i<4;i++)box('leaf',x-1.5+random()*3,crown-.5,z-1.5+random()*3,.7,.8,.7);
}
function fence(box,x,z,side) {
  box('wood',x,.6,z,.18,1.2,.18,true);
  box('wood',x,.5,z,side?.12:1.7,.14,side?1.7:.12,true);
  box('wood',x,.92,z,side?.12:1.7,.14,side?1.7:.12,true);
}
function lantern(box,x,z,h,size) {
  box('wood',x,h/2,z,.12,h,.12,true);
  box('dark',x,h-size*.5,z,size*1.3,.12,size*1.3);
  box('glow',x,h,z,size,size,size);
  box('dark',x,h+size*.6,z,size*1.4,.14,size*1.4);
  for(const dx of [-1,1])for(const dz of [-1,1])box('dark',x+dx*size*.55,h,z+dz*size*.55,.06,size+.12,.06);
}
