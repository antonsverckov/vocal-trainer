// English version of the trainer. The page is written in Russian; with English on, every text that
// reaches the page is translated here: exact phrases from the dictionary, sentences with numbers and
// note names through patterns, and composite titles («Аккорды: До мажор · девушки») part by part.
// Long texts (the teacher, the questions base, the course descriptions) have their own English files.
// Language: the RU / EN switch in the header, remembered; first visit — the browser's language.
"use strict";

const I18N = (() => {
  let lang = "ru";
  try { lang = localStorage.getItem("lang") || ((navigator.language || "ru").slice(0, 2) === "ru" || (navigator.language || "").slice(0, 2) === "uk" ? "ru" : "en"); } catch (e) {}
  const en = () => lang === "en";

  // ---------- exact phrases ----------
  const D = {
    // header, hero, controls
    "Тренажёр распевки": "Vocal warm-up trainer",
    "Бесплатно · без регистрации": "Free · no sign-up",
    "Пой ноты, которые плывут по нотной дорожке, — на каждой подписано, какая это нота. Линия твоего голоса сразу покажет, попадаешь ли ты.":
      "Sing the notes as they float along the lane — each one is labelled. The line of your voice shows right away whether you're on pitch.",
    "Упражнение": "Exercise", "Голос": "Voice", "Тональность": "Key", "Распевка": "Warm-up", "Песня": "Song",
    "Тональности": "Warm-ups", "Аккорды": "Chords", "Интервалы": "Intervals", "Курс": "Course", "Мои песни": "My songs",
    "Девушки": "Female", "Парни": "Male", "девушки": "female voice", "парни": "male voice",
    "Начинающие": "Beginner", "Продолжающие": "Intermediate", "начинающие": "beginner", "продолжающие": "intermediate",
    "Начинающие: без фальцета — парни не выше До4, девушки не выше До5": "Beginner: no falsetto — men up to C4, women up to C5",
    "Темп": "Tempo", "Оригинальный темп": "Original tempo",
    "▶ Начать": "▶ Start", "■ Стоп": "■ Stop", "⏸ Пауза": "⏸ Pause", "▶ Продолжить": "▶ Continue", "↻ Ещё раз": "↻ Again", "Загрузка…": "Loading…",
    "💬 Вопрос учителю": "💬 Ask the teacher",
    "Как выполнять": "How to do it", "Сейчас:": "Now:", "Сейчас": "Now",
    "Нужно спеть": "Sing", "Ты поёшь": "You sing", "Точность": "Accuracy", "Масштаб": "Zoom", "Уменьшить": "Zoom out", "Увеличить": "Zoom in",
    "в ноте (±35 центов, на коротких нотах ±50)": "on pitch (±35 cents, ±50 on short notes)", "выше": "sharp", "ниже": "flat",
    "пауза": "rest", "✓ в ноте": "✓ on pitch", "↑ на октаву выше": "↑ an octave high", "↓ на октаву ниже": "↓ an octave low",
    "Надень наушники": "Put on headphones",
    // songs
    "＋ Загрузить песню": "＋ Upload a song", "— пока нет песен —": "— no songs yet —", "пока нет песен": "no songs yet",
    "Тональность песни — определена сама, можно поправить": "Key of the song — detected automatically, you can correct it",
    "Сдвинуть песню выше или ниже под свой голос": "Move the song up or down to suit your voice",
    "Язык слов песни": "Language of the lyrics",
    "Слова: русский": "Lyrics: Russian", "Слова: украинский": "Lyrics: Ukrainian", "Слова: английский": "Lyrics: English",
    "🔄 Пересчитать ноты": "🔄 Reprocess", "Обработать песню заново — после улучшений тренажёра ноты станут точнее": "Process the song again — after trainer updates the notes get more accurate",
    "Удалить песню": "Delete song", "🎤 Голос певца: выкл": "🎤 Singer's voice: off", "🎤 Голос певца: вкл": "🎤 Singer's voice: on",
    "Сдвиг: оригинал": "Shift: original",
    "Всё считается на твоём устройстве — песня никуда не отправляется. Не закрывай страницу.": "Everything runs on your device — the song isn't uploaded anywhere. Keep this page open.",
    "Читаю файл…": "Reading the file…", "Снимаю мелодию…": "Finding the melody…", "Распознаю слова песни…": "Recognising the lyrics…",
    "Файл больше 60 МБ — возьми MP3 песни до 10 минут.": "The file is over 60 MB — use an MP3 of a song up to 10 minutes.",
    // teacher and questions
    "Учитель": "Teacher", "🔊 Ещё раз": "🔊 Again", "💬 Спроси учителя": "💬 Ask the teacher", "Спросить": "Ask",
    "Например: как брать дыхание? почему ломается голос?": "For example: how should I breathe? why does my voice crack?",
    "▶ Как надо": "▶ How it should sound", "🎤 Как спел ты": "🎤 How you sang", "↻ Спеть этот кусок": "↻ Sing this part",
    "Техника": "Technique", "Антон": "Anton",
    "Привет! Спрашивай про вокал — дыхание, высокие ноты, переход, вибрато, как распеваться. Или выбери вопрос ниже.":
      "Hi! Ask me anything about singing — breathing, high notes, the break, vibrato, how to warm up. Or pick a question below.",
    "Нажми «▶ Продолжить», когда будешь готов петь дальше.": "Press «▶ Continue» when you're ready to sing on.",
    "Точного ответа у меня пока нет. Попробуй спросить другими словами или выбери близкий вопрос ниже. А лучше задай его своему педагогу на уроке!":
      "I don't have an exact answer yet. Try other words or pick a close question below — or better, ask your teacher in a lesson!",
    // first-note hint and count-in
    "🎧 Сначала — нота-ориентир": "🎧 First — your starting note",
    "Окей": "OK", "Отмена": "Cancel",
    // progress, recordings
    "Мой прогресс": "My progress", "Это упражнение": "This exercise", "Все": "All",
    "⬇ Скачать мои записи": "⬇ Download my recordings", "⬆ Загрузить записи": "⬆ Load recordings",
    "▶ Прослушать": "▶ Play", "📤 Отправить педагогу": "📤 Send to teacher", "Прослушать": "Play", "Отправить педагогу": "Send to teacher",
    "Удалить": "Delete", "Переименовать": "Rename", "Перемотать": "Seek", "Сравнение": "Comparison",
    "▶ Послушать первую": "▶ Play the first", "▶ Послушать вторую": "▶ Play the second",
    "Выбери две записи одного и того же упражнения": "Choose two recordings of the same exercise",
    "Сравнить: отметь две записи одного упражнения": "Compare: tick two recordings of one exercise",
    "Предыдущая в списке": "Previous in the list", "Следующая в списке": "Next in the list",
    "Без записи голоса": "No voice recording", "без записи голоса": "no voice recording", "без записи": "no recording",
    "голос + музыка": "voice + music", "голос + пианино": "voice + piano", "только голос": "voice only",
    "Открыть упражнение": "Open the exercise", "сейчас открыто": "open now", "Пока нет записей": "No recordings yet",
    "Пока нет записей для этого упражнения.": "No recordings for this exercise yet.",
    "лучший": "best", "последний": "latest", "первый шаг": "first step", "как в первый раз": "same as the first time",
    "Название записи — нажми, чтобы изменить": "Recording name — click to change",
    "Подпись:": "Label:", "Подпись": "Label", "Играет:": "Playing:", "Играет": "Playing",
    "Здесь появится твой прогресс, когда закончишь первый проход этого упражнения": "Your progress shows up here after your first run of this exercise",
    "После следующего прохода здесь появится линия роста": "After your next run a progress line appears here",
    "Отдельный кусок — в «Мой прогресс» не сохраняется. Всё упражнение целиком — кнопка «↻ Ещё раз».":
      "A practised part isn't saved to «My progress». For the whole exercise press «↻ Again».",
    "Остановлено до первой ноты. Спой хотя бы одну фразу — и учитель сразу подскажет.": "Stopped before the first note. Sing at least one phrase and the teacher will help right away.",
    "Проход прерван сменой упражнения — он не сохранён. Чтобы запись попала в «Мой прогресс», останавливай кнопкой «■ Стоп».":
      "The run was interrupted by switching exercises — it wasn't saved. To keep a recording in «My progress», stop with «■ Stop».",
    "Проход остановлен — песня переходит в новую тональность. Нажми «Начать», когда будет готово.": "Run stopped — the song is moving to a new key. Press «Start» when it's ready.",
    "Микрофон включён — нажми «Начать» ещё раз.": "The microphone is on — press «Start» again.",
    "ориентир": "start note", "песня длиннее 10 минут": "the song is longer than 10 minutes", "в песне не нашлось вокала": "no vocals found in the song",
    "не загрузился звук": "the sound didn't load", "Пока нет записей.": "No recordings yet.", "После следующего прохода здесь появится линия роста.": "After your next run a progress line appears here.",
    "Короче 10 секунд — в «Мой прогресс» не сохраняется.": "Under 10 seconds — not saved to «My progress».",
    "(без записи голоса — браузер не поддерживает запись)": "(no voice recording — this browser can't record)",
    "Здесь появится твой прогресс, когда закончишь первый проход этого упражнения.": "Your progress shows up here after your first run of this exercise.", "Песня": "Song",
    "Файл записи скачан — отправь его педагогу в Telegram/WhatsApp.": "The recording file is downloaded — send it to your teacher on Telegram/WhatsApp.",
    "Нажми «▶ Продолжить», когда будешь готов петь дальше": "Press «▶ Continue» when you're ready to sing on",
  };

  // section / voice / level names, chords, intervals, keys — also used for parts of composite titles
  const CHORDS = { "Тоническое трезвучие": "Tonic triad", "Тонический секстаккорд": "Tonic sixth chord", "Тонический квартсекстаккорд": "Tonic six-four chord",
    "Доминантсептаккорд": "Dominant seventh", "Доминантовый квинтсекстаккорд": "Dominant six-five", "Доминантовый терцквартаккорд": "Dominant four-three",
    "Доминантовый секундаккорд": "Dominant second" };
  const INTERVALS = { "б2": ["M2", "Major second"], "м3": ["m3", "Minor third"], "б3": ["M3", "Major third"], "ч4": ["P4", "Perfect fourth"],
    "ч5": ["P5", "Perfect fifth"], "м6": ["m6", "Minor sixth"], "б6": ["M6", "Major sixth"], "м7": ["m7", "Minor seventh"],
    "б7": ["M7", "Major seventh"], "ч8": ["P8", "Octave"] };
  for (const [ru, e] of Object.entries(CHORDS)) D[ru] = e;
  for (const [ru, [abbr, name]] of Object.entries(INTERVALS)) D[ru] = abbr;
  const RU_INT_NAMES = { "Большая секунда": "Major second", "Малая терция": "Minor third", "Большая терция": "Major third", "Чистая кварта": "Perfect fourth",
    "Чистая квинта": "Perfect fifth", "Малая секста": "Minor sixth", "Большая секста": "Major sixth", "Малая септима": "Minor seventh",
    "Большая септима": "Major seventh", "Октава": "Octave" };
  Object.assign(D, RU_INT_NAMES);
  // key names («До мажор» → «C major»), filled from the catalog once it is there
  function addKeys(keys) { for (const k of keys || []) D[k.ru] = keyEn(k.name); }
  const keyEn = name => name.replace("#", "♯").replace(/([A-G])b/, "$1♭");

  // ---------- patterns: sentences with numbers / names ----------
  const P = [
    [/^Попадание: (\d+) из (\d+) нот \((\d+)%\)$/, "Hit: $1 of $2 notes ($3%)"],
    [/^Попадание: (\d+) из (\d+) спетых нот \((\d+)%\)$/, "Hit: $1 of $2 sung notes ($3%)"],
    [/^(.+): (\d+) из (\d+) нот \((\d+)%\)$/, (m, a, b, c, d) => `${tr(a)}: ${b} of ${c} notes (${d}%)`],
    [/^Задержка наушников: (\d+) мс — учтена автоматически\.$/, "Headphone delay: $1 ms — compensated automatically."],
    [/^Проход остановлен на (\d+:\d+) — разбор по спетому\.(.*)$/, (m, t, rest) => `Run stopped at ${t} — review of what you sang.` + (rest.includes("10 секунд") ? " Under 10 seconds — not saved to «My progress»." : "")],
    [/^✓ Сохранено в «Мой прогресс» — (.+)\. Подпись:$/, (m, b) => `✓ Saved to «My progress» — ${tr(b)}. Label:`],
    [/^(MP3|M4A|WEBM|OGG) · (.+)$/, (m, f, b) => `${f} · ${tr(b)}`],
    [/^Готовься: (.+)$/, (m, x) => `Get ready: ${x}`],
    [/^слушай: (.+)$/, "listen: $1"],
    [/^«(.+)» (.+)$/, (m, s, n) => `«${syl(s)}» ${n}`],
    [/^Сейчас прозвучит первая нота — (.+?)\.(?: Петь её на слог «(.+)»\.)?$/, (m, n, s) => `Your first note is about to play — ${n}.` + (s ? ` Sing it on «${syl(s)}».` : "")],
    [/^(.+) ↓ (.+)$/, (m, n, a) => `${n} ↓ ${amt(a)}`], [/^(.+) ↑ (.+)$/, (m, n, a) => `${n} ↑ ${amt(a)}`],
    [/^(.+) — не слышно$/, "$1 — not heard"], [/^(.+) — поздно$/, "$1 — late"], [/^(.+) — плавает$/, "$1 — wobbly"],
    [/^Ещё обрати внимание: (.+)\.$/, (m, x) => `Also watch: ${x.split(", ").map(tr).join(", ")}.`],
    [/^Раздел: (.+)$/, (m, x) => `Section: ${tr(x)}`],
    [/^до (\d+:\d+)$/, "to $1"], [/^(\d+)\/(\d+) нот$/, "$1/$2 notes"], [/^Песня$/, "Song"],
    [/^Нет доступа к микрофону или звуку: (.*)\. Разреши микрофон в браузере и нажми ещё раз\.$/, "No access to the microphone or sound: $1. Allow the microphone in your browser and press again."],
    [/^Не получилось загрузить файл: (.+)$/, "Couldn't load the file: $1"],
    [/^Не удалось сохранить запись: (.+)$/, "Couldn't save the recording: $1"],
    [/^Играет: (.+) — (\d+)%$/, "Playing: $1 — $2%"],
    [/^(.+): (\d+)% \((\d+)\/(\d+) нот, (\d+) BPM\)$/, "$1: $2% ($3/$4 notes, $5 BPM)"],
    [/^Результаты по порядку: (.+)$/, "Results in order: $1"],
    [/^(.*)с первого$/, "$1since the first"],
    [/^лучший (\d+)% · (\d+) (\S+) · последний$/, "best $1% · $2 $3 · latest"],
    [/^(сейчас открыто · )?(\d+) (recordings?|записи|записей|запись) · $/, (m, o, n) => (o ? "open now · " : "") + `${n} recording${n === "1" ? "" : "s"} · `],
    [/^(\d+) мин (\d+) с$/, "$1 min $2 s"], [/^(\d+) с$/, "$1 s"],
    [/^Фраза (\d+)$/, "Phrase $1"], [/^Повтор (\d+) · от (.+)$/, "Repetition $1 · from $2"],
    [/^Сдвиг: ([+−])(\d+) полутон(а|ов)?$/, (m, s, n) => `Shift: ${s}${n} semitone${n === "1" ? "" : "s"}`],
    [/^Тональность: (.+)$/, (m, k) => `Key: ${tr(k)}`],
    [/^Загружаю нейросеть \(только в первый раз, ~120 МБ\)… (\d+)%$/, "Loading the AI model (first time only, ~120 MB)… $1%"],
    [/^Отделяю голос от музыки… (\d+)%(?: · осталось ~(.+?))?( · без видеокарты это долго)?$/, (m, p, left, slow) => `Separating the voice from the music… ${p}%` + (left ? ` · ~${dur(left)} left` : "") + (slow ? " · no GPU, this takes a while" : "")],
    [/^Снимаю мелодию… (\d+)%$/, "Finding the melody… $1%"],
    [/^Загружаю распознавание слов \(только в первый раз, ~210 МБ\)… (\d+)%$/, "Loading lyrics recognition (first time only, ~210 MB)… $1%"],
    [/^Готово — можно петь! Минус сохраняется в память браузера… (\d+)%$/, "Done — you can sing! Saving the backing track in your browser… $1%"],
    [/^Готово — можно петь! Сохраняю сдвинутую песню… (\d+)%$/, "Done — you can sing! Saving the shifted song… $1%"],
    [/^Сдвигаю песню на ([+−])(\d+) полутон… (\d+)%$/, "Shifting the song by $1$2 semitones… $3%"],
    [/^Не получилось обработать песню: (.+)$/, (m, e) => `Couldn't process the song: ${tr(e)}`],
    [/^Не получилось сдвинуть песню: (.+)$/, "Couldn't shift the song: $1"],
    [/^(Обработано на видеокарте|Обработано без видеокарты) за (.+?) · голос найден в (\d+)% песни · нот (\d+)(.*)$/,
      (m, how, t, v, n, rest) => `${how.includes("без") ? "Processed without a GPU" : "Processed on the GPU"} in ${dur(t)} · voice found in ${v}% of the song · ${n} notes` +
        rest.replace(/ · слов (\d+)/, " · $1 words").replace(" · слова не распознались", " · lyrics not recognised").replace(" · без слов — нажми «Пересчитать ноты»", " · no lyrics — press «Reprocess»")
          .replace(/ · ⚠ сбой нейросети на (\d+) из (\d+) кусков — там нот не будет/, " · ⚠ the model failed on $1 of $2 parts — no notes there")],
    [/^Занято (.+) МБ из доступных ~(.+) ГБ$/, "Used $1 MB of ~$2 GB available"],
    [/^Удалить запись «(.+)»\? Её нельзя будет вернуть\.$/, "Delete the recording «$1»? It can't be undone."],
    [/^Удалить «(.+)» из «Моих песен»\? Записи проходов в «Моём прогрессе» останутся\.$/, "Delete «$1» from «My songs»? Your runs in «My progress» stay."],
    [/^Загружено записей: (\d+)(.*)$/, (m, n, r) => `Recordings loaded: ${n}` + (r ? " (the rest were already here)" : "")],
    [/^в начале фраз мимо (\d+)% нот, в конце — (\d+)%$/, "misses: $1% of notes at the start of phrases, $2% at the end"],
    [/^в (\d+) из (\d+) нот высота уходит вниз к концу$/, "in $1 of $2 notes the pitch drops towards the end"],
    [/^в (\d+) из (\d+) нот звук к концу тише вдвое$/, "in $1 of $2 notes the sound halves in volume by the end"],
    [/^в (\d+) из (\d+) нот звук начинается ниже и подтягивается$/, "in $1 of $2 notes the sound starts low and slides up"],
    [/^в среднем звук начинается через (.+) с после ноты$/, (m, s) => `on average your sound starts ${s.replace(",", ".")} s after the note`],
    [/^≈ (.+) колебания в секунду, размах ±(\d+)¢$/, (m, r, w) => `≈ ${r.replace(",", ".")} cycles per second, width ±${w}¢`],
    [/^высота гуляет в среднем на ±(\d+)¢$/, "pitch wanders by ±$1¢ on average"],
    [/^отклонение внутри ноты всего ±(\d+)¢$/, "only ±$1¢ of drift within a note"],
  ];
  const amt = a => a.replace(/^(\d+)¢$/, "$1¢").replace(/^([\d,]+) тона$/, (m, x) => `${x.replace(",", ".")} tones`).replace("на октаву", "an octave");
  const dur = t => t.replace(/(\d+) мин (\d+) с/, "$1 min $2 s").replace(/^(\d+) с$/, "$1 s");

  // ---------- syllables (course) in Latin letters ----------
  const TR = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya" };
  function syl(s) { return en() ? String(s).replace(/[а-яё]/gi, c => { const l = TR[c.toLowerCase()] || c; return c === c.toLowerCase() ? l : l.toUpperCase(); }) : s; }

  // ---------- translate one text ----------
  const CYR = /[А-Яа-яЁё]/;
  function core(c) {
    if (D[c] != null) return D[c];
    for (const [re, rep] of P) if (re.test(c)) return c.replace(re, rep);
    return null;
  }
  function tr(text) {
    if (!en() || text == null) return text;
    const s = String(text);
    if (!CYR.test(s)) return s;
    const lead = s.match(/^\s*/)[0], tail = s.match(/\s*$/)[0], c = s.trim();
    const whole = core(c);
    if (whole != null) return lead + whole + tail;
    // composite: «Аккорды: До мажор · девушки · начинающие», «T53 · Тоническое трезвучие», «… · до 1:20»
    const parts = c.split(/( · |: | — )/);
    if (parts.length > 1) return lead + parts.map(p => (/^( · |: | — )$/.test(p) || !CYR.test(p) ? p : (core(p) ?? p.replace(/^«(.+)»$/, (m, x) => `«${core(x) ?? x}»`)))).join("") + tail;
    return s;
  }

  // ---------- the page: translate text nodes and labels as they appear ----------
  const ATTRS = ["title", "placeholder", "aria-label"];
  const busy = new WeakSet();
  function walk(root) {
    if (!en()) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 || root.closest && root.closest("[data-no-i18n]")) return;
    for (const a of ATTRS) if (root.hasAttribute && root.hasAttribute(a)) { const v = root.getAttribute(a), t = tr(v); if (t !== v) root.setAttribute(a, t); }
    if (root.tagName === "SCRIPT" || root.tagName === "STYLE") return;
    for (const n of root.childNodes) walk(n);
  }
  function fixText(node) {
    if (busy.has(node)) return;
    const p = node.parentElement; if (p && (p.closest("[data-no-i18n]") || p.tagName === "SCRIPT" || p.tagName === "STYLE")) return;
    const v = node.nodeValue, t = tr(v);
    if (t !== v) { busy.add(node); node.nodeValue = t; busy.delete(node); }
  }
  // paragraphs with bold parts inside: replaced whole
  const HTML = {
    ".pnote": "Every run of 10 seconds or more is saved automatically — even if you stop halfway — with your voice recording, result and date. Recordings are stored <b>only in this browser on this device</b> (your phone will have its own history). To move them or keep them safe, use «Download my recordings», and on the other device «Load recordings».",
    ".tip": "🎧 <b>Put on headphones</b> — otherwise the microphone hears the piano. Wired ones are best; with Bluetooth, sing into your computer's/phone's microphone, not the headset's (the trainer learns your headphone delay by itself after the first run). The very start of a note isn't scored (0.1 s is allowed for the onset). Only the exact note in the right octave counts — if you sing an octave higher or lower, the trainer will tell you.",
    "#hint p:not(#hintNote)": "Now you'll hear <b>the first note of the exercise</b> — remember it and use it as your reference. Right after it comes the count-in: <b>one, two, three, four</b> — and off we go.",
  };
  let observer = null;
  function start() {
    document.documentElement.lang = lang;
    switcher();
    if (!en()) return;
    for (const [q, h] of Object.entries(HTML)) document.querySelectorAll(q).forEach(e => { if (CYR.test(e.textContent)) e.innerHTML = h; });
    walk(document.body);
    if (document.title) document.title = tr(document.title);
    observer = new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === "characterData") fixText(m.target);
        else if (m.type === "attributes") walk(m.target);
        else m.addedNodes.forEach(walk);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  // the RU / EN switch in the header
  function switcher() {
    const top = document.querySelector(".top"); if (!top || top.querySelector(".lang")) return;
    const box = document.createElement("div"); box.className = "lang"; box.setAttribute("data-no-i18n", "");
    for (const l of ["ru", "en"]) {
      const b = document.createElement("button"); b.type = "button"; b.textContent = l.toUpperCase(); b.className = l === lang ? "on" : "";
      b.title = l === "ru" ? "Русский" : "English"; b.onclick = () => l !== lang && setLang(l); box.appendChild(b);
    }
    top.appendChild(box);
  }
  function setLang(l) { try { localStorage.setItem("lang", l); } catch (e) {} location.reload(); }

  return { get lang() { return lang; }, en, t: tr, syl, start, setLang, addKeys, keyEn, D };
})();

// the English long texts replace the Russian ones before the page uses them
if (I18N.en()) {
  if (window.COACH_EN) window.COACH = window.COACH_EN;
  if (window.KNOWLEDGE_EN) window.KNOWLEDGE = window.KNOWLEDGE_EN;
  const C = window.CATALOG;
  if (C) {
    I18N.addKeys(C.keys);
    for (const k of C.keys) k.ru = I18N.keyEn(k.name);       // the page shows k.ru as the key's name
    Object.assign(C.sections, { scales: "Warm-ups", chords: "Chords", intervals: "Intervals" });
    Object.assign(C.voices, { girls: "Female", boys: "Male" });
    Object.assign(C.levels, { beginner: "Beginner", advanced: "Intermediate" });
  }
  if (window.COURSE && window.COURSE_EN) for (const e of window.COURSE.exercises) Object.assign(e, window.COURSE_EN[e.id] || {});
  // browser dialogs aren't part of the page: translate their text on the way out
  const A = window.alert.bind(window), Q = window.confirm.bind(window);
  window.alert = t => A(String(t).split("\n").map(I18N.t).join("\n"));
  window.confirm = t => Q(I18N.t(t));
}
document.addEventListener("DOMContentLoaded", () => I18N.start());
