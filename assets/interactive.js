/* ============================================================
   p5.js Textbook — interactive widgets
   ------------------------------------------------------------
   Progressive enhancement. The chapters work as plain static
   pages without this file; with it, three things come alive:

   1. <pre class="runnable">      → Run / Edit / Reset sketch
   2. <div class="quiz-mc">       → multiple choice w/ feedback
   3. <div class="parsons">       → drag-or-tap Parsons Problem

   No dependencies. p5.js (and p5.sound, only for sketches that
   use sound) is loaded from a CDN inside an iframe only when a
   student presses Run. Media paths like 'assets/media/cat.png'
   resolve against the textbook page, so they work on any host.
   ============================================================ */
(function () {
  'use strict';

  // To upgrade p5.js for the whole book, change these two lines.
  var P5_CDN = 'https://cdn.jsdelivr.net/npm/p5@2.4.0/lib/p5.min.js';
  var P5_SOUND_CDN = 'https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.min.js';

  // Only sketches that touch sound pay the cost of loading p5.sound.
  var USES_SOUND = /\bloadSound\s*\(|\bp5\.(SoundFile|Oscillator|SinOsc|TriOsc|SqrOsc|SawOsc|Noise|Envelope|Amplitude|FFT|AudioIn|Reverb|Delay)\b|\buserStartAudio\s*\(/;

  document.addEventListener('DOMContentLoaded', function () {
    toArray(document.querySelectorAll('pre.runnable')).forEach(initSketch);
    toArray(document.querySelectorAll('.quiz-mc')).forEach(initMC);
    toArray(document.querySelectorAll('.parsons')).forEach(initParsons);
  });

  function toArray(list) { return Array.prototype.slice.call(list); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ============================================================
     1. Runnable / editable sketches
     ============================================================ */
  function initSketch(pre) {
    var original = pre.textContent.replace(/\s+$/, '');

    // data-include="#some-id, #other-id" pulls in code from other
    // blocks on the page (e.g. a class definition shown earlier),
    // so a sketch that uses it still runs on its own.
    var includeSel = pre.getAttribute('data-include');

    function includeCode() {
      if (!includeSel) return '';
      return includeSel.split(',').map(function (sel) {
        var node = document.querySelector(sel.trim());
        return node ? node.textContent.replace(/\s+$/, '') : '';
      }).join('\n') + '\n';
    }

    var widget = el('div', 'sketch-widget');
    pre.parentNode.insertBefore(widget, pre);

    var toolbar = el('div', 'sketch-toolbar');
    var runBtn = el('button', 'sketch-btn sketch-btn-run', '\u25B6 Run');
    var editBtn = el('button', 'sketch-btn sketch-btn-ghost', '\u270E Edit');
    var resetBtn = el('button', 'sketch-btn sketch-btn-ghost', '\u21BA Reset');
    var label = el('span', 'sketch-label',
      includeSel ? 'Runs with the code above' : 'Try it live');
    runBtn.type = editBtn.type = resetBtn.type = 'button';
    resetBtn.hidden = true;
    toolbar.appendChild(runBtn);
    toolbar.appendChild(editBtn);
    toolbar.appendChild(resetBtn);
    toolbar.appendChild(label);

    var editor = el('textarea', 'sketch-editor');
    editor.spellcheck = false;
    editor.setAttribute('aria-label', 'Editable p5.js sketch code');
    editor.hidden = true;

    var hint = el('p', 'sketch-hint',
      'Change the code, then press Run again. Reset brings back the original.');
    hint.hidden = true;

    var output = el('div', 'sketch-output');
    output.hidden = true;

    widget.appendChild(toolbar);
    widget.appendChild(pre);
    widget.appendChild(editor);
    widget.appendChild(hint);
    widget.appendChild(output);

    var editing = false;

    function currentCode() {
      return editing ? editor.value : original;
    }

    function enterEditMode() {
      if (editing) return;
      editing = true;
      editor.value = original;
      sizeEditor();
      pre.hidden = true;
      editor.hidden = false;
      hint.hidden = false;
      editBtn.hidden = true;
      resetBtn.hidden = false;
      editor.focus();
    }

    function reset() {
      editing = false;
      editor.hidden = true;
      hint.hidden = true;
      pre.hidden = false;
      editBtn.hidden = false;
      resetBtn.hidden = true;
      output.hidden = true;
      output.innerHTML = '';
    }

    function sizeEditor() {
      var lines = editor.value.split('\n').length;
      editor.style.height = 'auto';
      editor.style.height = Math.max(80, lines * 22.5 + 40) + 'px';
    }

    function run() {
      var support = includeCode();
      var code = currentCode();
      output.innerHTML = '';
      output.hidden = false;
      output.appendChild(buildFrame(support + code, support.split('\n').length - 1,
        loadingHints(code)));
      resetBtn.hidden = false;
      runBtn.textContent = '\u25B6 Run again';
    }

    runBtn.addEventListener('click', run);
    editBtn.addEventListener('click', enterEditMode);
    resetBtn.addEventListener('click', function () {
      reset();
      runBtn.textContent = '\u25B6 Run';
    });
    editor.addEventListener('input', sizeEditor);

    // Tab inserts two spaces instead of leaving the textarea.
    editor.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        var s = editor.selectionStart;
        editor.setRangeText('  ', s, editor.selectionEnd, 'end');
      }
      if (e.key === 'Escape') editor.blur();
    });
  }

  // Runs INSIDE the sketch iframe, before p5 loads. It is
  // serialized with toString() and collapsed onto one line, so it
  // must not contain // comments. It shows three kinds of message
  // above the canvas:
  //   - runtime errors (red), with the sketch line number
  //   - errors thrown inside async setup(), which arrive as
  //     unhandled promise rejections (red)
  //   - p5's own Friendly Error System notes, the "🌸 p5.js says"
  //     messages that normally only reach the browser console (amber)
  function frameHelper(off, hints) {
    var seen = {};
    function show(msg, ln, kind) {
      var box = document.getElementById('p5msg');
      if (!box) {
        document.addEventListener('DOMContentLoaded', function () { show(msg, ln, kind); });
        return;
      }
      var text = (kind === 'fes' ? '\u{1F338} ' : '⚠ ') + msg +
        (ln && ln > off ? ' (around line ' + (ln - off) + ' of your sketch)' : '');
      if (seen[text] || box.children.length >= 3) return;
      seen[text] = true;
      var d = document.createElement('div');
      d.className = kind === 'fes' ? 'fes' : 'err';
      d.textContent = text;
      box.appendChild(d);
    }
    window.addEventListener('error', function (e) {
      if (e.target && e.target !== window && e.target.src) {
        show('Could not load ' + e.target.src, 0, 'err');
        return;
      }
      show(e.message, e.lineno, 'err');
    }, true);
    window.addEventListener('unhandledrejection', function (e) {
      var r = e.reason, ln = 0;
      var m = r && r.message ? r.message : String(r);
      if (r && r.stack) {
        var x = r.stack.match(/about:srcdoc:(\d+)/);
        if (x) ln = +x[1];
      }
      show(m, ln, 'err');
    });
    (hints || []).forEach(function (h) { show(h, 0, 'fes'); });
    ['log', 'warn', 'error'].forEach(function (level) {
      var original = console[level];
      console[level] = function () {
        var first = arguments[0];
        if (typeof first === 'string' && first.indexOf('p5.js says') !== -1) {
          var clean = first.replace(/^\s*\u{1F338}?\s*p5\.js says:\s*/u, '')
            .replace(/\s*\+ More info:[\s\S]*$/, '')
            .replace(/\s*\(\[object Request\]\)/, '');
          show(clean, 0, 'fes');
        }
        return original.apply(console, arguments);
      };
    });
  }

  // p5.js 2.x fails SILENTLY on the two most common loading
  // mistakes, so look for them before running and leave a hint.
  function loadingHints(code) {
    var hints = [];
    var lines = code.split('\n');
    lines.forEach(function (line, i) {
      var bare = line.replace(/\/\/.*$/, '');
      if (/\bfunction\s+preload\s*\(/.test(bare)) {
        hints.push('Line ' + (i + 1) + ': preload() is from p5.js 1.x and never runs in ' +
          'p5.js 2.x. Load files with await inside async function setup() instead.');
      }
      var m = bare.match(/=\s*(load(?:Image|Sound|Font|JSON|Strings|Table|Model)\s*)\(/);
      if (m) {
        hints.push('Line ' + (i + 1) + ': ' + m[1].trim() + '() takes time, so put await in ' +
          'front of it (inside an async function). Without await you get a promise, not your file.');
      }
    });
    return hints.slice(0, 2);
  }

  function buildFrame(code, lineOffset, hints) {
    lineOffset = (lineOffset || 0) + 1;
    // Size the frame from createCanvas(w, h) if we can find one.
    var w = 400, h = 400;
    var m = code.match(/createCanvas\s*\(\s*(\d+)\s*,\s*(\d+)/);
    if (m) { w = parseInt(m[1], 10); h = parseInt(m[2], 10); }
    w = Math.min(Math.max(w, 100), 800);
    h = Math.min(Math.max(h, 100), 700);

    var safe = code.replace(/<\/script/gi, '<\\/script');
    var soundTag = USES_SOUND.test(code)
      ? '<script src="' + P5_SOUND_CDN + '"><\/script>' : '';
    // Resolve relative media paths against the textbook page.
    var base = document.baseURI.replace(/"/g, '%22');

    // Everything before the user's code sits on ONE line, so a
    // runtime error on document line N is sketch line N - 1.
    var helper = frameHelper.toString().replace(/\s*\n\s*/g, ' ');
    var doc =
      '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="' + base + '">' +
      '<style>html,body{margin:0;padding:0}canvas{display:block}' +
      '#p5msg{font:12px/1.5 Menlo,Consolas,monospace}' +
      '#p5msg div{padding:6px 10px;white-space:pre-wrap}' +
      '#p5msg .err{background:#ffebee;color:#b71c1c}' +
      '#p5msg .fes{background:#fff8e1;color:#5d4200}</style>' +
      '<script>(' + helper + ')(' + lineOffset + ',' +
        JSON.stringify(hints || []).replace(/</g, '\\u003c') + ');<\/script>' +
      '<script src="' + P5_CDN + '"><\/script>' + soundTag +
      '</head><body><div id="p5msg"></div><script>\n' +
      safe +
      '\n<\/script></body></html>';

    var frame = document.createElement('iframe');
    // allow-same-origin lets sketches load images and sounds from
    // the textbook's own folder on any host without CORS setup.
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    frame.setAttribute('allow', 'autoplay');
    frame.setAttribute('title', 'p5.js sketch output');
    frame.width = w;
    frame.height = h + 4;
    // Grow the frame when messages appear above the canvas, so the
    // bottom of the sketch is never cut off.
    frame.addEventListener('load', function () {
      try {
        var body = frame.contentDocument.body;
        var fit = function () { frame.height = Math.max(h + 4, body.scrollHeight + 4); };
        if (window.ResizeObserver) new ResizeObserver(fit).observe(body);
        fit();
      } catch (e) { /* cross-origin host: keep the canvas-sized frame */ }
    });
    frame.srcdoc = doc;
    return frame;
  }

  /* ============================================================
     2. Multiple choice questions
     Markup:
       <div class="quiz-mc">
         <p class="quiz-q">Question?</p>
         <ol class="quiz-opts">
           <li data-explain="...">wrong answer</li>
           <li data-correct data-explain="...">right answer</li>
         </ol>
       </div>
     ============================================================ */
  function initMC(quiz) {
    var options = toArray(quiz.querySelectorAll('.quiz-opts li'));
    if (!options.length) return;

    var feedback = el('div', 'quiz-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    quiz.appendChild(feedback);

    options.forEach(function (li) {
      li.setAttribute('role', 'button');
      li.tabIndex = 0;
      li.addEventListener('click', function () { choose(li); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(li); }
      });
    });

    function choose(li) {
      if (quiz.classList.contains('is-answered')) return;
      var right = li.hasAttribute('data-correct');
      var explain = li.getAttribute('data-explain') || '';

      if (right) {
        li.classList.add('is-right');
        quiz.classList.add('is-answered');
        feedback.className = 'quiz-feedback is-right';
        feedback.textContent = '\u2713 Correct! ' + explain;
      } else {
        li.classList.add('is-wrong');
        feedback.className = 'quiz-feedback is-wrong';
        feedback.textContent = '\u2717 Not quite. ' + explain + ' Try again!';
      }
    }
  }

  /* ============================================================
     3. Parsons Problems
     Markup:
       <div class="parsons">
         <p class="quiz-q">Prompt…</p>
         <pre class="parsons-source" hidden><code>lines in
     correct order</code></pre>
       </div>
     Lines are shuffled on load; students reorder them with the
     arrow buttons (iPad-friendly) or by dragging, then Check.
     ============================================================ */
  function initParsons(root) {
    var srcNode = root.querySelector('.parsons-source');
    if (!srcNode) return;

    var correct = srcNode.textContent
      .replace(/^\n+|\s+$/g, '')
      .split('\n')
      .map(function (l) { return l.replace(/\s+$/, ''); });

    var list = el('ol', 'parsons-list');
    list.setAttribute('aria-label', 'Code lines to arrange in order');

    var toolbar = el('div', 'parsons-toolbar');
    var checkBtn = el('button', 'parsons-check', 'Check my answer');
    var shuffleBtn = el('button', 'parsons-shuffle', '\u21BA Start over');
    checkBtn.type = shuffleBtn.type = 'button';
    toolbar.appendChild(checkBtn);
    toolbar.appendChild(shuffleBtn);

    var feedback = el('div', 'quiz-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');

    root.appendChild(list);
    root.appendChild(toolbar);
    root.appendChild(feedback);

    function makeLine(text) {
      var li = el('li', 'parsons-line');
      li.draggable = true;
      var codeSpan = el('span', 'parsons-code', text);
      var arrows = el('span', 'parsons-arrows');
      var up = el('button', 'parsons-btn', '\u25B2');
      var down = el('button', 'parsons-btn', '\u25BC');
      up.type = down.type = 'button';
      up.setAttribute('aria-label', 'Move this line up');
      down.setAttribute('aria-label', 'Move this line down');
      arrows.appendChild(up);
      arrows.appendChild(down);
      li.appendChild(codeSpan);
      li.appendChild(arrows);

      up.addEventListener('click', function () {
        var prev = li.previousElementSibling;
        if (prev) { list.insertBefore(li, prev); clearMarks(); }
      });
      down.addEventListener('click', function () {
        var next = li.nextElementSibling;
        if (next) { list.insertBefore(next, li); clearMarks(); }
      });

      li.addEventListener('dragstart', function (e) {
        li.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', text); } catch (err) {}
      });
      li.addEventListener('dragend', function () {
        li.classList.remove('is-dragging');
        clearMarks();
      });
      return li;
    }

    list.addEventListener('dragover', function (e) {
      e.preventDefault();
      var dragging = list.querySelector('.is-dragging');
      if (!dragging) return;
      var after = getLineAfter(e.clientY);
      if (after == null) list.appendChild(dragging);
      else list.insertBefore(dragging, after);
    });

    function getLineAfter(y) {
      var lines = toArray(list.querySelectorAll('.parsons-line:not(.is-dragging)'));
      var closest = null, closestOffset = -Infinity;
      lines.forEach(function (line) {
        var box = line.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
          closestOffset = offset;
          closest = line;
        }
      });
      return closest;
    }

    function clearMarks() {
      toArray(list.children).forEach(function (li) {
        li.classList.remove('is-right', 'is-wrong');
      });
      feedback.className = 'quiz-feedback';
      feedback.textContent = '';
    }

    function shuffleAndRender() {
      list.innerHTML = '';
      clearMarks();
      var lines = correct.slice();
      // Fisher-Yates; make sure we don't deal it already solved.
      do {
        for (var i = lines.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = lines[i]; lines[i] = lines[j]; lines[j] = t;
        }
      } while (correct.length > 1 && sameOrder(lines, correct));
      lines.forEach(function (text) { list.appendChild(makeLine(text)); });
    }

    function sameOrder(a, b) {
      for (var i = 0; i < a.length; i++) {
        if (a[i].trim() !== b[i].trim()) return false;
      }
      return true;
    }

    checkBtn.addEventListener('click', function () {
      var lines = toArray(list.children);
      var good = 0;
      lines.forEach(function (li, i) {
        var text = li.querySelector('.parsons-code').textContent.trim();
        var ok = i < correct.length && text === correct[i].trim();
        li.classList.toggle('is-right', ok);
        li.classList.toggle('is-wrong', !ok);
        if (ok) good++;
      });
      if (good === correct.length) {
        feedback.className = 'quiz-feedback is-right';
        feedback.textContent =
          '\u2713 Perfect! That\u2019s a working program \u2014 nice work.';
      } else {
        feedback.className = 'quiz-feedback is-partial';
        feedback.textContent =
          good + ' of ' + correct.length +
          ' lines are in the right spot. The red lines need to move.';
      }
    });

    shuffleBtn.addEventListener('click', shuffleAndRender);

    shuffleAndRender();
  }
})();
