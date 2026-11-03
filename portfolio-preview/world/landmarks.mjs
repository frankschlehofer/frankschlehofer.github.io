import { SIGN } from './exhibits.mjs';

// Original, modular exhibit architecture. All walking surfaces stay level.
export function buildLandmark(box, e) {
  const {x,z,kind}=e;
  const b=(key,dx,y,dz,w,h,d,solid=false)=>box(key,x+dx,y,z+dz,w,h,d,solid);
  b('stone',0,.06,0,6.6,.12,6.6);
  if(kind==='hangar') {
    b('dark',0,2,-2.9,6,4,.35,true);
    for(const side of [-1,1]) {
      b('stone',side*3,1.75,0,.45,3.5,6,true);
      b('red',side*3.25,1.2,0,.08,.45,6);
      // Stepped roof ribs give the hangar its own arched silhouette.
      for(let step=0;step<4;step++) {
        const dx=side*(3.05-step*.65), y=3.25+step*.55;
        b('stone',dx,y,0,.8,.6,6.65,true);
        b('white',dx,y+.05,3.24,.82,.45,.25);
      }
      for(let rib=-2;rib<=2;rib+=1) b('dark',side*2.73,2,rib,.08,3.7,.12);
      b('wood',side*3.25,2.25,3.2,.25,.8,.3);
      b('glow',side*3.25,2.25,3.4,.2,.42,.18);
    }
    b('white',0,5,0,2,.35,6.65,true);
    b('glow',0,3.7,2.8,3.8,.12,.12);
    b('gold',-1.8,.14,1.4,.08,.03,3.5);
    b('gold',1.8,.14,1.4,.08,.03,3.5);
    // Single-engine plane, wheels and static propeller.
    b('white',0,1.3,0,.8,.65,3.8,true);
    b('red',0,1.35,.8,.84,.15,1.7);
    b('blue',0,1.85,-.1,.65,.48,1.1);
    b('white',0,1.27,.2,4.8,.16,1.15,true);
    b('red',-2.2,1.28,.2,.35,.19,1.17);
    b('red',2.2,1.28,.2,.35,.19,1.17);
    b('white',0,1.55,-1.6,2,.2,.6);
    b('red',0,2,-1.65,.18,1.1,.7);
    b('dark',0,1.35,2.1,.13,1.6,.12);
    b('dark',0,1.35,2.1,1.6,.13,.12);
    for(const side of [-1,1]) {
      b('dark',side*.65,.5,.6,.28,.7,.4,true);
      crate(b,side*2.65,.55,3.8,.8);
    }
    b('wood',-3.8,2.5,-1,.12,5,.12,true);
    b('red',-3.35,4.7,-1,1.1,.35,.35);
    b('white',-2.85,4.7,-1,.3,.36,.36);
  } else if(kind==='lab') {
    b('white',0,2.2,-2.9,6,4.4,.35,true);
    b('white',-3,2.2,0,.35,4.4,6,true);
    b('white',3,2.2,0,.35,4.4,6,true);
    b('stone',0,4.45,0,6.7,.3,6.7,true);
    b('dark',0,4.1,3.08,6.2,.25,.22);
    b('glow',0,3.9,3.1,4.8,.12,.08);
    // Tower, rooftop garden and large framed side windows.
    b('white',-1.65,5.65,-1.5,2.6,2.3,2.8);
    b('stone',-1.65,6.9,-1.5,2.9,.2,3.1);
    for(const dx of [-2.4,-1.6,-.8]) {
      b('dark',dx,5.7,-.06,.25,1.2,.04);
      b('glow',dx,5.7,-.03,.12,.95,.03);
    }
    for(const side of [-1,1]) {
      b('dark',side*3.19,2.5,-.25,.04,2.3,4.6);
      for(let j=0;j<3;j++) b('glass',side*3.22,2.5,-1.75+j*1.5,.03,2.05,1.26);
    }
    b('leaf',1.75,4.8,-1.3,1.8,.5,2.2);
    for(let i=0;i<5;i++)b('leaf',-3.25,4.4-i*.58,-1.4,.5,.55,.6);
    b('wood',0,.85,0,4.5,1.7,1.8,true);
    b('path',0,1.76,0,4.7,.14,2);
    b('dark',0,2.35,0,3.7,.16,.2);
    b('dark',0,2.35,0,.2,.16,2.3);
    b('white',0,2.4,0,.9,.35,.8);
    for(const [dx,dz] of [[-1.6,0],[1.6,0],[0,-1],[0,1]]) {
      b('red',dx,2.45,dz,.3,.3,.3);
      b('dark',dx,2.6,dz,1,.09,1);
    }
    b('dark',-1.5,2.1,.7,.75,.55,.35);
    b('screen',-1.5,2.1,.9,.6,.4,.04);
    b('glow',-1.5,2.12,.93,.5,.035,.025);
    b('green',1.55,1.9,.6,.6,.12,.55);
  } else if(kind==='kitchen') {
    b('wood',0,2,-2.9,6,4,.35,true);
    b('wood',-3,2,0,.35,4,6,true);
    b('white',3,2,0,.35,4,6,true);
    for(const side of [-1,1])for(let step=0;step<4;step++) {
      b('roof',side*(2.85-step*.72),4+step*.4,0,.9,.48,6.8,true);
    }
    b('roof',0,5.3,0,.6,.26,6.8);
    b('wood',-2.9,2,3,.28,4,.28,true);
    b('wood',2.9,2,3,.28,4,.28,true);
    b('green',0,3.5,3.4,6.5,.18,1.5,true);
    for(let dx=-2.5;dx<=2.5;dx+=1)b('white',dx,3.51,3.4,.45,.2,1.5);
    b('glow',0,3.2,2.9,3.5,.08,.1);
    // Fridge, food prep counter, ingredients and kitchen shelving.
    b('white',-1.7,1.65,0,1.6,3.3,1.5,true);
    b('dark',-1.1,1.7,.8,.1,.65,.12);
    b('stone',-1.7,2.15,.78,1.5,.06,.05);
    b('wood',1.25,.9,0,2.5,1.8,1.8,true);
    b('white',1.25,1.85,0,2.6,.12,1.9);
    for(const [dx,key] of [[.5,'green'],[1.15,'red'],[1.8,'gold']])b(key,dx,2.1,0,.4,.4,.4);
    for(const y of [1.8,2.8]) {
      b('wood',.9,y,-2.6,2.9,.12,.6);
      for(let i=0;i<4;i++)b(['white','green','gold','red'][i],-.1+i*.6,y+.27,-2.55,.3,.42,.3);
    }
    crate(b,3.7,.5,2.5,.8);
  } else {
    // Timber-framed study: warm windows, books, clerestory, two-screen desk.
    b('wood',0,.14,0,6.4,.25,6.4);
    b('dark',0,2.1,-2.9,6,4.2,.3,true);
    for(const side of [-1,1]) {
      b('wood',side*3,2,0,.35,4,6,true);
      b('dark',side*3.2,2.2,-.3,.03,2.9,4.8);
      for(let j=0;j<3;j++) {
        b('glass',side*3.23,2.2,-1.9+j*1.6,.03,2.6,1.38);
        b('wood',side*3.26,2.2,-1.2+j*1.6,.08,2.9,.1);
      }
      b('wood',side*2.85,2,3,.28,4,.28,true);
      b('glow',side*2.85,2.4,3.2,.18,.45,.15);
    }
    b('roof',0,4.2,0,6.8,.32,6.8,true);
    b('wood',.5,4.8,-1,3.4,1,2.6);
    b('glow',.5,4.8,.32,2.8,.5,.04);
    b('roof',.5,5.4,-1,3.8,.25,3);
    for(const y of [1,2,3]) {
      b('wood',0,y,-2.6,5.2,.12,.65);
      for(let i=0;i<10;i++)b(['purple','green','gold','red','blue'][i%5],-2.2+i*.48,y+.32,-2.55,.28,.45+(i%3)*.09,.42);
    }
    b('wood',0,.85,.4,4,1.7,1.7,true);
    for(const dx of [-.75,.75]) {
      b('dark',dx,2.3,.2,1.3,.95,.18);
      b('screen',dx,2.3,.31,1.1,.75,.03);
      b('blue',dx,2.3,.34,.85,.035,.02);
    }
    b('dark',0,1.78,.95,1.4,.08,.5);
    b('white',1.55,1.95,.95,.25,.35,.25);
  }
  // Side-mounted sign keeps the model visible through the open entrance.
  b('wood',SIGN.offsetX-1.15,.5,3.65,.14,1,.2,true);
  b('wood',SIGN.offsetX+1.15,.5,3.65,.14,1,.2,true);
  b('wood',SIGN.offsetX,SIGN.y,3.65,SIGN.width+.2,SIGN.height+.15,.2,true);
}
function crate(b,x,y,z,size) {
  b('wood',x,y,z,size,size,size,true);
  b('path',x,y+size/2+.02,z,size+.03,.06,size+.03);
  b('path',x,y,z+size/2+.02,size*.12,size,.05);
}
