# Frank Schlehofer — portfolio

The original portfolio is served from the repository root at https://frankschlehofer.github.io/.

The Minecraft-inspired redesign is a separate, work-in-progress project at https://frankschlehofer.github.io/portfolio-preview/.

## Where to edit

- `index.html`, `styles.css`, `script.js`: original portfolio. Its Projects section links to the preview.
- `portfolio-preview/index.html`, `portfolio-preview/styles.css`, `portfolio-preview/script.js`: redesign content, styles, and behavior.
- `portfolio-preview/assets/`: redesign wordmark, fonts, textures, and scenery.
- `portfolio-preview/README.md`: redesign notes.

## Preview locally

From this directory, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173/ for the original or http://localhost:4173/portfolio-preview/ for the redesign.

Both versions deploy together through GitHub Pages. Keep redesign changes inside `portfolio-preview/` until it is ready to become the homepage.
