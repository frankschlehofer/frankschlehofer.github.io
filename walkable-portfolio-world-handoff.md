# Codex implementation brief: Walkable portfolio world

## Objective

Implement a compact, walkable 3D world inside Frank Schlehofer’s existing portfolio. Visitors should immediately understand where to go, reach any exhibit quickly, and clearly see Frank’s projects and work experience. Match the general feel of classic Minecraft: blocky geometry, pixel textures, simple lighting, familiar first-person movement, and restrained game-style UI.

The existing landing page and content pages already have the desired Minecraft-inspired appearance. Integrate with that design and reuse its content and components. The current public portfolio is https://frankschlehofer.github.io; inspect the local repository first and use its current content as the implementation source. This brief specifies the new exploration experience and takes priority over earlier suggestions for a clickable diorama.

**Priority order: clarity of work → quick navigation → reliable performance → visual detail.**

## Start here

1. Inspect repository instructions, stack, routes, content sources, assets, and deployment configuration.
2. Identify the existing Explore World entry point, or add one consistent with the current landing menu.
3. Inventory the actual experience/project entries. Reuse their identifiers, copy, screenshots, and links. Do not invent accomplishments, dates, statistics, roles, or projects.
4. Select the smallest suitable implementation within the current stack. Document the choice briefly and proceed with implementation; ask only about genuine blockers.
5. Build one complete working path first: enter world → move to one exhibit → open its real content → close panel → return to menu.

## Visitor experience

### Entry and orientation

- Load the 3D bundle only when the visitor chooses Explore World.
- Show a lightweight loading indicator and a visible way back to the portfolio. Handle load failure with a direct link to the normal content pages.
- Spawn at a small central plaza facing the exhibits. The nearest exhibit should be visible immediately; all major destinations should be visible or clearly signposted from spawn.
- Provide one short instruction line: “WASD to move · Mouse to look · E to view · Esc for menu.” Adapt wording to supported input mode.
- Request pointer lock only from an explicit Start Exploring / Resume click. Do not depend on a pointer-lock request succeeding after asynchronous loading.
- No tutorial sequence, cutscene, dialogue, quest, or required collectible before accessing work.

### Navigation targets

Treat these as design and acceptance targets, then verify with a stopwatch during manual review:

- First exhibit reachable within **5 seconds of ordinary walking** after control begins.
- Every destination reachable from spawn within **10 seconds** without sprinting.
- Any two exhibits reachable within **15 seconds**, with no maze or hidden entrance.
- Core summary visible immediately after one interaction.
- A visitor can skim the highlights in roughly **60–90 seconds**; longer reading is optional.

Use a small open layout, approximately 30–50 world units across with one unit roughly equal to one block, adjusted to meet the timing targets. Keep paths broad, level, and unobstructed. Put information at the front of landmarks; visitors should not need to search buildings or climb stairs.

### Direct access

Provide a persistent, compact “Destinations” control opening a normal HTML list of project and experience titles. Each entry should offer “View details” immediately and optionally “Go there” to move the player to a safe position facing that exhibit. Preserve access to the résumé and main menu. Do not force users to walk to information they already know they want.

### Movement

- First-person camera; WASD movement and mouse look on desktop.
- Normalize diagonal movement and use elapsed time/fixed simulation steps so speed does not depend on frame rate. Clamp long frame gaps.
- Simple grounded motion and collision against terrain, walls, and world boundaries. No physics engine needed unless the existing project already makes it practical.
- Design a flat walkable route; jumping and sprinting are optional polish, never required for navigation.
- No camera bob, shake, inertia-heavy movement, or automatic camera rotations by default.
- Clear movement keys on window blur, pointer unlock, and modal opening to prevent stuck movement.
- Prevent walking through exhibits or falling out of the world. Include a reset-to-spawn action and safe recovery if position becomes invalid.

## World and exhibit design

Use a small hub with a few distinct landmarks and short connecting paths. Choose 3–5 destinations from the actual portfolio. Possible mappings, subject to the repository content:

