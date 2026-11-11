// The tempo of a song (BPM), from its backing track.
// 1. onset strength: how much the spectrum suddenly gets louder, every 10 ms (drums, attacks, strums);
// 2. autocorrelation of that curve: the beat period is the shift at which it repeats best;
// 3. a soft preference for song tempos around ~110 BPM picks between 60 / 120 / 240 (the usual "double or half" doubt).
// Returns { bpm, confidence } or null when there is no steady beat (a cappella, rubato) — then nothing is shown.
"use strict";

const Tempo = (() => {
  const SR = 44100, N = 1024, HOP = 441;                 // 10 ms frames
  const MIN_BPM = 60, MAX_BPM = 200;

  // in-place radix-2 FFT (re, im of length N)
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const p = i + k, q = p + len / 2, tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr;
          re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }

  // onset strength envelope (spectral flux on a log-magnitude spectrum), one value per 10 ms
  async function onsets(L, R) {
    const frames = Math.floor((L.length - N) / HOP);
    const env = new Float32Array(Math.max(0, frames));
    const win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
    const re = new Float32Array(N), im = new Float32Array(N), BINS = 256;   // up to ~11 kHz is plenty
    let prev = new Float32Array(BINS), cur = new Float32Array(BINS);
    for (let f = 0; f < frames; f++) {
      const o = f * HOP;
      for (let i = 0; i < N; i++) { re[i] = (L[o + i] + R[o + i]) * 0.5 * win[i]; im[i] = 0; }
      fft(re, im);
      let flux = 0;
      for (let b = 1; b < BINS; b++) { cur[b] = Math.log1p(100 * Math.hypot(re[b], im[b])); const d = cur[b] - prev[b]; if (d > 0) flux += d; }
      env[f] = flux; [prev, cur] = [cur, prev];
      if (f % 2000 === 1999 && typeof yieldUI === "function") await yieldUI();   // keep the page responsive
    }
    // remove the slow trend (a local mean over ~1 s), keep only the sudden rises
    const out = new Float32Array(env.length), W = 50; let s = 0;
    for (let i = 0; i < env.length; i++) {
      s += env[i]; if (i >= 2 * W) s -= env[i - 2 * W];
      const c = i - W; if (c >= 0) out[c] = Math.max(0, env[c] - s / Math.min(i + 1, 2 * W));
    }
    return out;
  }

  // the beat of one stretch of the onset curve: { bpm, confidence } or null
  function beatOf(env) {
    if (env.length < 1000) return null;                  // under ~10 s of music
    const fps = SR / HOP, lagMin = Math.floor(fps * 60 / MAX_BPM), lagMax = Math.ceil(fps * 60 / MIN_BPM);
    let mean = 0; for (const v of env) mean += v; mean /= env.length;
    const x = env.map(v => v - mean);
    const top = Math.min(x.length - 1, 2 * lagMax + 2);       // up to two beats of the slowest tempo (the «double» check)
    const ac = new Float32Array(top + 2);
    let zero = 0; for (const v of x) zero += v * v;
    if (zero <= 0) return null;
    for (let lag = lagMin - 1; lag <= top; lag++) {
      let s = 0; for (let i = lag; i < x.length; i++) s += x[i] * x[i - lag];
      ac[lag] = s / zero;
    }
    // a true beat also shows at half its period (the off-beats) and at double (the next beat): each candidate
    // gets half credit for both, which rules out 3:2 and 4:3 "triplet" impostors; a soft preference for
    // ~110 BPM settles 60 vs 120 the way musicians count (tested on the warm-ups, whose tempo is known)
    const at = l => (l >= lagMin - 1 && l + 1 <= top ? Math.max(ac[l - 1], ac[l], ac[l + 1]) : 0);
    let best = -1, bestScore = -Infinity;
    for (let lag = lagMin; lag <= lagMax; lag++) {
      if (!(ac[lag] >= ac[lag - 1] && ac[lag] >= ac[lag + 1])) continue;      // local peaks only
      const bpm = fps * 60 / lag, prior = Math.exp(-0.5 * (Math.log2(bpm / 110) / 0.9) ** 2);
      const score = (ac[lag] + 0.5 * Math.max(0, at(Math.round(lag / 2))) + 0.5 * Math.max(0, at(2 * lag))) * prior;
      if (score > bestScore) { bestScore = score; best = lag; }
    }
    if (best < 0) return null;
    // how much the chosen beat stands out from the rest of the curve: low → no steady beat
    let rest = 0, n = 0; for (let lag = lagMin; lag <= lagMax; lag++) { rest += Math.abs(ac[lag]); n++; }
    const confidence = ac[best] / (rest / n || 1e-9);
    if (ac[best] < 0.08 || confidence < 2.2) return null;
    const a = ac[best - 1], b = ac[best], c = ac[best + 1], d = (a + c - 2 * b) ? (a - c) / (2 * (a + c - 2 * b)) : 0;
    return { bpm: fps * 60 / (best + d), confidence };
  }

  // the whole song: 60-s windows (a quiet free intro or a breakdown must not blur the answer);
  // the tempo most confident windows agree on (within ±3 %) wins
  async function detect(L, R) {
    const env = await onsets(L, R);
    const WIN = 6000, STEP = 2000, found = [];                 // 60-s windows every 20 s
    if (env.length <= WIN * 1.5) { const r = beatOf(env); if (r) found.push(r); }
    else for (let o = 0; o + WIN <= env.length; o += STEP) {
      const r = beatOf(env.subarray(o, o + WIN)); if (r) found.push(r);
      if (typeof yieldUI === "function") await yieldUI();
    }
    if (!found.length) return null;
    let bestGroup = null;
    for (const f of found) {
      const group = found.filter(g => Math.abs(g.bpm / f.bpm - 1) <= 0.03);
      const weight = group.reduce((s, g) => s + g.confidence, 0);
      if (!bestGroup || weight > bestGroup.weight) bestGroup = { group, weight };
    }
    const g = bestGroup.group;
    if (found.length >= 4 && g.length < found.length * 0.34) return null;   // windows disagree: no steady tempo
    const bpm = g.reduce((s, x) => s + x.bpm * x.confidence, 0) / bestGroup.weight;
    return { bpm: Math.round(bpm), confidence: +(bestGroup.weight / g.length).toFixed(2), windows: `${g.length}/${found.length}` };
  }

  return { detect, _onsets: onsets, _beatOf: beatOf };   // _…: for tests
})();
