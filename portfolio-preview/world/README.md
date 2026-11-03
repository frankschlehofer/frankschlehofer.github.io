# Walkable portfolio world — local review

The original website remains at `/`; the launcher remains at `/portfolio-preview/`. This tour is reached through **Explore World** or `/portfolio-preview/#world`. These walking-tour changes have not been published.

## Run

From the website checkout (the directory containing `portfolio-preview/`):

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173/portfolio-preview/#world. Wait for the plaza, then click **Start exploring**. WASD moves, mouse looks, E or a click opens a nearby sign, Escape pauses. Closing a panel pauses; click **Resume exploring** to capture the mouse again. **Destinations** provides **View details** without walking and **Go there** to arrive safely outside an exhibit. The toolbar keeps Main Menu and the résumé available. Reset returns to the plaza.

Touch devices get a lightweight destination viewer with no renderer download. Reduced-motion users get the same viewer, with an explicit option to load walking. Unsupported WebGL, blocked pointer lock, module failures, and lost graphics contexts preserve access to HTML content. External video links remain available; detail panels do not load video embeds.

## Implementation choice

Buildless JavaScript modules with locally hosted Three.js **0.187.0** (MIT, license in `vendor/`). This retains static GitHub Pages hosting and avoids a second framework, runtime CDN dependency, or physics engine. Only the small world stylesheet is loaded with the normal portfolio. World code loads on the `#world` route; renderer code loads only for desktop walking or an explicit reduced-motion opt-in. Official APIs were checked against the [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html), and [Raycaster](https://threejs.org/docs/pages/Raycaster.html) documentation.

| File | Responsibility |
| --- | --- |
| `../index.html` | Single content source, stable content IDs, world shell, fallback navigation |
| `../script.js` | Existing section routing, lazy world mounting, cleanup on route exit |
| `interface.mjs` | Loading/ready/exploring/inspecting/paused/failed states, shared content extraction, native modal, focus, destination viewer |
| `exhibits.mjs` | Exhibit IDs, landmarks, positions, safe arrivals, spawn, speed, boundaries |
| `scene.mjs` | Shared block/material batches, sky gradient, static lighting, renderer, quality, lifecycle |
| `landmarks.mjs` | Arched hangar and aircraft, tower lab and drone bench, awning kitchen, timber-framed study |
| `landscape.mjs` | Lantern plaza, paths, trees, planting, rocks, fences, river-edge cliffs, waterfalls, overlook, mountains |
| `player.mjs` | Pointer-lock input, normalized elapsed-time movement, substeps, collisions, recovery |
| `interaction.mjs` | Four-sign raycast, four-unit reach, solid-geometry occlusion |
| `world.css` | Tour layout, menu-style panels, responsive and no-script presentation |
| `vendor/` | Unmodified Three.js module/core builds and license |
| `tests/` | Controller/targeting tests and browser integration checks |

The map is 44 units across; walking speed is 4.5 units/second. Buildings are open-front exhibits with squared aircraft, drone, refrigerator/counter, and computer/book props. Shared cube geometry is instanced by material; only signs are individually raycast. Generated pixel textures use nearest sampling. There are no post-processing effects, dynamic shadows, sound, bobbing, automatic camera motion, or required jumping.

Only four current entries receive world landmarks. All nine projects and all three experience entries remain accessible through their conventional sections.

| Content ID | Landmark | Existing content |
| --- | --- | --- |
| `work-garmin` | Aviation hangar | Software Engineering Intern, Garmin International |
| `project-slayterhil` | Engineering lab | SlayterHiL Hardware-in-the-Loop Testing and Flight Simulation |
| `project-fridge` | Kitchen | Frankie’s Fridge |
| `project-movies` | Study | Hybrid Movie Recommendation System |

## Creative scenery pass

The supplied village reference guides the warm sky, distinct architecture, wooden signboards, central lantern, garden planting, timber details, cliff-edge water, and squared mountain silhouettes. It is a visual reference, not a texture or background asset. All geometry and pixel textures are original code.

The world stays flat along all main walking routes. Terrain relief and water are decorative at the perimeter; the river overlook has rails and a closed end. Exhibit signs sit beside the entrances so they do not obscure the models. Safe arrival positions follow the signs. Garden placement excludes paths and arrival areas.

Lanterns, interior light strips, and the sun use bright unlit materials. They do not add dynamic lights, shadows, bloom, moving water, or an animation loop. Repeated objects remain instanced by shared material. The 30 FPS cap, stationary-camera redraw skipping, and default low-quality resolution are preserved.

Functional browser checks passed after the architecture/sign changes: input, collision, all exhibit panels, route clearance, direct navigation, mobile/reduced-motion viewers, loading failures, cleanup, frame cap and idle rendering. The richer scene measured approximately 28–30 draw calls and 13,000 visible triangles, depending on view, below the 100-call/100,000-triangle targets. It adds geometry and materials compared with the prototype; these counts are not a guarantee of real-device frame rate or temperature. The later mountain/haze refinement was checked through rendered screenshots.

The latest native keyboard walk was 5.11 seconds in the slow automated environment; simulated routes were at most 3.18 seconds from spawn and 6.37 seconds between exhibits via the plaza. Manual navigation and thermal review remain required.

Review screenshots: `/tmp/portfolio-creative-overview.png` is an elevated developer review view, not a new visitor camera mode. `/tmp/portfolio-creative-spawn.png` shows the actual first-person spawn view.

## Edit content or add an exhibit

Edit the original entry in `../index.html`; both the conventional page and world panel read it. There is no second copy of portfolio prose. Panels place the existing summary and quantified contributions first, with the complete entry behind **Read full portfolio entry**.

To add a destination, give its existing portfolio card a unique `id`, add that ID and placement to `EXHIBITS` in `exhibits.mjs`, and choose or extend a visual `kind` in `landmarks.mjs`. Supply an unblocked `arrival` facing the sign. Validate actual collision routes and update review timings when placement changes. Signs use existing entry titles; `label` is a short landmark name. Do not put portfolio copy into the scene builder.

## Checks

From the website checkout:

```sh
node --test portfolio-preview/world/tests/logic.test.mjs
```

For browser checks, use an available Playwright installation and Google Chrome. No test runner is added to the shipped site. Start the server first, then:

```sh
PORTFOLIO_URL=http://localhost:4173/portfolio-preview/ node portfolio-preview/world/tests/browser.cjs
```

If Playwright is outside the checkout, set `PLAYWRIGHT_MODULE` to its module directory. `PORTFOLIO_ARTIFACTS` selects the screenshot output directory (default `/tmp`). Set `ENFORCE_NAVIGATION_BUDGETS=1` to enforce the five-second first-exhibit performance target; by default the browser test reports actual timing, since headless/throttled hosts can run more slowly. Walking checks wait for actual position rather than assuming a fixed number of frames.

Six logic tests check frame-rate independence, diagonal speed, long-gap clamping, collision sliding/tunneling, world bounds, target range/occlusion, and layout distance budgets. Browser checks cover actual pointer lock, keyboard walking, mouse look, sign interaction by E and click, four content panels and safe arrivals, exhibit collision, pause/blur, modal focus trapping, reset, low-quality default and toggle, 30 FPS drawing cap, zero stationary redraws, resize, repeated entry/exit, touch/reduced-motion viewers, no-script content, module failures, missing WebGL, context loss, and denied pointer lock.

Read-only review statistics are available while the renderer exists:

```js
document.querySelector('.world-canvas').getWorldDiagnostics()
```

They include position, actual render frame rate, total rendered frames, the 30 FPS cap, draw calls, triangles, pixel ratio, and resource counts. This function is removed on exit. There is no remote telemetry. Rendering is capped at 30 FPS while moving or looking. A stationary camera does not redraw, even while pointer lock is active; lightweight input updates continue so walking starts immediately. Rendering stops when paused, inspecting, or hidden; only an explicit resize or view change redraws a paused scene.

## Review observations and limits

Automated local review on macOS with an Apple M2 GPU (ANGLE Metal renderer), headless Google Chrome **156.0.8078.74**: 1440 × 900, device pixel ratio 1, default quality. Responsive layout checks also use 320, 390, and 768 pixel widths. Touch tests emulate browser input/layout; they are not physical phone GPU tests.

- Spawn view: 17 draw calls, 2,790 triangles, 17 textures; a nearby aimed view: 15 calls, 2,702 triangles. Stable texture count after three exit/re-entry cycles; canvases removed on exit.
- Normal and diagonal movement use the same speed. Long frame gaps clamp to 50 ms, with collision substeps no larger than 0.08 units.
- First exhibit: approximately **3.4 seconds** in the initial automated keyboard walk; **6.26 seconds** in the later power-saving validation under slower host conditions. This is not a manual stopwatch review; the latest run does not meet the five-second target, so human navigation timing remains open.
- Routes using the actual controller and scene colliders: at most **2.97 simulated seconds** from spawn to any safe arrival and **5.94 simulated seconds** between arrivals via the plaza. These are deterministic simulation results, not measurements of a person finding the route.
- Additional world code/styles: about **2.16 MB raw / 431 KB gzip** across runtime files. Textures are created locally, with no external model/image transfer. Gzip figure is a local compression measurement; the local Python server serves raw files and actual host transfer headers may differ.
- Low quality now defaults **on**, capping pixel ratio at 0.75. Unchecking it raises the cap to 1.5; both modes keep the 30 FPS render limit. On a DPR-1 display the default draws 56% as many pixels as native resolution.
- The initial prototype sampled approximately 60 FPS. The power-saving revision caps drawing at 30 FPS and skips stationary redraws; automated browser checks verify the upper bound, zero stationary redraws, and default low quality. The latest full run observed about 9.3 rendered FPS during walking. A same-session diagnostic comparison also observed only 23 uncapped frames in 2.03 seconds versus 19 capped frames in 2.06 seconds; the slow run was not specific to the new frame cap. This does not establish its cause or quantify temperature, wattage, or battery savings.

Screenshots from the integration run: `/tmp/portfolio-world-desktop.png`, `/tmp/portfolio-world-details.png`, `/tmp/portfolio-world-mobile.png`.

Before public release, Frank should manually review mouse sensitivity and navigation with a stopwatch, legibility/orientation from spawn, and the 60–90 second skim target. Representative physical laptop/phone performance, sustained low-quality FPS, screen-reader behavior, and additional browsers have not been validated. The compact shells and original pixel textures are a first visual pass and can be refined independently of content and movement.
