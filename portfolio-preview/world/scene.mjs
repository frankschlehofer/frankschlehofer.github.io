import * as THREE from './vendor/three.module.js';
import { EXHIBITS, SPAWN, SIGN } from './exhibits.mjs';
import { createPlayer } from './player.mjs';
import { createTargeting } from './interaction.mjs';
import { buildLandmark } from './landmarks.mjs';
import { buildLandscape } from './landscape.mjs';

export function buildScene(content) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e8bba0');
  scene.fog = new THREE.Fog('#e8bba0', 55, 130);
  scene.add(new THREE.HemisphereLight('#ffe4cb', '#68704d', 2.1));
  const sun = new THREE.DirectionalLight('#ffd6a0', 2.6);
  sun.position.set(25, 22, -20); scene.add(sun);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const groups = new Map(), colliders = [], targets = [], resources = new Set([geometry]);
  const colors = { grass:'#7b954b', grassLight:'#91a65c', dirt:'#886443', path:'#c7aa7d', stone:'#96908a', mountain:'#74818c', dark:'#343b39', white:'#e6dfcd', wood:'#92643c', leaf:'#577b37', roof:'#555954', blue:'#73a9b8', gold:'#dbb655', green:'#91af47', purple:'#ad83bd', red:'#a94637', screen:'#326c79', glass:'#b9bfa0', glow:'#ffd16d', water:'#4c8da2', foam:'#a6d3cb', snow:'#e6dbe0', cloud:'#edc3ad', sun:'#ffdf8d', shade:'#647346' };
  let seed = 42;
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  function material(key) {
    const c = document.createElement('canvas'); c.width = c.height = 16;
    const ctx = c.getContext('2d');
    const base = new THREE.Color(colors[key]);
    for (let y=0;y<16;y++) for(let x=0;x<16;x++) {
      const shade = base.clone().multiplyScalar(.82 + random() * .3);
      ctx.fillStyle = '#' + shade.getHexString(); ctx.fillRect(x,y,1,1);
    }
    const texture = new THREE.CanvasTexture(c);
    texture.magFilter = texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    if(['wood','stone','path','roof'].includes(key)) {
      ctx.fillStyle='#302b2220';
      for(let y=0;y<16;y+=8){ctx.fillRect(0,y,16,1);ctx.fillRect(y%16===0?4:12,y,1,8);}
      texture.needsUpdate=true;
    }
    const mat = ['glow','sun','cloud'].includes(key)?new THREE.MeshBasicMaterial({map:texture}):new THREE.MeshLambertMaterial({map:texture});
    resources.add(texture); resources.add(mat); return mat;
  }
  function box(key,x,y,z,w,h,d,solid=false,rotation=0) {
    if (!groups.has(key)) groups.set(key, { material:material(key), blocks:[] });
    groups.get(key).blocks.push({x,y,z,w,h,d,rotation});
    if (solid) colliders.push({minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2});
  }
  // A tiny procedural sky gradient; no panorama image or animated atmosphere.
  const sky=document.createElement('canvas');sky.width=16;sky.height=256;
  const skyContext=sky.getContext('2d');
  const gradient=skyContext.createLinearGradient(0,0,0,256);
  gradient.addColorStop(0,'#897b9d');gradient.addColorStop(.5,'#ddb0a5');gradient.addColorStop(1,'#f4d5ae');
  skyContext.fillStyle=gradient;skyContext.fillRect(0,0,16,256);
  const skyTexture=new THREE.CanvasTexture(sky);skyTexture.colorSpace=THREE.SRGBColorSpace;
  scene.background=skyTexture;resources.add(skyTexture);
  buildLandscape(box,random);
  for (const e of EXHIBITS) {
    const {x,z}=e;
    buildLandmark(box,e);
    const c=document.createElement('canvas');c.width=512;c.height=256;
    const ctx=c.getContext('2d');
    ctx.fillStyle='#b58c55';ctx.fillRect(0,0,512,256);
    for(let y=0;y<256;y+=43){ctx.fillStyle='#76542c';ctx.fillRect(0,y,512,3);}
    ctx.fillStyle='#3e2c1d';ctx.fillRect(0,0,512,10);ctx.fillRect(0,246,512,10);
    ctx.fillStyle=e.color;ctx.fillRect(8,10,496,8);
    ctx.textAlign='center';ctx.fillStyle='#231d16';ctx.font='23px Minecraft, monospace';
    ctx.fillText(e.label,256,61,480);
    ctx.fillStyle='#2b241b';ctx.font='22px Arial';
    const label=content.get(e.id).title;
    const words=label.split(/\s+/);let line='', y=108;
    for(const word of words) {
      if(ctx.measureText(line+word).width>450) {ctx.fillText(line.trim(),256,y);line='';y+=29;}
      line+=word+' ';
    }
    ctx.fillText(line.trim(),256,y);
    ctx.fillStyle='#2b241b';ctx.font='bold 19px Arial';ctx.fillText('E / click to view',256,226);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    tex.magFilter=THREE.NearestFilter;
    const mat=new THREE.MeshBasicMaterial({map:tex});
    const geo=new THREE.PlaneGeometry(SIGN.width,SIGN.height);
    resources.add(tex);resources.add(mat);resources.add(geo);
    const sign=new THREE.Mesh(geo,mat);sign.position.set(x+SIGN.offsetX,SIGN.y,z+3.8);sign.userData.id=e.id;
    scene.add(sign);targets.push(sign);
  }
  const dummy=new THREE.Object3D();
  for(const {material,blocks} of groups.values()) {
    const mesh=new THREE.InstancedMesh(geometry,material,blocks.length);
    blocks.forEach((b,i)=> {dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.rotation,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();scene.add(mesh);
    resources.add(mesh);
  }
  const boxes=colliders.map(b=>new THREE.Box3(new THREE.Vector3(b.minX,b.minY,b.minZ),new THREE.Vector3(b.maxX,b.maxY,b.maxZ)));
  const outlineGeo=new THREE.EdgesGeometry(new THREE.BoxGeometry(SIGN.width+.15,SIGN.height+.15,.05));
  const outlineMat=new THREE.LineBasicMaterial({color:'#ffff86'});
  const outline=new THREE.LineSegments(outlineGeo,outlineMat);outline.visible=false;scene.add(outline);
  resources.add(outlineGeo);resources.add(outlineMat);
  return {scene,colliders,targets,boxes,outline,dispose(){for(const r of resources)r.dispose();scene.clear();}};
}

export function createWorld(host, content, callbacks, lowQuality=true) {
  const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'});
  let model,player,observer;
  const events=new AbortController();
  try {
    host.append(renderer.domElement);
    renderer.domElement.setAttribute('aria-label','First-person portfolio world. Use Destinations for keyboard-accessible content.');
    const camera=new THREE.PerspectiveCamera(76,1,.1,110);
    model=buildScene(content);
    let running=false,disposed=false,raf=0,previous=0,target=null;
    const pick=createTargeting(camera,model.targets,model.boxes);
    const frameInterval=1000/30;
    const drawnPosition=new THREE.Vector3(NaN,NaN,NaN);
    const drawnRotation=new THREE.Quaternion();
    let lastDraw=-Infinity,renderedFrames=0,frameCount=0,frameTotal=0,lastFps=0,targetingDirty=true;
    function render(now=performance.now()) {
      if(disposed||document.hidden)return;
      renderer.render(model.scene,camera);
      drawnPosition.copy(camera.position);drawnRotation.copy(camera.quaternion);
      lastDraw=now;renderedFrames++;frameCount++;
    }
    function aim() {
      const hit=pick();
      target=hit?.object.userData.id||null;
      model.outline.visible=!!hit;
      if(hit){model.outline.position.copy(hit.object.position);model.outline.position.z+=.025;}
      callbacks.target(target);
    }
    function stop() {
      running=false;cancelAnimationFrame(raf);raf=0;target=null;targetingDirty=true;model.outline.visible=false;callbacks.target(null);
    }
    function tick(now) {
      if(!running||disposed)return;
      const elapsed=(now-previous)/1000;
      const dt=Math.min(elapsed,.05);previous=now;
      try {
        player.update(dt);
        // Keep input responsive, but draw at most 30 times/second and only on change.
        const changed=!camera.position.equals(drawnPosition)||!camera.quaternion.equals(drawnRotation);
        if((changed||targetingDirty) && now-lastDraw>=frameInterval-.1) {
          camera.updateMatrixWorld();aim();targetingDirty=false;render(now);
        }
        frameTotal+=elapsed;
        if(frameTotal>=1){lastFps=Math.round(frameCount/frameTotal);frameTotal=0;frameCount=0;}
        raf=requestAnimationFrame(tick);
      } catch(error) {stop();callbacks.failure(error);}
    }
    player=createPlayer(camera,renderer.domElement,model.colliders,{
      lock(locked){
        if(disposed)return;
        if(locked){running=true;previous=performance.now();raf=requestAnimationFrame(tick);}
        else{stop();render();}
        callbacks.lock(locked);
      },
      pause:()=>callbacks.pause(),denied:()=>callbacks.denied(),
      interact(){if(target&&running)callbacks.inspect(target);}
    });
    function resize() {
      renderer.setPixelRatio(lowQuality?Math.min(devicePixelRatio,.75):Math.min(devicePixelRatio,1.5));
      const {width,height}=host.getBoundingClientRect();
      renderer.setSize(Math.max(width,1),Math.max(height,1));
      camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();render();
    }
    observer=new ResizeObserver(resize);observer.observe(host);
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();callbacks.failure(new Error('Graphics context was lost.'));},{signal:events.signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){player.unlock();stop();callbacks.pause();}else render();},{signal:events.signal});
    resize();
    // Useful for review without a permanent render loop or production telemetry.
    host.getWorldDiagnostics=()=>({
      position:{x:camera.position.x,z:camera.position.z},
      yaw:camera.rotation.y, running, target, fps:lastFps, renderedFrames, maxFps:30,
      calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
      pixelRatio:renderer.getPixelRatio(),geometries:renderer.info.memory.geometries,
      textures:renderer.info.memory.textures
    });
    return {
      requestControl:()=>player.requestControl(),
      pause(){player.unlock();stop();render();},
      go(point=SPAWN){player.teleport(point);camera.updateMatrixWorld();render();},
      quality(low){lowQuality=low;resize();},
      dispose(){disposed=true;stop();events.abort();observer.disconnect();player.dispose();model.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();delete host.getWorldDiagnostics;}
    };
  }catch(error){events.abort();observer?.disconnect();player?.dispose();model?.dispose();renderer.dispose();renderer.domElement.remove();throw error;}
}
