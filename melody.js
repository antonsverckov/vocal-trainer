// The sung melody of a separated vocal track: a pitch line every 10 ms (YIN), then notes.
// Notes are what the trainer shows as bars and scores; the line keeps the singer's slides,
// vibrato and runs and is drawn under the student's own line.
"use strict";

const Melody = (() => {
  const RATE = 22050, WIN = 1024, HOP = 220;          // ~46 ms window, 10 ms hop at 22.05 kHz
  const FMIN = 70, FMAX = 1100;                        // low male voice … high female voice
  // dip: YIN dip threshold; aper: aperiodicity of a clearly voiced frame; loose: of a frame that continues
  // a clear neighbour's pitch (breathy, reverberant or sliding singing); gate: loudness gate vs the song's peak
  // (-45 dB: soft verses count; leftovers of the separation fail the periodicity test anyway)
  const opts = { dip: 0.25, aper: 0.35, loose: 0.6, gate: 0.0056 };

  // stereo 44.1 kHz → mono 22.05 kHz (average pairs; vocals carry little above 11 kHz)
  function mono(L, R) {
    const n = Math.floor(L.length / 2), out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = (L[2 * i] + L[2 * i + 1] + R[2 * i] + R[2 * i + 1]) * 0.25;
    return out;
  }

  // YIN on one frame: [frequency, aperiodicity (0 = perfectly periodic)]
  const maxT = Math.floor(RATE / FMIN), minT = Math.floor(RATE / FMAX);
  const d = new Float32Array(maxT + 1), cm = new Float32Array(maxT + 1);
  function yin(x, off) {
    const N = WIN - maxT;
    for (let t = minT; t <= maxT; t++) { let s = 0; for (let i = 0; i < N; i++) { const v = x[off + i] - x[off + i + t]; s += v * v; } d[t] = s; }
    let run = 0;
    for (let t = 1; t <= maxT; t++) { if (t >= minT) run += d[t]; cm[t] = t < minT ? 1 : d[t] * (t - minT + 1) / (run || 1); }
    let tau = -1;
    for (let t = minT + 1; t < maxT; t++) if (cm[t] < opts.dip) { while (t + 1 < maxT && cm[t + 1] < cm[t]) t++; tau = t; break; }
    if (tau < 0) {                                   // no clear dip: the best one, its aperiodicity decides
      tau = minT + 1; for (let t = minT + 2; t < maxT; t++) if (cm[t] < cm[tau]) tau = t;
    }
    const a = cm[tau - 1], b = cm[tau], c = cm[tau + 1], den = a + c - 2 * b;
    const sh = den ? (a - c) / (2 * den) : 0;
    return [RATE / (tau + sh), b];
  }
  const toMidi = f => 69 + 12 * Math.log2(f / 440);

  // pitch line: [[t, midi | null]] every 10 ms (async: works in slices, the page stays responsive)
  async function contour(L, R, onProgress = () => {}) {
    const x = mono(L, R), frames = Math.max(0, Math.floor((x.length - WIN) / HOP));
    const rms = new Float32Array(frames);
    let peak = 1e-9;
    for (let f = 0; f < frames; f++) { let s = 0; for (let i = 0; i < WIN; i++) s += x[f * HOP + i] ** 2; rms[f] = Math.sqrt(s / WIN); if (rms[f] > peak) peak = rms[f]; }
    const gate = peak * opts.gate;
    const est = new Array(frames), out = new Array(frames).fill(null);
    for (let f = 0; f < frames; f++) {
      if (rms[f] > gate) { const [hz, ap] = yin(x, f * HOP); if (hz) { est[f] = [toMidi(hz), ap]; if (ap < opts.aper) out[f] = est[f][0]; } }
      if (f % 500 === 0) { onProgress(f / frames); await yieldUI(); }
    }
    // second pass: a less clear frame counts when it carries on the pitch of a clear one nearby
    for (let pass = 0; pass < 3; pass++) {
      for (let f = 0; f < frames; f++) {
        const e = est[f];
        if (out[f] != null || !e || e[1] >= opts.loose) continue;
        for (let k = 1; k <= 3; k++) {
          const nb = (out[f - k] != null ? out[f - k] : out[f + k]);
          if (nb == null) continue;
          let m = e[0]; if (Math.abs(m - nb) > 9) m += 12 * Math.round((nb - m) / 12);   // octave slip of the estimate
          if (Math.abs(m - nb) < 1) { out[f] = m; break; }
        }
      }
    }
    // smooth: 5-frame median over voiced runs; lone octave jumps folded back
    const sm = out.slice();
    for (let f = 2; f < frames - 2; f++) {
      const w = [out[f - 2], out[f - 1], out[f], out[f + 1], out[f + 2]].filter(v => v != null);
      if (out[f] == null || w.length < 3) continue;
      w.sort((a, b) => a - b); const med = w[w.length >> 1];
      sm[f] = Math.abs(out[f] - med) > 7 ? out[f] + 12 * Math.round((med - out[f]) / 12) : out[f];
    }
    const t0 = WIN / 2 / RATE;
    return sm.map((m, f) => [Math.round((t0 + f * HOP / RATE) * 1000) / 1000, m == null ? null : Math.round(m * 100) / 100]);
  }

  // notes: steady stretches of the line, rounded to the nearest semitone
  function notes(line) {
    const out = [];
    let cur = null;
    const close = () => {
      if (!cur) return;
      const ms = cur.ms.slice().sort((a, b) => a - b), med = ms[ms.length >> 1];
      if (cur.e - cur.s >= 0.12) out.push([cur.s, cur.e, Math.round(med)]);
      cur = null;
    };
    let away = 0, gap = 0;
    for (const [t, m] of line) {
      if (m == null) { if (cur && ++gap > 6) close(); continue; }       // > 60 ms of silence ends a note
      gap = 0;
      if (!cur) { cur = { s: t, e: t, ms: [m] }; away = 0; continue; }
      const ref = cur.ms.slice(-12).sort((a, b) => a - b)[Math.min(cur.ms.length, 12) >> 1];
      if (Math.abs(m - ref) > 0.7) {
        if (++away >= 4) {                                              // 40 ms on a new pitch: a new note
          const keep = cur.ms.splice(-(away - 1)); cur.e = t - away * 0.01; close();   // the frames already on the new pitch move over
          cur = { s: t - (away - 1) * 0.01, e: t, ms: keep };
          away = 0;
        }
      } else away = 0;
      cur.ms.push(m); cur.e = t;
    }
    close();
    // same pitch with a tiny breath between: one note
    const merged = [];
    for (const n of out) {
      const p = merged[merged.length - 1];
      if (p && p[2] === n[2] && n[0] - p[1] < 0.08) p[1] = n[1]; else merged.push(n.slice());
    }
    // a short note far from both neighbours is a separation / detection glitch
    const clean = merged.filter((n, i) => {
      const a = merged[i - 1], b = merged[i + 1], short = n[1] - n[0] < 0.25;
      const far = x => !x || Math.abs(x[2] - n[2]) > 8;
      return !(short && far(a) && far(b));
    });
    // short notes far outside the song's own range (5th–95th percentile by time) are glitches too
    const byTime = clean.flatMap(n => Array(Math.max(1, Math.round((n[1] - n[0]) * 10))).fill(n[2])).sort((a, b) => a - b);
    const lo = byTime[Math.floor(byTime.length * 0.05)], hi = byTime[Math.floor(byTime.length * 0.95)];
    const kept = clean.filter(n => n[1] - n[0] >= 0.3 || (n[2] >= lo - 7 && n[2] <= hi + 7));
    return kept.map(([s, e, m]) => [Math.round(s * 1000) / 1000, Math.round(e * 1000) / 1000, m]);
  }

  // key of the melody: time spent on each pitch class against the Krumhansl–Kessler profiles of all
  // 24 keys; returns { pc (0 = C), mode: "major" | "minor", fit (correlation) }
  const MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  function key(ns) {
    const h = new Array(12).fill(0);
    for (const [s, e, m] of ns) h[((m % 12) + 12) % 12] += e - s;
    const corr = (a, b) => {
      const ma = a.reduce((x, y) => x + y) / 12, mb = b.reduce((x, y) => x + y) / 12;
      let num = 0, da = 0, db = 0;
      for (let i = 0; i < 12; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
      return num / Math.sqrt(da * db || 1);
    };
    let best = { pc: 0, mode: "major", fit: -2 };
    for (let pc = 0; pc < 12; pc++) for (const [mode, prof] of [["major", MAJ], ["minor", MIN]]) {
      const rot = h.map((_, i) => h[(i + pc) % 12]);          // the candidate tonic moved to index 0
      const fit = corr(rot, prof);
      if (fit > best.fit) best = { pc, mode, fit: Math.round(fit * 100) / 100 };
    }
    return best;
  }

  return { contour, notes, key, opts };
})();
