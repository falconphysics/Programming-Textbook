# A p5.js Textbook

A self-contained, seven-chapter HTML textbook for teaching creative coding with **p5.js** to high-school students. Heavily inspired by Dan Shiffman's [Coding Train](https://thecodingtrain.com/) and his book *Code! Programming with p5.js*, with embedded Coding Train videos throughout.

Built by a high-school Director of Instructional Technology / AP CSA teacher using Claude for a lot of the heavy lifting, intended for classroom use and hosted on GitHub Pages. You can access my live page here: [https://falconphysics.github.io/Programming-Textbook/](https://falconphysics.github.io/Programming-Textbook/). Or you can set up your own version follwing the directions below.

---

## Chapters

1. **Getting Started** — canvas, shapes, color, coordinates, `setup()` / `draw()`
2. **Variables** — `mouseX/Y`, `let`, animation, `random()`, `map()`
3. **Conditionals** — `if` / `else`, bouncing ball, booleans, logical operators
4. **Loops** — `while`, `for`, nested loops, grids
5. **Functions** — parameters, return values, scope
6. **Objects** — ES6 classes (`constructor`, methods, `this`)
7. **Arrays** — arrays of objects, mouse interaction, `splice()` with backward loops

Each chapter is a single HTML file with all CSS inlined, plus one small shared folder (`assets/`) that powers the interactive features. No build step is required — just open `index.html` in a browser, or host the folder on any static web host.

**Interactive features** (added 2026): every complete sketch in the book has a **▶ Run** button that executes it live on the page in a sandboxed iframe, an **✎ Edit** button that lets students modify the code and re-run it, and a **↺ Reset** that restores the original. Each chapter ends with a **Check Your Understanding** section: three multiple-choice questions with instant explanatory feedback, plus a Parsons Problem (a scrambled program students reorder with drag-and-drop or tap-friendly ▲▼ buttons — works great on iPads). Everything degrades gracefully: with JavaScript disabled, the pages read as a normal static textbook.

---

## Quick Start (local viewing)

```bash
# unzip the textbook, then
cd p5js-textbook
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

That's it. No server required.

---

## Hosting on GitHub Pages

1. **Create a new repository** on GitHub. Name it whatever you want — for example, `p5js-textbook`.

2. **Upload the files.** Drop the contents of this folder (every `.html` file, plus this `README.md`) into the root of the repository. The structure should look like:
   ```
   your-repo/
   ├── index.html
   ├── chapter01.html … chapter07.html
   ├── assets/
   │   ├── interactive.css
   │   └── interactive.js
   └── README.md
   ```
   The `assets/` folder is required — it's what makes the Run buttons and quizzes work.

3. **Turn on GitHub Pages.** In your repo, go to **Settings → Pages**, set the source to **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, then **Save**.

4. **Wait ~1 minute,** then visit `https://<your-username>.github.io/<your-repo>/`. Your textbook is live.

5. **Share with students** by sending them that URL. Each chapter is independently linkable — for example, `https://<your-username>.github.io/<your-repo>/chapter03.html#bouncing-ball` jumps directly to the bouncing-ball section of Chapter 3. Useful for linking from Schoology / Canvas / etc.

### Hosting on a custom domain

If you want to host on something like `textbook.yourschool.org`, see GitHub's [custom-domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

---

## Hosting in Schoology (or any LMS)

If your LMS strips inline `<style>` (Schoology is known to do this with HTML-text content), don't paste the chapter HTML in directly. Instead:

- **Upload the .html files to GitHub Pages first** (instructions above), and
- **Link to them from Schoology** as external resources.

That keeps all your styling and video embeds intact.

---

## File Structure

```
p5js-textbook/
├── index.html              # landing page / table of contents
├── chapter01.html          # Chapter 1: Getting Started
├── chapter02.html          # Chapter 2: Variables
├── chapter03.html          # Chapter 3: Conditionals
├── chapter04.html          # Chapter 4: Loops
├── chapter05.html          # Chapter 5: Functions
├── chapter06.html          # Chapter 6: Objects
├── chapter07.html          # Chapter 7: Arrays
├── assets/
│   ├── interactive.css     # styles for run/edit widgets & quizzes
│   └── interactive.js      # live sketch runner, MC quizzes, Parsons Problems
├── README.md               # this file
└── build.sh                # regenerates the .zip package
```

Each chapter's *content and styling* is self-contained (all CSS inlined), so the pages still render correctly as plain documents anywhere. The interactive features — Run buttons, quizzes, Parsons Problems — come from the shared `assets/` folder and load progressively: if `interactive.js` is missing or JavaScript is off, the chapter is simply a static textbook page. Live sketches load **p5.js v1.11.3 from the jsDelivr CDN** inside a sandboxed iframe at the moment a student presses Run, so students need an internet connection to run code (but not to read).

---

## Design conventions

These are the consistent CSS classes used across every chapter, in case you want to extend the textbook with your own additional content:

### Syntax highlighting (inside `<pre><code>`)
- `.keyword` — purple (for `let`, `const`, `function`, `if`, `else`, `class`, `new`, `return`…)
- `.function` — blue (for function names, both calls and definitions)
- `.number` — orange (for numeric literals)
- `.comment` — gray italic (for `// comments`)
- `.string` — green (for `"strings"`)
- `.class-name` — yellow (for class names like `Ball`, `Particle`)

### Callout boxes
- `.tip` — green, 💡 icon (helpful aside)
- `.alert` — yellow, ⚠️ icon (heads up / important point)
- `.error-example` — red, 🐛 icon (common bug)
- `.exercise` — blue, ✏️ icon (practice problem)

### Layout
- `.video-container` — wraps an `<iframe>` for a responsive 16:9 YouTube embed
- `.chapter-nav` — sticky header nav (prev / contents / next)
- `.chapter-footer` — large prev / next cards at the bottom of each chapter
- `.toc-grid` / `.toc-card` — used on `index.html`

### Interactive widgets (enhanced by `assets/interactive.js`)

**Runnable sketch** — add `class="runnable"` to any `<pre>` whose code is a complete p5 sketch:
```html
<pre class="runnable"><code>…highlighted sketch code…</code></pre>
```
The plain source is recovered from the highlighted markup's text content, so nothing is duplicated. If the sketch depends on a class or function shown in a *different* block, give that block an `id` and reference it:
```html
<pre id="def-ball-class"><code>class Ball { … }</code></pre>
<pre class="runnable" data-include="#def-ball-class"><code>let b = new Ball(); …</code></pre>
```
The included code is silently prepended when the student presses Run (and the widget's corner label changes to "Runs with the code above"). Runtime errors appear inside the output frame with an approximate line number — deliberately, so buggy example code becomes a live demo.

**Multiple-choice question:**
```html
<div class="quiz-card quiz-mc">
  <p class="quiz-q">Question?</p>
  <ol class="quiz-opts">
    <li data-explain="Why this is wrong.">Wrong answer</li>
    <li data-correct data-explain="Why this is right.">Right answer</li>
  </ol>
</div>
```
Wrong answers show their explanation and allow retries; the correct answer locks the question.

**Parsons Problem** — put the lines in the **correct** order inside a hidden source block; they're shuffled on page load:
```html
<div class="quiz-card parsons">
  <p class="quiz-q">Arrange the lines to…</p>
  <pre class="parsons-source" hidden><code>line one
line two
line three</code></pre>
</div>
```
Students reorder with ▲▼ buttons (touch-friendly) or drag-and-drop, then press **Check my answer** for per-line feedback. Write prompts so only one order is valid (e.g., "starting with a line at x = 0").

All chapters use the same fonts (Iowan Old Style / Palatino for body, Helvetica Neue / Inter for sans, JetBrains Mono / Fira Code for code) and a shared p5-pink (`#ed225d`) accent color.

---

## Coding Train video credits

Every embedded video is the work of **Daniel Shiffman** and the Coding Train. Embedded under YouTube's standard embed terms; please visit [thecodingtrain.com](https://thecodingtrain.com/) and the [Coding Train YouTube channel](https://www.youtube.com/@TheCodingTrain) for the full curriculum, code examples, and Dan's enthusiasm in its native habitat.

Video IDs used:

| Ch. | Video IDs |
|-----|-----------|
| 1 | yPWkPOfnGsw, MXs1cOlidWs, c3TeLi6Ns1E, riiJTF5-N7c |
| 2 | 7A5tKW9HGoM, dRhXIIFp-ys, T26OJGjI8qI, POn4cZ0jL-o, nicMAoW6u1g |
| 3 | 1Osb_iGDdjk, LO3Awjn_gyU, r2S7j54I68c, Rk-_syQluvc |
| 4 | cnRD9o6odjk, 1c1_TMdf8b8 |
| 5 | wRHAitGzBrg, zkc417YapfE, qRnUBiTJ66Y |
| 6 | xG2Vbnv0wvg, T-HGdc8L-7w, rHiSsgFRgx4 |
| 7 | VIQoUghHSxU, RXWO3mFuW-I, fBqaA7zRO58, TaN5At5RWH8, tA_ZgruFF9k |

---

## Licensing

This project uses a **dual license**:

### Prose, exercises, and design — CC BY-SA 4.0

All the *written content* of this textbook (the chapter prose, exercises, beginner-mistake explanations, and overall pedagogical structure) is licensed under the **[Creative Commons Attribution–ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/)**.

You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially

Under the following terms:
- **Attribution** — You must give appropriate credit and link to the license.
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license.

### Code samples — MIT License

All **code samples** within the textbook (the p5.js code snippets shown in `<pre><code>` blocks, the example sketches, and the exercise starter code) are released under the **MIT License**:

```
MIT License

Copyright (c) 2026 the textbook author(s)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Students copying snippets from this book into their own sketches do **not** need to include any attribution — code samples are MIT, copy freely.

### Embedded video content

Embedded Coding Train videos remain the property of Daniel Shiffman / the Coding Train and are *not* covered by this textbook's license. They are embedded via YouTube under YouTube's standard terms.

### p5.js itself

[p5.js](https://p5js.org/) is its own project, separately licensed under the LGPL 2.1. Nothing in this textbook redistributes p5.js — students load it from the p5.js Web Editor or via CDN as they normally would.

---

## Rebuilding the zip

If you've edited any of the chapter files and want to repackage everything:

```bash
./build.sh
```

This produces `p5js-textbook.zip` in the parent directory, with everything under a top-level `p5js-textbook/` folder for clean extraction.

---

## Feedback / contributions

This is a teaching artifact, not a polished product. If you spot a typo, a confusing explanation, a broken video link, or a bug in a code sample, open an issue or a pull request on the repo — your students (and mine) will thank you.

Happy teaching. May your students discover that code is one of the most beautiful ways to think.

🚂✨
