> This redesign lives at `/portfolio-preview/`; the original site remains at `/`. Continue editing the redesign in this directory.

# Frank Schlehofer — launcher portfolio

A Minecraft-inspired portfolio using the existing static HTML/CSS/JavaScript stack. No build step. The optional walking tour lazy-loads locally hosted Three.js; ordinary portfolio views do not load the renderer.

## Local preview

From the website checkout (the directory containing `portfolio-preview/`):

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173/portfolio-preview/. Choose **Explore World** for the new tour, or open `http://localhost:4173/portfolio-preview/#world` directly. The `my-app/` Next.js starter is separate. The launcher preview was published previously; the new walking-tour changes remain local.

See [world/README.md](world/README.md) for world architecture, controls, tests, performance observations, and review limitations.

## Structure

- `index.html`: complete portfolio content and semantic launcher navigation.
- `styles.css`: responsive launcher, section browser, focus styles, print and reduced-motion support.
- `script.js`: progressive enhancement, section selection, hash navigation and accessible entry selection.
- `assets/landscape.svg`: original 2800 × 1000 block landscape with extended terrain, clouds, and trees. CSS softly blurs the panorama and pans its background position, reversing smoothly every 40 seconds. Only an 18px bleed is used for the blur; reduced-motion preferences keep it centered and still.
- `assets/dirt.svg` and `assets/stone.svg`: original repeating pixel textures for the section backdrop and beveled buttons.
- `Frank_Schlehofer_Resume.pdf`: supplied résumé with open and download actions.
- `assets/Minecraft.ttf`: locally hosted display font supplied in `minecraft.zip`, used for the title, headings, and menu controls. The archive contains no separate license file; usage rights have not been verified. The earlier Silkscreen font and its SIL Open Font License remain in `assets/`.

No copied game branding, textures, audio, or screenshots. System fonts render body text. Videos use the existing YouTube embeds inside expandable demonstrations, with direct YouTube links as a fallback. The old contact illustration remains in the repository but is not used in the new design.

## Content and reference update — October 29, 2026

The public site was fetched and matched the earlier content snapshot. The supplied screenshots now guide the gray beveled controls, wide dimensional title, yellow angled splash, blurred landscape, brown textured sections, compact selectable rows, and contextual action bar. All texture assets are original SVGs; Silkscreen is bundled under the SIL Open Font License.

The supplied résumé resolves older site details:

- Garmin: May–August 2026; lookup and transformation improvement of up to 50%.
- Purdue: BS and MS in Computer Science, expected December 2027, GPA 3.99/4.00.
- SlayterHiL: team lead from August 2025, including Protobuf/SPI communication work. This now appears under Experience as well as the existing project description.
- Teaching: includes relational databases alongside C and Java.
- Frankie’s Fridge: includes 30+ first-month registrations and an estimated 75% reduction in manual ingredient input.
- Added résumé-listed technologies to the skills view.

The nine existing projects, their repository/demo links, biography, statistics, coursework, and contact destinations remain available. Project selection updates the bottom action to the selected project’s destination. The supplied PDF is served locally and can be opened or downloaded. Existing section fragments and browser Back/Forward continue to work. All content remains accessible without JavaScript.

## Validation

Checked in headless Chrome with Playwright:

- All seven views at 320, 390, 768, and 1440 pixel widths; no horizontal document overflow.
- All nine selectable project entries and three work/leadership roles.
- Direct section links, browser Back/Forward, heading focus, keyboard selection and skip navigation.
- Reduced-motion preference and JavaScript-disabled access to all nine projects.
- No JavaScript runtime errors; no unresolved internal fragment links or duplicate IDs.
- Compared original content and external destinations against the reconstruction; only the former external font stylesheet was replaced with a licensed local font.

The updated design was inspected in desktop and mobile screenshots. The PDF response, all three roles, contextual actions, and internal destinations were checked locally. Earlier external-link checks are historical; external services and video availability can change. Nothing has been deployed.
