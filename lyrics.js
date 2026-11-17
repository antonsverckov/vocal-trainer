// The words of a song, with the time each one is sung — speech recognition right in the browser
// (Whisper small, multilingual, via transformers.js; the model is fetched from Hugging Face once and cached).
// The language is found by listening (detectLang), not from the file name: an English song with a Russian
// file name, recognised as Russian, came out as a loop of junk («С ан я С ан я…»).
// Runs on the separated vocals of the student's own song; nothing is sent anywhere.
"use strict";

const Lyrics = (() => {
  const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";
  const MODEL = "onnx-community/whisper-small_timestamped";     // exported with word-level timing; ~210 MB once
  let asr = null;

  // transformers.js keeps downloaded models in Cache Storage ("transformers-cache"): when this model's
  // decoder is there, loading is just starting it, not a download
  async function stored() {
    try { return (await (await caches.open("transformers-cache")).keys()).some(r => r.url.includes("whisper-small_timestamped") && r.url.includes("decoder")); }
    catch (e) { return false; }
  }
  async function load(onProgress) {
    if (asr) return asr;
    const { pipeline } = await import(LIB);
    const files = {};
    const adapter = navigator.gpu && await navigator.gpu.requestAdapter().catch(() => null);
    const f16 = !!(adapter && adapter.features.has("shader-f16"));
    asr = await pipeline("automatic-speech-recognition", MODEL, {
      device: adapter ? "webgpu" : "wasm",
      dtype: { encoder_model: "q4", decoder_model_merged: f16 ? "q4f16" : "q4" },
      progress_callback: p => {
        if (p.status !== "progress" || !p.total) return;
        files[p.file] = [p.loaded, p.total];
        let a = 0, b = 0; for (const [l, t] of Object.values(files)) { a += l; b += t; }
        onProgress(a / b);
      },
    });
    return asr;
  }

  // stereo 44.1 kHz vocals → mono 16 kHz, resampled by the browser (proper anti-aliasing)
  async function to16k(L, R) {
    const n = L.length, src = new AudioBuffer({ length: n, numberOfChannels: 2, sampleRate: 44100 });
    src.copyToChannel(L, 0); src.copyToChannel(R, 1);
    const off = new OfflineAudioContext(1, Math.ceil(n * 16000 / 44100), 16000), node = off.createBufferSource();
    node.buffer = src; node.connect(off.destination); node.start();
    return (await off.startRendering()).getChannelData(0);
  }

  // the language of a song from its name: і ї є ґ → Ukrainian, other Cyrillic → Russian, otherwise English
  const guessLang = title => { const t = (title || "").normalize("NFC"); return /[іїєґ]/i.test(t) ? "ukrainian" : /[а-яё]/i.test(t) ? "russian" : "english"; };

  // The song's language from the separated vocals. Two 30-s stretches where the voice is loudest are
  // transcribed twice: as Russian and as English. Forced to Russian, Whisper still writes an English song
  // in English letters; forced to English, a Russian song comes out nearly empty — so the language whose
  // own letters give more words wins (Whisper's own first-token guess calls sung Russian "English" too
  // often). Russian vs Ukrainian is then settled by the language tokens. fallback: from the title.
  async function detectLang(L, R, fallback = "english", onProgress = () => {}) {
    try {
      const down = !asr && !(await stored());
      const run = await load(p => onProgress(p * 0.6, down));
      const audio = await to16k(L, R), W = 30 * 16000;
      const parts = [];
      for (let o = 0; o + W <= audio.length; o += W / 2) { let e = 0; for (let i = o; i < o + W; i += 4) e += audio[i] * audio[i]; parts.push([o, e]); }
      if (!parts.length) parts.push([0, 1]);
      parts.sort((a, b) => b[1] - a[1]);
      const pick = [parts[0]]; const far = parts.find(p => Math.abs(p[0] - parts[0][0]) >= W); if (far) pick.push(far);
      // words of one alphabet, without recognition loops and without the phrases Whisper makes up over
      // music it cannot follow («Thank you.», «I'm going to go ahead and…»)
      const FAKE = /\b(thank you|thanks for watching|i'm going to go ahead and( do)?( the)?|please subscribe|you)\b[.!]?/gi;
      const count = (t, re) => dropLoops(t.replace(FAKE, " ").split(/\s+/).filter(Boolean).map(w => [0, 0, w])).filter(w => re.test(w[2])).length;
      let ru = 0, en = 0, uk = 0, step = 0;
      for (const [o] of pick) {
        const seg = audio.subarray(o, Math.min(audio.length, o + W));
        const a = String((await run(seg, { language: "russian", task: "transcribe" })).text || "");
        onProgress(0.6 + 0.4 * (++step) / (pick.length * 2));
        const b = String((await run(seg, { language: "english", task: "transcribe" })).text || "");
        onProgress(0.6 + 0.4 * (++step) / (pick.length * 2));
        ru += count(a, /[а-яё]{2,}/i); en += count(b, /[a-z]{2,}/i);
        uk += await ukVsRu(run, seg);
      }
      if (ru === 0 && en === 0) return fallback;
      // forced to Russian, an English song gives (almost) no Cyrillic words — so a few real ones are enough
      if (ru >= 2 && ru * 4 >= en) return uk > 0 ? "ukrainian" : "russian";
      return en > ru ? "english" : fallback;
    } catch (e) { return fallback; }
  }
  // > 0 when Whisper's first-token guess prefers Ukrainian over Russian for this stretch
  async function ukVsRu(run, seg) {
    try {
      const { Tensor } = await import(LIB);
      const { input_features } = await run.processor(seg);
      const o = await run.model({ input_features, decoder_input_ids: new Tensor("int64", BigInt64Array.from([50258n]), [1, 1]) });
      const V = o.logits.dims.at(-1), D = o.logits.data, base = D.length - V;
      return D[base + 50280] > D[base + 50263] ? 1 : -1;      // <|uk|> vs <|ru|>
    } catch (e) { return -1; }
  }

  // recognition loops: the same 1–4 words repeated 3+ times in a row («С ан я С ан я С ан я…») are not lyrics
  function dropLoops(ws) {
    const key = i => ws[i][2].toLowerCase().replace(/[^\p{L}']/gu, "");
    const bad = new Uint8Array(ws.length);
    for (let p = 1; p <= 4; p++)
      for (let i = 0; i + 3 * p <= ws.length; i++) {
        let reps = 1;
        while (i + (reps + 1) * p <= ws.length && [...Array(p).keys()].every(k => key(i + k) === key(i + reps * p + k))) reps++;
        if (reps >= 3) { bad.fill(1, i, i + reps * p); i += reps * p - 1; }
      }
    return ws.filter((w, i) => !bad[i]);
  }

  // [[start_s, end_s, word], …]; lang: "russian" | "ukrainian" | "english"
  // onProgress(fraction, downloading) — downloading: the model is being fetched for the first time
  async function words(L, R, lang = "russian", onProgress = () => {}) {
    const down = !asr && !(await stored());
    const run = await load(p => onProgress(p * 0.4, down));
    onProgress(0.42);
    const audio = await to16k(L, R);
    const out = await run(audio, { return_timestamps: "word", chunk_length_s: 30, stride_length_s: 5, language: lang, task: "transcribe" });
    onProgress(1);
    const letters = lang === "russian" ? /[а-яё]/i : lang === "ukrainian" ? /[а-яіїєґ]/i : /[a-z]/i;
    const ws = (out.chunks || [])
      .map(c => [c.timestamp[0], c.timestamp[1] == null ? c.timestamp[0] + 0.3 : c.timestamp[1], String(c.text || "").trim()])
      .filter(w => w[2] && Number.isFinite(w[0]) && w[0] < audio.length / 16000 && letters.test(w[2]));   // real words of this language, inside the song
    // junk filter: loops are dropped; when most of it was a loop, the rest is not trusted either
    const clean = dropLoops(ws);
    if (ws.length >= 20 && clean.length < ws.length * 0.4) return [];
    return clean.map(([s, e, w]) => [Math.round(s * 100) / 100, Math.round(e * 100) / 100, w]);
  }

  // one word per note. Whisper's word times are off by 0.1–0.3 s, so «the first note after the word starts»
  // often picked the neighbour: a word now goes to the note it overlaps most in time — and when it is sung
  // over several notes (a melisma), to the first of them that holds a good part of it
  function perNote(notes, ws) {
    const out = notes.map(() => "");
    let k = 0;
    for (const [s, e, w] of ws) {
      while (k < notes.length && notes[k][1] <= s - 0.4) k++;
      const ov = [];
      for (let i = k; i < notes.length && notes[i][0] < e + 0.4; i++)
        ov.push([i, Math.min(e, notes[i][1]) - Math.max(s, notes[i][0])]);
      if (!ov.length) continue;                                   // no note near this word (a spoken bit)
      const max = Math.max(...ov.map(o => o[1]));
      let i;
      if (max > 0) i = ov.find(o => o[1] >= max * 0.5)[0];
      else {                                                       // touches no note: the nearest start, if close
        const near = ov.reduce((a, b) => (Math.abs(notes[b[0]][0] - s) < Math.abs(notes[a[0]][0] - s) ? b : a));
        if (Math.abs(notes[near[0]][0] - s) > 0.35) continue;
        i = near[0];
      }
      if (out[i] && i + 1 < notes.length && notes[i + 1][0] < e) i++;   // two words on one note: the next one
      out[i] = out[i] ? out[i] + " " + w : w;
    }
    return out;
  }

  // free the recognition model's memory (phones)
  async function unload() { if (asr) { try { await asr.dispose(); } catch (e) {} asr = null; } }

  return { words, unload, perNote, guessLang, detectLang, _dropLoops: dropLoops };
})();
