# Two Hearts — Anniversary Puzzle

A browser-first, mobile-friendly 2D pixel-art anniversary puzzle game built with Phaser 3.

## Run it

### Easiest
Because the game loads Phaser from a CDN, you can serve the folder with any simple static server.

Python:
```bash
python3 -m http.server 8080
```

Then open:
http://localhost:8080

Node:
```bash
npx serve .
```

## Customize the gift

Open `game.js` and change:

```js
const ANNIVERSARY_MESSAGE = "Happy Anniversary ❤️";
const ANNIVERSARY_DESTINATION_URL = "";
```

For example:

```js
const ANNIVERSARY_MESSAGE = "Happy 3rd Anniversary, My Love ❤️";
const ANNIVERSARY_DESTINATION_URL = "https://your-final-page.com";
```

## Controls

Desktop:
- A / D or Arrow keys — move
- Space / Up — jump
- Tab — switch character

Mobile:
- Bottom-left / center — move
- JUMP — jump
- SWITCH — swap between boy and girl

Landscape orientation is recommended.

## Structure

- `index.html` — browser entry point
- `style.css` — fullscreen/mobile presentation
- `game.js` — game, level, physics, puzzle logic, procedural pixel-art assets

The graphics are intentionally generated as crisp pixel-art primitives so the prototype has no external asset dependency. For a final gift-quality version, replace the procedural sprites/backgrounds with a dedicated pixel-art asset pack while keeping the same gameplay architecture.
