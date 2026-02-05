/* =========================================================
   Hacker UI - Cinematic Terminal (UI ONLY)
   File: script.js
   Notes: This is a visual simulation (text/logs only).
========================================================= */

(() => {
  "use strict";

  // ----------------------------
  // SETTINGS (EDIT IF YOU WANT)
  // ----------------------------
  const CONFIG = {
    typingSpeedMin: 10,         // ms
    typingSpeedMax: 35,         // ms
    lineDelayMin: 80,           // ms
    lineDelayMax: 220,          // ms
    bootDelay: 500,             // ms
    logIntervalMin: 900,        // ms
    logIntervalMax: 1800,       // ms
    maxRandomLogs: 140,         // prevent infinite growth
    autoScroll: true,
    showProgressBar: true,
    progressDurationMin: 2200,  // ms
    progressDurationMax: 4200,  // ms
  };

  // ----------------------------
  // HELPERS
  // ----------------------------
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Safe escape for text-only rendering
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  // ----------------------------
  // DOM
  // ----------------------------
  const terminal = document.querySelector(".terminal");
  const body = document.querySelector(".terminal-body");
  if (!terminal || !body) return;

  // Remove the "blink" prompt line from HTML and re-add it dynamically at end
  const blinkLine = body.querySelector(".blink");
  if (blinkLine) blinkLine.remove();

  // Create a fixed prompt line that always stays at bottom
  const prompt = document.createElement("p");
  prompt.className = "line blink";
  prompt.textContent = "root@secure-terminal:~#";
  body.appendChild(prompt);

  // Insert new lines before the prompt
  function insertLine(htmlClass, text, opts = {}) {
    const p = document.createElement("p");
    p.className = `line ${htmlClass || ""}`.trim();

    // Allow a bit of "code-like" formatting with spans, but keep it safe:
    // We'll support simple tokens in text like:
    // [ok], [warn], [fail], {hash}, <ip>, etc. by turning them into spans.
    const formatted = formatCodeLike(text, opts.allowHtml === true);
    p.innerHTML = formatted;

    body.insertBefore(p, prompt);

    if (CONFIG.autoScroll) {
      body.scrollTop = body.scrollHeight;
    }
    return p;
  }

  function formatCodeLike(text, allowHtml) {
    // If allowHtml is false, we escape it.
    let t = allowHtml ? String(text) : esc(String(text));

    // Token coloring (purely visual)
    t = t
      .replace(/\[OK\]|\[✔\]/g, `<span class="green">$&</span>`)
      .replace(/\[WARN\]|\[!\]/g, `<span class="yellow">$&</span>`)
      .replace(/\[FAIL\]|\[X\]/g, `<span class="red">$&</span>`)
      .replace(/\b(root|sudo|admin|access|granted)\b/gi, `<span class="cyan">$1</span>`)
      .replace(/\b(ERROR|FAILED|DENIED)\b/gi, `<span class="yellow">$1</span>`)
      .replace(/\b(TRACE|SCAN|OSINT|INDEX|HASH|CORRELATE|MATCH)\b/gi, `<span class="cyan">$1</span>`);

    // Hash-like tokens
    t = t.replace(/\b[a-f0-9]{16,64}\b/gi, (m) => `<span class="gray">${m}</span>`);

    // Percent highlight
    t = t.replace(/\b(\d{1,3})%\b/g, `<span class="white">$1%</span>`);

    return t;
  }

  async function typeLine(className, text, speedMin = CONFIG.typingSpeedMin, speedMax = CONFIG.typingSpeedMax) {
    const p = document.createElement("p");
    p.className = `line ${className || ""}`.trim();
    body.insertBefore(p, prompt);

    const raw = String(text);
    let out = "";

    for (let i = 0; i < raw.length; i++) {
      out += raw[i];
      p.textContent = out; // keep typing pure text for realism
      if (CONFIG.autoScroll) body.scrollTop = body.scrollHeight;
      await sleep(rand(speedMin, speedMax));
    }

    // After typing completes, apply code-like formatting (safe)
    p.innerHTML = formatCodeLike(out, false);

    await sleep(rand(CONFIG.lineDelayMin, CONFIG.lineDelayMax));
    return p;
  }

  // ----------------------------
  // PROGRESS BAR (VISUAL ONLY)
  // ----------------------------
  function createProgress(label = "Running correlation engine") {
    const wrap = document.createElement("div");
    wrap.style.margin = "10px 0 14px";
    wrap.style.padding = "10px 12px";
    wrap.style.border = "1px solid rgba(0,255,156,0.35)";
    wrap.style.background = "rgba(0,0,0,0.35)";

    const top = document.createElement("div");
    top.style.display = "flex";
    top.style.justifyContent = "space-between";
    top.style.alignItems = "center";
    top.style.gap = "10px";

    const left = document.createElement("span");
    left.className = "cyan";
    left.textContent = `> ${label}`;

    const right = document.createElement("span");
    right.className = "white";
    right.textContent = "0%";

    const barOuter = document.createElement("div");
    barOuter.style.marginTop = "10px";
    barOuter.style.height = "10px";
    barOuter.style.border = "1px solid rgba(0,255,156,0.35)";
    barOuter.style.background = "rgba(0,0,0,0.55)";

    const barInner = document.createElement("div");
    barInner.style.height = "100%";
    barInner.style.width = "0%";
    barInner.style.background = "rgba(0,255,156,0.9)";
    barInner.style.boxShadow = "0 0 12px rgba(0,255,156,0.6)";

    barOuter.appendChild(barInner);
    top.appendChild(left);
    top.appendChild(right);
    wrap.appendChild(top);
    wrap.appendChild(barOuter);

    body.insertBefore(wrap, prompt);
    if (CONFIG.autoScroll) body.scrollTop = body.scrollHeight;

    const duration = rand(CONFIG.progressDurationMin, CONFIG.progressDurationMax);
    const start = performance.now();

    return new Promise((resolve) => {
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const pct = Math.floor(t * 100);
        barInner.style.width = pct + "%";
        right.textContent = pct + "%";
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  // ----------------------------
  // RANDOM LOGS (VISUAL ONLY)
  // ----------------------------
  const RANDOM_LOGS = [
    "[OK] Initializing sandbox runtime...",
    "[OK] Loading modules: net.core, osint.engine, ui.render",
    "[OK] Building correlation graph...",
    "[OK] Indexing public metadata...",
    "[OK] Resolving alias collisions...",
    "[OK] Normalizing name tokens...",
    "[OK] Scoring similarity vectors...",
    "[OK] Deduplicating results...",
    "[OK] Checking timestamp consistency...",
    "[WARN] Rate-limit detected, switching to passive mode...",
    "[OK] Passive mode enabled.",
    "[OK] Extracting profile fragments...",
    "[OK] Generating summary report...",
    "[OK] Signature verified: 9f4c2a1d8b7e3c12",
    "[OK] Session key rotated: 3a7b9c01d4e2f8aa",
    "[OK] Trace route stabilized.",
    "[OK] Output sanitized (UI-only).",
    "[OK] Rendering terminal stream..."
  ];

  const CODE_SNIPPETS = [
    "TRACE::SCAN  - module=osint.engine  state=RUNNING",
    "HASH::INDEX  - bucket=profiles  key=af3d9e7c4b8a11c0",
    "CORRELATE    - sources=[fb,ig,tt,x]  mode=public",
    "MATCH        - confidence=0.92  heuristic=alias_overlap",
    "PIPELINE     - stage=normalize -> score -> validate",
    "SECURE::LOG  - writing output to /tmp/report.json",
    "SYS::HEARTBEAT - uptime=00:00:" + rand(10, 59),
    "VERIFY       - checksum=" + randomHex(32),
  ];

  function randomHex(len) {
    const chars = "abcdef0123456789";
    let out = "";
    for (let i = 0; i < len; i++) out += chars[rand(0, chars.length - 1)];
    return out;
  }

  let randomLogCount = 0;
  let logsRunning = false;

  async function startRandomLogs() {
    if (logsRunning) return;
    logsRunning = true;

    while (randomLogCount < CONFIG.maxRandomLogs) {
      await sleep(rand(CONFIG.logIntervalMin, CONFIG.logIntervalMax));

      const line = Math.random() < 0.6 ? pick(RANDOM_LOGS) : pick(CODE_SNIPPETS);
      const cls = line.includes("[WARN]") ? "yellow" : (line.includes("[OK]") ? "green" : "gray");

      insertLine(cls, line);
      randomLogCount++;
    }

    insertLine("green", "[OK] Stream ended (visual simulation).");
  }

  // ----------------------------
  // BOOT SEQUENCE (CINEMATIC)
  // ----------------------------
  async function boot() {
    // Clear existing content except header dots are outside body; within body we rebuild
    const existing = [...body.querySelectorAll(":scope > *")];
    existing.forEach((el) => el.remove());

    // Re-add prompt at end
    body.appendChild(prompt);

    await sleep(CONFIG.bootDelay);

    await typeLine("green", "[✔] Initializing secure connection...");
    await typeLine("green", "[✔] Establishing encrypted tunnel...");
    await typeLine("green", "[✔] Loading interface renderer...");
    insertLine("gray", "----------------------------------------------");
    await typeLine("cyan", "> Boot sequence: UI simulation mode");
    await typeLine("gray", "No real actions performed. Text/logs are visual only.");
    insertLine("gray", "----------------------------------------------");

    await sleep(120);

    await typeLine("cyan", "> Running OSINT Scan...");
    insertLine("", "Collecting data from public platforms:");
    await sleep(120);

    insertLine("gray", "- Facebook ✔");
    await sleep(80);
    insertLine("gray", "- Instagram ✔");
    await sleep(80);
    insertLine("gray", "- TikTok ✔");
    await sleep(80);
    insertLine("gray", "- Twitter (X) ✔");
    await sleep(140);

    if (CONFIG.showProgressBar) {
      await createProgress("Correlating identifiers");
      await createProgress("Scoring similarity");
    }

    await typeLine("cyan", "> Correlating usernames...");
    await typeLine("green", "[MATCH FOUND]");

    insertLine("yellow", "========== PROFILE RESULT =========");

    // IMPORTANT: keep placeholders; user edits HTML to put any demo data.
    // We only show the placeholders so it stays generic and safe.
    insertLine("", "Name        : <span class='white'>FULL_NAME_HERE</span>", { allowHtml: true });
    insertLine("", "Phone       : <span class='white'>PHONE_NUMBER_HERE</span>", { allowHtml: true });
    insertLine("", "City        : <span class='white'>CITY_NAME_HERE</span>", { allowHtml: true });
    insertLine("", "Location    : <span class='white'>AREA_NAME_HERE</span>", { allowHtml: true });
    insertLine("", "Age         : <span class='white'>AGE_HERE</span>", { allowHtml: true });

    insertLine("yellow", "==================================");

    await sleep(180);

    insertLine("cyan", "> Analysis Summary:");
    insertLine("gray", "Data matched across multiple platforms using username similarity,");
    insertLine("gray", "profile metadata patterns, and public activity timestamps.");
    insertLine("gray", "Output sanitized for UI-only terminal simulation.");

    await sleep(160);

    await typeLine("green", "[✔] Scan completed successfully.");
    await typeLine("green", "[✔] No further action required.");

    insertLine("gray", "----------------------------------------------");
    insertLine("gray", "Tip: Edit FULL_NAME_HERE / PHONE_NUMBER_HERE / etc. in index.html");
    insertLine("gray", "----------------------------------------------");

    // Start ambient random logs to keep it alive
    startRandomLogs();

    // Re-append prompt (already there)
    if (CONFIG.autoScroll) body.scrollTop = body.scrollHeight;
  }

  // ----------------------------
  // OPTIONAL: KEY CONTROLS
  // ----------------------------
  window.addEventListener("keydown", (e) => {
    // R = restart animation
    if (e.key.toLowerCase() === "r") {
      randomLogCount = 0;
      logsRunning = false;
      boot();
    }
    // S = toggle auto scroll
    if (e.key.toLowerCase() === "s") {
      CONFIG.autoScroll = !CONFIG.autoScroll;
      insertLine("gray", `AutoScroll: ${CONFIG.autoScroll ? "ON" : "OFF"}`);
    }
  });

  // Start
  boot();

})();
