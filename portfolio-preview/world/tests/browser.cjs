// Run against a local static server. Set PLAYWRIGHT_MODULE if Playwright is outside this checkout.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4174/portfolio-preview/';
const artifact = name => path.join(process.env.PORTFOLIO_ARTIFACTS || '/tmp', name);
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const errors=[],measurements={};
  try {
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://**/*',r=>r.abort());
    const requests=[];page.on('request',r=>requests.push(r.url()));
    await page.goto(base);
    assert.equal(requests.some(u=>/world\/.*\.(mjs|js)/.test(u)),false,'renderer must be lazy');
    await page.getByRole('link',{name:'Explore World'}).click();
    await page.waitForFunction(()=>document.querySelector('#world').dataset.state==='ready');
    const state=()=>page.locator('#world').getAttribute('data-state');
    const diagnostics=()=>page.evaluate(()=>document.querySelector('.world-canvas').getWorldDiagnostics());
    assert.equal(await page.locator('.world-canvas canvas').count(),1);
    assert.ok((await diagnostics()).calls<100);
    assert.ok((await diagnostics()).triangles<100000);
    measurements.spawn=await diagnostics();
    assert.equal(measurements.spawn.pixelRatio,.75,'low quality defaults on');
    measurements.graphics=await page.evaluate(()=>{
      const gl=document.querySelector('.world-canvas canvas').getContext('webgl2');
      const extension=gl.getExtension('WEBGL_debug_renderer_info');
      return {renderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),userAgent:navigator.userAgent};
    });
    measurements.layout=await page.evaluate(async()=>{
      const {buildScene}=await import('./world/scene.mjs');
      const {readContent}=await import('./world/interface.mjs');
      const {EXHIBITS,SPAWN}=await import('./world/exhibits.mjs');
      const {movePlayer,isWalkable}=await import('./world/player.mjs');
      const model=buildScene(readContent());
      function walk(start,end) {
        const p={x:start.x,z:start.z};let seconds=0;
        while(Math.hypot(p.x-end.x,p.z-end.z)>.1 && seconds<15) {
          const yaw=Math.atan2(-(end.x-p.x),-(end.z-p.z));
          movePlayer(p,1,0,yaw,1/60,model.colliders);seconds+=1/60;
        }
        if(seconds>=15)throw new Error('Blocked route between '+JSON.stringify(start)+' and '+JSON.stringify(end));
        return seconds;
      }
      const fromSpawn=EXHIBITS.map(e=>{if(!isWalkable(e.arrival.x,e.arrival.z,model.colliders))throw new Error('Unsafe arrival');return walk(SPAWN,e.arrival);});
      const viaPlaza=EXHIBITS.flatMap(a=>EXHIBITS.map(b=>walk(a.arrival,SPAWN)+walk(SPAWN,b.arrival)));
      model.dispose();
      return {maxSpawnSeconds:Math.max(...fromSpawn),maxPairViaPlazaSeconds:Math.max(...viaPlaza),method:'simulated controller steps against actual scene colliders'};
    });
    assert.ok(measurements.layout.maxSpawnSeconds<=10);
    assert.ok(measurements.layout.maxPairViaPlazaSeconds<=15);

    await page.getByRole('button',{name:'Start exploring',exact:true}).click();
    await page.waitForFunction(()=>document.pointerLockElement!==null);
    // Captured mouse with a stationary camera must not redraw the scene.
    await page.waitForTimeout(100);
    const idleFrames=(await diagnostics()).renderedFrames;
    await page.waitForTimeout(350);
    assert.equal((await diagnostics()).renderedFrames,idleFrames,'no stationary redraws');
    const walkingFrames=(await diagnostics()).renderedFrames;
    const walkStart=Date.now();
    await page.keyboard.down('a');
    await page.waitForFunction(()=>document.querySelector('.world-canvas').getWorldDiagnostics().position.x<=-1.6);
    await page.keyboard.up('a');
    await page.keyboard.down('w');
    await page.waitForFunction(()=>document.querySelector('.world-canvas').getWorldDiagnostics().target==='project-slayterhil');
    await page.keyboard.up('w');
    measurements.firstExhibitSeconds=(Date.now()-walkStart)/1000;
    measurements.walkingRenderFps=((await diagnostics()).renderedFrames-walkingFrames)/measurements.firstExhibitSeconds;
    assert.ok(measurements.walkingRenderFps<=30.8,'moving camera renders at most 30 FPS, allowing interval boundaries');
    // Performance budgets are optional on heavily throttled/headless hosts. Always report the actual walk.
    if(process.env.ENFORCE_NAVIGATION_BUDGETS==='1')assert.ok(measurements.firstExhibitSeconds<=5,'first exhibit within 5 seconds');
    // Real E interaction while locked, opening the existing portfolio content.
    await page.keyboard.press('e');
    await page.waitForFunction(()=>document.querySelector('dialog').open);
    assert.equal(await state(),'inspecting');
    assert.equal(await page.evaluate(()=>document.pointerLockElement),null);
    assert.match(await page.locator('.world-dialog-body').textContent(),/Protobuf/);
    assert.equal(await page.locator('.world-dialog-close').evaluate(e=>e===document.activeElement),true);
    await page.screenshot({path:artifact('portfolio-world-details.png')});
    await page.keyboard.press('Escape');
    assert.equal(await state(),'paused');
    const stationary=await diagnostics();
    await page.waitForTimeout(150);assert.deepEqual((await diagnostics()).position,stationary.position);
    await page.getByRole('button',{name:'Resume exploring',exact:true}).click();
    await page.waitForFunction(()=>document.pointerLockElement!==null);
    await page.waitForTimeout(1100);measurements.exploring=await diagnostics();
    await page.screenshot({path:artifact('portfolio-world-desktop.png')});
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.querySelector('#world').dataset.state==='paused');
    // All four entries and safe arrivals; each ray target is immediately usable.
    for(let index=0;index<4;index++) {
      await page.locator('.world-destinations').click();
      assert.equal(await page.locator('.world-destination-list > li').count(),4);
      const item=page.locator('.world-destination-list > li').nth(index);
      const title=await item.locator('h3').textContent();
      await item.getByRole('button',{name:'View details',exact:true}).click();
      assert.equal(await page.locator('#world-dialog-title').textContent(),title);
      await page.locator('.world-dialog-close').click();
      await page.locator('.world-destinations').click();
      await page.locator('.world-destination-list > li').nth(index).getByRole('button',{name:'Go there'}).click();
      await page.getByRole('button',{name:'Resume exploring',exact:true}).click();
      await page.waitForFunction(()=>!!document.querySelector('.world-canvas').getWorldDiagnostics().target);
      if(index===1) {
        await page.keyboard.down('w');await page.waitForTimeout(1800);await page.keyboard.up('w');
        assert.ok((await diagnostics()).position.z>=-10,'exhibit collision stops forward walking');
      }
      await page.mouse.click(720,450);
      await page.waitForFunction(()=>document.querySelector('dialog').open);
      await page.locator('.world-dialog-close').click();
    }
    await page.locator('.world-reset').click();
    assert.deepEqual((await diagnostics()).position,{x:0,z:5});
    await page.locator('.world-quality').uncheck();assert.equal((await diagnostics()).pixelRatio,1);
    await page.locator('.world-quality').check();assert.equal((await diagnostics()).pixelRatio,.75);
    // Blur clears held movement keys; resume requires a fresh action.
    await page.getByRole('button',{name:'Resume exploring',exact:true}).click();
    await page.waitForFunction(()=>document.pointerLockElement!==null);
    const yawBefore=(await diagnostics()).yaw;
    await page.mouse.move(800,450);await page.mouse.move(850,450);
    assert.notEqual((await diagnostics()).yaw,yawBefore,'mouse movement changes the camera');
    await page.keyboard.down('w');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    await page.keyboard.up('w');assert.equal(await state(),'paused');
    const paused=await diagnostics();await page.waitForTimeout(150);assert.deepEqual((await diagnostics()).position,paused.position);
    // Native modal traps keyboard focus.
    await page.locator('.world-destinations').click();
    for(let i=0;i<14;i++)await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),true);
    await page.keyboard.press('Escape');
    // Cleanup and re-entry must never accumulate canvases or pointer-lock state.
    for(let i=0;i<3;i++) {
      await page.getByRole('link',{name:'Main Menu',exact:false}).first().click();
      await page.waitForFunction(()=>document.querySelectorAll('.world-canvas canvas').length===0);
      assert.equal(await page.locator('.world-canvas canvas').count(),0);
      await page.getByRole('link',{name:'Explore World'}).click();
      await page.waitForFunction(()=>document.querySelector('#world').dataset.state==='ready');
      assert.equal(await page.locator('.world-canvas canvas').count(),1);
      assert.equal((await diagnostics()).textures,measurements.spawn.textures);
    }
    // Resize and context failure recovery leave ordinary content available.
    for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
    await page.locator('.world-canvas canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
    assert.equal(await state(),'failed');assert.equal(await page.locator('.world-canvas canvas').count(),0);
    await page.locator('.world-browse').click();assert.equal(await page.locator('.world-destination-list > li').count(),4);
    await page.locator('.world-dialog-close').click();
    await page.getByRole('link',{name:'All projects',exact:true}).click();
    assert.equal(await page.locator('#projects .entry-button').count(),9);
    assert.deepEqual(errors,[]);
    // Touch and reduced-motion modes never load renderer code by default.
    for(const options of [{isMobile:true,hasTouch:true,viewport:{width:390,height:844}},{reducedMotion:'reduce',viewport:{width:1440,height:900}}]) {
      const ctx=await browser.newContext(options),p=await ctx.newPage(),loaded=[];
      p.on('request',r=>loaded.push(r.url()));await p.route('https://**/*',r=>r.abort());
      await p.goto(base+'#world');await p.waitForFunction(()=>document.querySelector('#world').dataset.state==='ready');
      assert.equal(loaded.some(u=>u.includes('/world/vendor/')||u.endsWith('/scene.mjs')),false);
      assert.equal(await p.locator('.world-canvas canvas').count(),0);
      await p.locator('.world-browse').click();
      await p.locator('.world-destination-list > li').nth(2).getByRole('button',{name:'View details'}).click();
      assert.match(await p.locator('.world-dialog-body').textContent(),/30\+ active registrations/);
      if(options.isMobile)await p.screenshot({path:artifact('portfolio-world-mobile.png')});
      await p.locator('.world-dialog-close').click();
      await p.getByRole('link',{name:'Main Menu',exact:false}).first().click();
      await p.getByRole('link',{name:'Explore World'}).click();
      await p.waitForFunction(()=>document.querySelector('#world').dataset.state==='ready');
      if(options.reducedMotion)assert.equal(await p.getByRole('button',{name:'Load walking tour'}).count(),1);

      await ctx.close();
    }
    const denied=await context.newPage();
    await denied.addInitScript(()=>{HTMLCanvasElement.prototype.requestPointerLock=function(){return Promise.reject(new Error('Denied for validation'));};});
    await denied.goto(base+'#world');await denied.waitForFunction(()=>document.querySelector('#world').dataset.state==='ready');
    await denied.locator('.world-start').click();
    await denied.waitForFunction(()=>document.querySelector('.world-status').textContent.includes('blocked'));
    await denied.locator('.world-browse').click();assert.equal(await denied.locator('.world-destination-list > li').count(),4);
    await denied.close();
    const noJS=await browser.newContext({javaScriptEnabled:false});
    const simple=await noJS.newPage();await simple.goto(base+'#world');
    assert.match(await simple.locator('#world noscript').textContent(),/All work is available/);
    assert.equal(await simple.locator('#projects .project-card').count(),9);await noJS.close();
    const shellFailure=await context.newPage();await shellFailure.route('**/world/interface.mjs',r=>r.abort());
    await shellFailure.goto(base+'#world');await shellFailure.waitForFunction(()=>document.querySelector('#world').dataset.state==='failed');
    await shellFailure.getByRole('link',{name:'All projects',exact:true}).click();
    assert.equal(await shellFailure.locator('#projects .entry-button').count(),9);await shellFailure.close();
    // Unsupported graphics and a failed module request each preserve direct content.
    for(const failure of ['webgl','module']) {
      const p=await context.newPage();
      if(failure==='webgl')await p.addInitScript(()=>{
        const get=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args)};
      });
      else await p.route('**/world/scene.mjs',r=>r.abort());
      await p.goto(base+'#world');await p.waitForFunction(()=>document.querySelector('#world').dataset.state==='failed');
      await p.locator('.world-browse').click();assert.equal(await p.locator('.world-destination-list > li').count(),4);
      await p.close();
    }
    console.log(JSON.stringify({passed:true,measurements,browser:await browser.version(),viewport:'1440 × 900, DPR 1; also responsive layouts at 320, 390, 768',artifacts:artifact('portfolio-world-*.png')},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
