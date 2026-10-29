// The words of a song, with the time each one is sung — speech recognition right in the browser
// (Whisper small, multilingual, via transformers.js; the model is fetched from Hugging Face once and cached).
// The language is given, not guessed: on sung Russian, Whisper's own guess often says "English" and then
// produces junk (the same short "word" over and over).
// Runs on the separated vocals of the student's own song; nothing is sent anywhere.
"use strict";

const Lyrics = (() => {
  const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";
  const MODEL = "onnx-community/whisper-small_timestamped";     // exported with word-level timing; ~210 MB once
  let asr = null;

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

  // [[start_s, end_s, word], …]; lang: "russian" | "ukrainian" | "english"
  async function words(L, R, lang = "russian", onProgress = () => {}) {
    const run = await load(p => onProgress(p * 0.4));
    onProgress(0.42);
    const audio = await to16k(L, R);
    const out = await run(audio, { return_timestamps: "word", chunk_length_s: 30, stride_length_s: 5, language: lang, task: "transcribe" });
    onProgress(1);
    const letters = lang === "russian" ? /[а-яё]/i : lang === "ukrainian" ? /[а-яіїєґ]/i : /[a-z]/i;
    const ws = (out.chunks || [])
      .map(c => [c.timestamp[0], c.timestamp[1] == null ? c.timestamp[0] + 0.3 : c.timestamp[1], String(c.text || "").trim()])
      .filter(w => w[2] && Number.isFinite(w[0]) && w[0] < audio.length / 16000 && letters.test(w[2]));   // real words of this language, inside the song
    // junk filter: the same word more than 3 times in a row is a recognition loop, not lyrics
    const clean = ws.filter((w, i) => !(i >= 3 && [1, 2, 3].every(k => ws[i - k][2].toLowerCase() === w[2].toLowerCase())));
    return clean.map(([s, e, w]) => [Math.round(s * 100) / 100, Math.round(e * 100) / 100, w]);
  }

  // one word per note: a word goes under the first note it is sung on; the notes it is held over stay empty
  function perNote(notes, ws) {
    const out = notes.map(() => "");
    let k = 0;
    for (const [s, e, w] of ws) {
      while (k < notes.length && notes[k][1] <= s - 0.05) k++;
      let i = k;
      if (i >= notes.length) break;
      if (notes[i][0] > e + 0.25) continue;                // no note under this word (e.g. a spoken bit)
      while (out[i] && i + 1 < notes.length && notes[i + 1][0] < e) i++;   // two short words on one note: next note
      out[i] = out[i] ? out[i] + " " + w : w;
    }
    return out;
  }

  return { words, perNote, guessLang };
})();
