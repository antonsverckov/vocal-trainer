// Vocal / instrumental separation in the browser — nothing leaves the device.
//
// Model: htdemucs (Hybrid Transformer Demucs, Meta AI, MIT) exported to ONNX for onnxruntime-web
// as 21 chained pieces (models/htdemucs, from huggingface.co/monteslu/htdemucs-web-onnx).
// Runs on the GPU through WebGPU; without it, on the CPU (much slower).
//
// The pre/post-processing mirrors demucs (htdemucs.py _spec/_ispec, apply.py split + overlap-add,
// separate.py normalisation): 7.8 s segments with 25 % overlap and triangular cross-fades,
// a 4096-point normalised STFT with demucs' extra reflect padding, complex-as-channels spectra.
// Only the vocals are rebuilt; the instrumental is the mix minus the vocals.
"use strict";

// Hand control back to the page for a moment. A message (not setTimeout) keeps full speed even
// when the tab is in the background, where browsers slow timers down to once a second.
const yieldUI = (() => {
  const ch = new MessageChannel(), queue = [];
  ch.port1.onmessage = () => { const r = queue.shift(); if (r) r(); };
  return () => new Promise(r => { queue.push(r); ch.port2.postMessage(0); });
})();

const Separator = (() => {
  const ORT_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/";
  // the model sits next to this script, whichever page loads it
  const MODEL_DIR = new URL("models/htdemucs/", (document.currentScript && document.currentScript.src) || location.href).href;
  const SR = 44100, SEG = 343980, NFFT = 4096, HOP = 1024, BINS = 2048, FRAMES = 336;
  const VOCALS = 3;                               // sources: drums, bass, other, vocals
  const CPU_NODES = ["/ReduceMean", "/Sub", "/Pow", "/ReduceMean_1", "/Clip", "/Sqrt", "/Add", "/Div",
                     "/ReduceMean_2", "/Sub_1", "/Pow_1", "/ReduceMean_3", "/Clip_1", "/Sqrt_1", "/Add_1", "/Div_1"];
  let sessions = null, manifest = null, backend = null;

  // ---------- FFT (radix-2, in place) ----------
  const LOG = Math.log2(NFFT);
  const rev = new Uint32Array(NFFT), cosT = new Float64Array(NFFT / 2), sinT = new Float64Array(NFFT / 2);
  for (let i = 0; i < NFFT; i++) { let r = 0; for (let b = 0; b < LOG; b++) r |= ((i >> b) & 1) << (LOG - 1 - b); rev[i] = r; }
  for (let i = 0; i < NFFT / 2; i++) { cosT[i] = Math.cos(2 * Math.PI * i / NFFT); sinT[i] = Math.sin(2 * Math.PI * i / NFFT); }
  function fft(re, im, inverse) {
    for (let i = 0; i < NFFT; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    const sgn = inverse ? 1 : -1;
    for (let size = 2; size <= NFFT; size <<= 1) {
      const half = size >> 1, step = NFFT / size;
      for (let start = 0; start < NFFT; start += size) {
        for (let k = 0, t = 0; k < half; k++, t += step) {
          const a = start + k, b = a + half, c = cosT[t], s = sgn * sinT[t];
          const xr = re[b] * c - im[b] * s, xi = re[b] * s + im[b] * c;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        }
      }
    }
  }
  const WIN = new Float64Array(NFFT);              // periodic Hann (torch.hann_window)
  for (let i = 0; i < NFFT; i++) WIN[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / NFFT);
  const NORM = 1 / Math.sqrt(NFFT);

  // torch "reflect" padding
  function reflectPad(x, left, right) {
    const n = x.length, out = new Float32Array(n + left + right);
    out.set(x, left);
    for (let j = 0; j < left; j++) out[left - 1 - j] = x[j + 1];
    for (let j = 0; j < right; j++) out[left + n + j] = x[n - 2 - j];
    return out;
  }

  // demucs _spec for one channel of one segment → writes real/imag planes [BINS*FRAMES] into mag
  function spec(x, mag, chan) {
    const le = Math.ceil(x.length / HOP), pad = HOP / 2 * 3;
    const x1 = reflectPad(x, pad, pad + le * HOP - x.length);
    const x2 = reflectPad(x1, NFFT / 2, NFFT / 2);    // torch.stft(center=True)
    const re = new Float64Array(NFFT), im = new Float64Array(NFFT);
    const R = (chan * 2) * BINS * FRAMES, I = (chan * 2 + 1) * BINS * FRAMES;
    for (let f = 0; f < FRAMES; f++) {
      const off = (f + 2) * HOP;                       // frames [2 : 2 + le] of the torch output
      for (let k = 0; k < NFFT; k++) { re[k] = x2[off + k] * WIN[k]; im[k] = 0; }
      fft(re, im, false);
      for (let b = 0; b < BINS; b++) { mag[R + b * FRAMES + f] = re[b] * NORM; mag[I + b * FRAMES + f] = im[b] * NORM; }
    }
  }

  // demucs _ispec for one channel: spectrum planes (real at r0, imag at i0 in arr) → length samples
  function ispec(arr, r0, i0, length) {
    const pad = HOP / 2 * 3, total = (FRAMES + 3) * HOP + NFFT;
    const y = new Float64Array(total);
    const re = new Float64Array(NFFT), im = new Float64Array(NFFT);
    for (let f = 0; f < FRAMES; f++) {
      re.fill(0); im.fill(0);
      for (let b = 0; b < BINS; b++) { re[b] = arr[r0 + b * FRAMES + f]; im[b] = arr[i0 + b * FRAMES + f]; }
      for (let b = 1; b < BINS; b++) { re[NFFT - b] = re[b]; im[NFFT - b] = -im[b]; }   // Hermitian; Nyquist bin is 0
      fft(re, im, true);
      const off = (f + 2) * HOP, g = Math.sqrt(NFFT) / NFFT;
      for (let k = 0; k < NFFT; k++) y[off + k] += re[k] * g * WIN[k];
    }
    // window envelope of 75 %-overlapped periodic Hann² is 1.5 over the kept span
    const out = new Float32Array(length), start = NFFT / 2 + pad;
    for (let s = 0; s < length; s++) out[s] = y[start + s] / 1.5;
    return out;
  }

  // ---------- model ----------
  function loadScript(src) {
    return new Promise((ok, bad) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => bad(new Error("не загрузилась библиотека нейросети")); document.head.appendChild(s); });
  }
  async function load(onProgress = () => {}) {
    if (sessions) return backend;
    if (!window.ort) await loadScript(ORT_URL + "ort.webgpu.min.js");
    ort.env.wasm.wasmPaths = ORT_URL;
    backend = navigator.gpu && (await navigator.gpu.requestAdapter().catch(() => null)) ? "webgpu" : "wasm";
    manifest = await (await fetch(MODEL_DIR + "htdemucs_split_manifest.json")).json();
    sessions = [];
    const n = manifest.pieces.length;
    for (let i = 0; i < n; i++) {
      const p = manifest.pieces[i];
      const buf = await (await fetch(MODEL_DIR + p.file)).arrayBuffer();
      const final = p.outputs.includes("x") || p.outputs.includes("xt");
      const opts = { graphOptimizationLevel: "all" };
      if (backend === "webgpu") {
        opts.executionProviders = [i === 0 ? { name: "webgpu", forceCpuNodeNames: CPU_NODES } : "webgpu"];
        opts.preferredOutputLocation = final ? "cpu" : "gpu-buffer";
      } else opts.executionProviders = ["wasm"];
      sessions.push(await ort.InferenceSession.create(buf, opts));
      onProgress((i + 1) / n);
    }
    return backend;
  }

  async function runSegment(mixL, mixR) {
    const mag = new Float32Array(4 * BINS * FRAMES);
    spec(mixL, mag, 0); spec(mixR, mag, 1);
    const mix = new Float32Array(2 * SEG); mix.set(mixL, 0); mix.set(mixR, SEG);
    const map = { mix: new ort.Tensor("float32", mix, [1, 2, SEG]), mag: new ort.Tensor("float32", mag, [1, 4, BINS, FRAMES]) };
    const made = [];
    for (let i = 0; i < sessions.length; i++) {
      const p = manifest.pieces[i], feeds = {};
      for (const name of p.inputs) feeds[name] = map[name];
      const out = await sessions[i].run(feeds);
      for (const name of p.outputs) { map[name] = out[name]; made.push(out[name]); }
    }
    const x = await map.x.getData(), xt = await map.xt.getData();
    for (const t of made) { try { t.dispose(); } catch (e) {} }
    if (!finite(x) || !finite(xt)) return null;
    // vocals: frequency branch through the inverse STFT + time branch
    const voc = [0, 1].map(c => {
      const base = (VOCALS * 4 + c * 2) * BINS * FRAMES;
      const v = ispec(x, base, base + BINS * FRAMES, SEG), t0 = (VOCALS * 2 + c) * SEG;
      for (let s = 0; s < SEG; s++) v[s] += xt[t0 + s];
      return v;
    });
    return voc;
  }

  function finite(a) { for (let i = 0; i < a.length; i += 7) if (!Number.isFinite(a[i])) return false; return true; }

  // left/right: Float32Array at 44.1 kHz. Returns { vocals: [L, R], instrumental: [L, R], failed }
  // (failed = segments the model could not process even on a second try; their vocals stay silent).
  async function separate(left, right, onProgress = () => {}) {
    const len = left.length;
    // whole-track normalisation (demucs separate.py)
    let mean = 0; for (let i = 0; i < len; i++) mean += (left[i] + right[i]) / 2; mean /= len;
    let v = 0; for (let i = 0; i < len; i++) { const d = (left[i] + right[i]) / 2 - mean; v += d * d; }
    const std = Math.sqrt(v / Math.max(1, len - 1)) || 1;
    const norm = ch => { const o = new Float32Array(len); for (let i = 0; i < len; i++) o[i] = (ch[i] - mean) / std; return o; };
    const L = norm(left), R = norm(right);
    const outL = new Float32Array(len), outR = new Float32Array(len), wsum = new Float32Array(len);
    const weight = new Float32Array(SEG), half = Math.floor(SEG / 2);
    for (let i = 0; i < SEG; i++) weight[i] = (i < half ? i + 1 : SEG - i) / half;
    const stride = Math.floor(0.75 * SEG);
    const offsets = []; for (let o = 0; o < len; o += stride) offsets.push(o);
    let failed = 0;
    for (let k = 0; k < offsets.length; k++) {
      const off = offsets[k], cl = Math.min(SEG, len - off);
      // a short last chunk is padded around its centre with earlier audio / zeros (TensorChunk.padded)
      const start = off - Math.floor((SEG - cl) / 2);
      const take = ch => { const o = new Float32Array(SEG); for (let i = 0; i < SEG; i++) { const s = start + i; o[i] = s >= 0 && s < len ? ch[s] : 0; } return o; };
      const sl = take(L), sr = take(R);
      let voc = await runSegment(sl, sr);
      if (!voc) voc = await runSegment(sl, sr);       // one more try
      if (!voc) { failed++; voc = [new Float32Array(SEG), new Float32Array(SEG)]; }
      const [vl, vr] = voc;
      const trim = Math.floor((SEG - cl) / 2);
      for (let i = 0; i < cl; i++) {
        const w = weight[i];
        outL[off + i] += w * vl[trim + i]; outR[off + i] += w * vr[trim + i]; wsum[off + i] += w;
      }
      onProgress((k + 1) / offsets.length);
      await yieldUI();                               // let the page breathe between segments
    }
    const vocals = [outL, outR], instrumental = [new Float32Array(len), new Float32Array(len)];
    for (let i = 0; i < len; i++) {
      outL[i] = outL[i] / wsum[i] * std + mean; outR[i] = outR[i] / wsum[i] * std + mean;
      instrumental[0][i] = left[i] - outL[i]; instrumental[1][i] = right[i] - outR[i];
    }
    return { vocals, instrumental, failed, segments: offsets.length };
  }

  return { load, separate, SR, get backend() { return backend; }, _spec: spec, _ispec: ispec };   // _spec/_ispec: for tests
})();
