# Two Hearts — The Garden of Us

A single-screen romantic puzzle-platformer prototype based on the puzzle you described.

## Puzzle sequence
1. Boy starts on the left.
2. Boy jumps over the lava and reaches the lever.
3. Lever opens the girl's first gate.
4. Girl crosses her lava and reaches her pressure plate.
5. Her plate opens the boy's gate.
6. Boy enters the middle and activates the middle pressure plate.
7. The final gate opens.
8. Girl enters the center and the two meet.

## Controls
- Arrow keys or A/D: move
- Space / Up / W: jump
- Tab: switch character
- Mobile buttons are shown on narrow screens
- R: restart after winning

## Run locally
From this folder:

    python3 -m http.server 8080

Then open:

    http://localhost:8080

## GitHub Pages
Upload the entire folder contents to a public GitHub repository, with `index.html` at the repository root, then enable GitHub Pages from Settings → Pages → Deploy from branch → main → /(root).

## Notes
The character sprites are cropped from the character sheets supplied for this project. The level art is drawn in code so the puzzle geometry remains editable and the entire level stays visible on one screen.
