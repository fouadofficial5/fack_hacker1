/* =========================================================
   HACKER TERMINAL UI — JS (VISUAL SIMULATION ONLY)
   - Typing effect
   - Fake logs & progress
   - Profile rendering from window.DEMO_PROFILE
   ========================================================= */

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const nowTS = (() => {
    let t = 6; // starts after the initial HTML logs
    return () => {
      t += 1;
      const s = String(t).padStart(2, "0");
      return `00:00:${s}`;
    };
  })();

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function addLog(type, msg, status = "OK") {
    const log = $("log");
    if (!log) return;

    const li = document.createElement("li");
    const cls =
      status === "OK" ? "ok" : status === "LOCKED" ? "warn" : "muted";

    li.innerHTML = `
      <span class="ts">${nowTS()}</span>
      <span class="muted">[${escapeHtml(type)}]</span>
      ${escapeHtml(msg)}
      <span class="${cls}">${escapeHtml(status)}</span>
    `;
    log.appendChild(li);

    // Keep log scrolled to bottom
    log.parentElement?.scrollTo?.({ top: 999999, behavior: "smooth" });
  }

  // ---------- Typing effect ----------
  async function typeLine(el, text, options = {}) {
    if (!el) return;
    const {
      minDelay = 12,
      maxDelay = 28,
      jitterChance = 0.04,
      pauseChance = 0.03,
      pauseMin = 120,
      pauseMax = 420
    } = options;

    el.textContent = "";
    for (let i = 0; i < text.length; i++) {
      // tiny “human” pauses
      if (Math.random() < pauseChance) {
        const p = pauseMin + Math.random() * (pauseMax - pauseMin);
        await sleep(p);
      }

      el.textContent += text[i];

      let d = minDelay + Math.random() * (maxDelay - minDelay);

      // jitter to feel “alive”
      if (Math.random() < jitterChance) d *= 2.2;

      await sleep(d);
    }
  }

  // ---------- Screen output writer ----------
  function writeScreen(lines) {
    const screen = $("screen");
    if (!screen) return;

    // Replace screen content fully (but keep it styled)
    // We keep <span> classes by building innerHTML safely
    const html = lines
      .map((l) => {
        // allow small markup tokens in our template
        return l
          .replaceAll("[ok]", `<span class="ok">OK</span>`)
          .replaceAll("[warn]", `<span class="warn">LOCKED</span>`)
          .replaceAll("[muted]", `<span class="muted">`)
          .replaceAll("[/muted]", `</span>`);
      })
      .join("\n");

    screen.innerHTML = html;
  }

  // ---------- Fake progress bar (text-based) ----------
  function progressBar(pct) {
    const width = 22;
    const filled = Math.round((pct / 100) * width);
    const empty = width - filled;
    return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${pct.toString().padStart(3, " ")}%`;
  }

  // ---------- Optional light glitch (visual only) ----------
  function glitchPulse() {
    const term = document.querySelector(".terminal");
    if (!term) return;
    term.style.transform = `translate(${(Math.random() * 2 - 1).toFixed(2)}px, ${(Math.random() * 2 - 1).toFixed(2)}px)`;
    term.style.filter = `brightness(${(1 + Math.random() * 0.06).toFixed(2)})`;
    setTimeout(() => {
      term.style.transform = "";
      term.style.filter = "";
    }, 70);
  }

  // ---------- Profile rendering ----------
  function renderProfile() {
    const p = window.DEMO_PROFILE || {};

    const nameEl = $("pName");
    const phoneEl = $("pPhone");
    const locEl = $("pLoc");
    const ageEl = $("pAge");
    const srcEl = $("pSources");
    const confEl = $("pConf");

    if (nameEl) nameEl.textContent = p.fullName || "—";
    if (phoneEl) phoneEl.textContent = p.phone || "—";
    if (locEl) locEl.textContent = `${p.city || "—"} / ${p.area || "—"}`;
    if (ageEl) ageEl.textContent = p.age || "—";
    if (srcEl) srcEl.textContent = (p.sources || []).join(" + ") || "—";
    if (confEl) confEl.textContent = p.confidence || "—";
  }

  // ---------- Main cinematic sequence ----------
  async function runSequence() {
    const fakeInput = $("fakeInput");

    // Start typing command
    await sleep(200);
    await typeLine(fakeInput, "run profile_recon --mode=simulation --no-network", {
      minDelay: 10,
      maxDelay: 24
    });

    addLog("demo", "command dispatched (sandbox)", "OK");
    await sleep(250);

    // Fake stages
    const stages = [
      { msg: "loading modules: parser, matcher, scorer", ms: 420 },
      { msg: "normalizing identifiers (lowercase / trim)", ms: 520 },
      { msg: "cross-platform correlation: enabled (local)", ms: 520 },
      { msg: "building evidence graph (in-memory)", ms: 520 },
      { msg: "scoring confidence (heuristic)", ms: 520 }
    ];

    for (const s of stages) {
      addLog("stage", s.msg, "OK");
      if (Math.random() < 0.25) glitchPulse();
      await sleep(s.ms);
    }

    // Fake progress output in the screen area
    const baseLines = [
      `[muted][scan][/muted] init: sandbox ready… [ok]`,
      `[muted][scan][/muted] network: disabled (demo) [warn]`,
      `[muted][scan][/muted] source set: local strings only [ok]`,
      ""
    ];

    writeScreen([
      ...baseLines,
      `[muted][task][/muted] analyzing public handles…`,
      `       ${progressBar(12)}`,
      `       ${progressBar(27)}`,
      `       ${progressBar(41)}`
    ]);

    await sleep(450);
    writeScreen([
      ...baseLines,
      `[muted][task][/muted] matching display names across sources…`,
      `       ${progressBar(48)}`,
      `       ${progressBar(62)}`,
      `       ${progressBar(75)}`
    ]);

    await sleep(520);
    writeScreen([
      ...baseLines,
      `[muted][task][/muted] consolidating repeated attributes…`,
      `       ${progressBar(83)}`,
      `       ${progressBar(92)}`,
      `       ${progressBar(100)}`
    ]);

    addLog("demo", "snapshot ready — rendering result card", "OK");
    if (Math.random() < 0.4) glitchPulse();

    // Render profile (from DEMO_PROFILE)
    renderProfile();

    await sleep(300);
    addLog("demo", "finished (visual simulation only)", "OK");

    // Loop subtle activity
    setInterval(() => {
      if (Math.random() < 0.18) glitchPulse();
      if (Math.random() < 0.20) addLog("pulse", "heartbeat", "OK");
    }, 3500);
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    // Ensure placeholders are filled even before the sequence
    renderProfile();

    // Run cinematic sequence
    runSequence().catch(() => {
      // If anything fails, keep it quiet (demo)
    });
  });
})();