| Landmark | Work represented | Visual cue |
| --- | --- | --- |
| Aviation hangar | Garmin experience | Small block-built plane or aircraft silhouette |
| Engineering lab | Quadcopter / embedded systems | Simple drone model and electronics bench |
| Kitchen or café | Frankie’s Fridge | Refrigerator, ingredients, or kitchen counter |
| Workshop or study | Other current projects | Computer, machinery, or books reflecting the project |

Do not build empty destinations to fill a quota. Each landmark needs a readable name, a one-line description, and a clear interaction point facing the path. Use distinct silhouettes and limited accent colors to aid orientation. Reuse modular geometry and materials.

Maintain Minecraft-like proportions, pixel textures with crisp sampling, squared terrain, and simple sunlight/ambient lighting. A compact landscape with a few trees and a sky backdrop is sufficient. The earlier generated village image is mood inspiration; do not try to reproduce its dense scenery, cinematic lighting, or high-detail props literally.

Exclude mining, crafting, inventory, survival mechanics, procedural infinite terrain, enemies, multiplayer, accounts, backend services, and persistence beyond optional local preferences. Scope the first release around movement and exhibits.

## Interactions and content

- Use a center-screen raycast limited to nearby interactive targets, approximately 3–4 units away.
- Show a subtle highlight and “E — View [title]” only when the target is in reach and visible. Walls must block interaction.
- Support E and an appropriate pointer interaction without triggering an exhibit accidentally on the initial pointer-lock click.
- Open an accessible HTML panel over the paused world. Release pointer lock, stop movement, and move keyboard focus into the panel.
- Panel content: title, role/context, concise summary, key contributions or results, technologies, and available project/repository/demo links. Use factual content already in the portfolio.
- Put the strongest information first. Show a short summary with an option to read more when needed; avoid giant walls of text.
- Reuse the existing Minecraft multiplayer-menu styling: dark textured panel, pixel headings, clear gray buttons, readable body text.
- Closing the panel returns focus appropriately. Resume control through an explicit click if required by browser pointer-lock rules. Never require visitors to guess why the mouse stopped controlling the camera.
- Keep content in one shared source so conventional pages and exhibits do not drift apart. Exhibit definitions should reference content IDs, not duplicate prose.

## Implementation approach

Choose a browser 3D renderer compatible with the repository; Three.js is a reasonable starting candidate, and React Three Fiber may fit an existing React app. Verify current APIs against official documentation before implementing. Avoid introducing a second framework or a full game engine solely for this feature.

Keep responsibilities clear, adapting filenames to the repository:

- World/scene: geometry, materials, lights, exhibit placement.
- Player controller: input, camera, movement, collision, grounded state.
- Interaction controller: targeting, range/occlusion checks, exhibit activation.
- Exhibit configuration: content ID, world position, target volume, and safe arrival position.
- HTML interface: loading, instructions, destinations, details, pause/resume, fallback.
- Quality/lifecycle: resolution settings, visibility handling, disposal, and error recovery.

Use an explicit state model such as loading → ready → exploring → inspecting/paused. Gameplay input must be inactive while a panel or menu is open. Do not add a state-management dependency if existing component state suffices.

## Browser performance

Make the normal portfolio load independently of the world. Lazy-load rendering code and scene assets. The world should run entirely client-side and remain compatible with the current static hosting setup.

Initial engineering budgets, to measure and revise only with a documented reason:

| Metric | Initial target |
| --- | --- |
| Initial world transfer | At most ~5 MB compressed, including its additional code and essential assets |
| Visible draw calls | Preferably below 100 in the normal view |
| Visible triangles | Preferably below 100,000 |
| Texture size | Usually 256–1024 pixels; larger only with a demonstrated need |
| Rendering | Aim for smooth 60 FPS on a representative laptop, with a usable 30 FPS low-quality mode |

These are targets, not claims of measured results. Record the actual device/browser, viewport, quality settings, and measurements. Do not report a simulated viewport as testing real mobile GPU performance.

