import test from 'node:test';
import assert from 'node:assert/strict';
import { movePlayer, isWalkable, PLAYER_RADIUS } from '../player.mjs';
import { createTargeting } from '../interaction.mjs';
import { EXHIBITS, SPAWN, WORLD_LIMIT, WALK_SPEED } from '../exhibits.mjs';
import * as THREE from '../vendor/three.module.js';

test('diagonal and straight walking cover the same distance',()=>{
  const a={x:0,z:0},b={x:0,z:0};
  for(let i=0;i<120;i++){movePlayer(a,1,0,0,1/60,[]);movePlayer(b,1,1,0,1/60,[]);}
  assert.ok(Math.abs(Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))<1e-8);
  assert.ok(Math.abs(Math.hypot(a.x,a.z)-9)<1e-8);
});
test('walking speed is independent of frame rate and clamps long gaps',()=>{
  const a={x:0,z:0},b={x:0,z:0},gap={x:0,z:0};
  for(let i=0;i<60;i++)movePlayer(a,1,0,0,1/60,[]);
  for(let i=0;i<30;i++)movePlayer(b,1,0,0,1/30,[]);
  assert.ok(Math.abs(a.z-b.z)<1e-8);
  movePlayer(gap,1,0,0,10,[]);
  assert.ok(Math.abs(gap.z)<=WALK_SPEED*.05+1e-8);
});
test('walls prevent tunneling while allowing movement along them',()=>{
  const walls=[{minX:-2,maxX:2,minZ:-1,maxZ:-.9,minY:0,maxY:3}];
  const p={x:0,z:0};
  for(let i=0;i<100;i++)movePlayer(p,1,0,0,.05,walls);
  assert.ok(p.z>=-.9+PLAYER_RADIUS);
  movePlayer(p,1,1,0,.05,walls);assert.ok(p.x>0);
});
test('boundaries and non-finite positions are rejected',()=>{
  assert.equal(isWalkable(NaN,0,[]),false);
  assert.equal(isWalkable(0,Infinity,[]),false);
  assert.equal(isWalkable(WORLD_LIMIT+1,0,[]),false);
  const p={x:WORLD_LIMIT-.01,z:0};movePlayer(p,0,1,0,.05,[]);
  assert.ok(p.x<=WORLD_LIMIT);
});
test('exhibit layout fits quick-navigation distance targets',()=>{
  assert.equal(new Set(EXHIBITS.map(e=>e.id)).size,EXHIBITS.length);
  const times=EXHIBITS.map(e=>Math.hypot(e.arrival.x-SPAWN.x,e.arrival.z-SPAWN.z)/WALK_SPEED);
  assert.ok(Math.min(...times)<=5);assert.ok(Math.max(...times)<=10);
  for(const a of EXHIBITS)for(const b of EXHIBITS)assert.ok(Math.hypot(a.arrival.x-b.arrival.x,a.arrival.z-b.arrival.z)/WALK_SPEED<=15);
});
test('targeting requires range, aim, and unobstructed line of sight',()=>{
  const camera=new THREE.PerspectiveCamera(76,1,.1,100);camera.position.set(0,1.7,0);
  const geometry=new THREE.PlaneGeometry(2,2),material=new THREE.MeshBasicMaterial();
  const sign=new THREE.Mesh(geometry,material);sign.position.set(0,1.7,-3);sign.updateMatrixWorld();
  const pick=createTargeting(camera,[sign],[]);
  assert.equal(pick()?.object,sign);
  const wall=new THREE.Box3(new THREE.Vector3(-1,0,-2),new THREE.Vector3(1,3,-1));
  assert.equal(createTargeting(camera,[sign],[wall])(),null);
  sign.position.z=-5;sign.updateMatrixWorld();assert.equal(pick(),null);
  sign.position.set(5,1.7,-3);sign.updateMatrixWorld();assert.equal(pick(),null);
  geometry.dispose();material.dispose();
});
