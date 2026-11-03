import * as THREE from './vendor/three.module.js';
import { REACH } from './exhibits.mjs';

// Only the four exhibit signs are raycast; solid geometry blocks line of sight.
export function createTargeting(camera, targets, blockers) {
  const raycaster=new THREE.Raycaster();raycaster.far=REACH;
  const center=new THREE.Vector2(),point=new THREE.Vector3(),hits=[];
  return function pick() {
    camera.updateMatrixWorld();
    hits.length=0;raycaster.setFromCamera(center,camera);
    raycaster.intersectObjects(targets,false,hits);
    const hit=hits[0];
    if(!hit)return null;
    for(const box of blockers) {
      const intersection=raycaster.ray.intersectBox(box,point);
      if(intersection && camera.position.distanceTo(intersection)<hit.distance-.08)return null;
    }
    return hit;
  };
}