- Instance repeated blocks or merge static geometry; do not create one independent draw call per voxel.
- Omit invisible interior faces where practical. Use shared materials and a small texture atlas where it reduces draw calls.
- Prefer simple ambient/directional lighting and baked or simple contact shading. Avoid post-processing, ambient occlusion, high-resolution shadow maps, reflective water, and many dynamic lights in the initial version.
- Cap device pixel ratio, initially around 1–1.5, and provide a low-quality option that reduces render resolution and optional effects.
- Pause rendering when the document is hidden. Pause or heavily reduce rendering when a detail panel fully covers the world.
- Reuse objects in per-frame code. Avoid per-frame application-state updates and avoid raycasting every decorative object.
- Dispose of geometries, textures, materials, listeners, and animation loops on exit. Repeated entry/exit must not accumulate canvases or GPU resources.
- Handle missing WebGL support and rendering/context failure gracefully with access to the normal portfolio.

## Mobile and accessibility

Desktop walking is the first implementation target. On touch devices, provide an intentional lightweight destination viewer using the same real content; offer touch walking only if it is usable and performant. Avoid shipping desktop-only instructions on phones.

- Use semantic HTML for destinations, content, and controls; text must be selectable.
- Give all controls keyboard access and visible focus. Provide direct content access without entering pointer lock or using the 3D canvas.
- When a modal opens, manage focus, support Escape, prevent background interaction, and restore focus on close.
- Respect reduced-motion preferences. Disable decorative motion and favor immediate navigation over animated travel.
- Use readable text sizes and contrast; do not rely only on color or tiny in-world text.
- No autoplay sound. Any later audio must be optional and off by default.

## Milestones

1. **Playable proof:** lazy-loaded world, spawn, movement, collision, one real exhibit, details panel, exit/resume, and failure fallback.
2. **Complete content tour:** compact map, actual project/experience destinations, clear signs, direct navigation, and shared content integration.
3. **Visual and performance pass:** coherent Minecraft feel, optimized geometry/assets, quality control, cleanup, and small-screen behavior.
4. **Review-ready delivery:** functional checks, measured navigation timings, performance notes, screenshots, and concise setup documentation.

After each milestone, summarize completed behavior and remaining issues. Use small, reviewable changes and preserve unrelated work. Deliver a local working implementation; obtain Frank’s authorization before public deployment or paid services.

## Acceptance checklist

- [ ] Explore World is reachable from the existing landing page and does not slow initial normal-page loading.
- [ ] First exhibit takes ≤5 seconds to reach; all exhibits take ≤10 seconds from spawn at walking speed.
- [ ] Visitors immediately see clear destination labels and can open any content through the Destinations menu.
- [ ] Movement, collisions, pointer lock, pause/resume, window blur, and reset behave reliably.
- [ ] Exhibit interaction requires proximity and line of sight.
- [ ] Real work is presented clearly, accurately, and consistently with the standard portfolio.
- [ ] Details panels work with keyboard input and restore focus correctly.
- [ ] The world has a consistent blocky Minecraft feel without distracting gameplay requirements.
- [ ] Touch/reduced-motion/non-WebGL visitors can reach all work through an intentional fallback.
- [ ] Exiting and reopening the world leaves no duplicate canvases, event handlers, or animation loops.
- [ ] Performance budgets are measured where tools permit; deviations and untested devices are disclosed.
- [ ] Existing routes, résumé, links, and ordinary portfolio navigation still work.

Use meaningful automated checks for state transitions/content mapping where appropriate, plus browser checks for movement, panels, resize, focus, and repeated entry/exit. Manually verify first-person controls; do not assume a successful build proves interaction quality. Run repository-required checks and report exactly what passed and what could not be tested.

## Final agent handoff

Return a concise explanation of the implementation, commands to run it, changed files, validated behavior, observed performance, and known limitations. Identify where Frank can add an exhibit or edit content. The result should make his work easy to find within seconds and pleasant to explore for visitors who choose to stay longer.
