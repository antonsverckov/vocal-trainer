# Тренажёр распевки — авторство и лицензии

- **Распевки (раздел «Тональности»)** — запись фортепиано автора проекта (Logic Pro).
- **Аккорды и интервалы** — сгенерированы из MIDI и озвучены банком звуков
  [GeneralUser GS](https://github.com/mrbumpy409/GeneralUser-GS) (S. Christian Collins),
  свободная лицензия, разрешено использование в любых проектах.
- **MP3-кодировщик** — [lamejs](https://github.com/zhuker/lamejs), LGPL-3.0,
  файл `lib/lame.min.js` используется без изменений.
- **Отделение голоса от музыки («Мои песни»)** — нейросеть
  [htdemucs](https://github.com/facebookresearch/demucs) (Alexandre Défossez и др., Meta AI), лицензия MIT;
  версия для браузера — [monteslu/htdemucs-web-onnx](https://huggingface.co/monteslu/htdemucs-web-onnx), MIT,
  файлы в `models/htdemucs` без изменений.
- **Запуск нейросети в браузере** — [ONNX Runtime Web](https://github.com/microsoft/onnxruntime), MIT,
  загружается с jsDelivr.
- **Сдвиг тональности песни** — [SoundTouch JS](https://github.com/cutterbl/SoundTouchJS) (порт SoundTouch Олли Парвиайнена),
  LGPL-2.1, файл `lib/soundtouch.js` используется без изменений.
- **Слова песен под нотами** — распознавание речи [Whisper](https://github.com/openai/whisper) (OpenAI, MIT),
  модель [onnx-community/whisper-small_timestamped](https://huggingface.co/onnx-community/whisper-small_timestamped),
  запускается библиотекой [Transformers.js](https://github.com/huggingface/transformers.js) (Apache-2.0); загружаются с jsDelivr и Hugging Face.
- **Ноты упражнений «Курса»** сняты с записей автора нейросетью [Basic Pitch](https://github.com/spotify/basic-pitch) (Spotify, Apache-2.0)
  и сверены вручную; на сайте сама нейросеть не используется.
- **Песни учеников** обрабатываются только на их устройстве и хранятся только в их браузере:
  на сайт и автору ничего не загружается. Загружайте только треки, которые у вас есть законно,
  и используйте результат для личных занятий.
- Записи голоса учеников хранятся только в их браузере и никуда не отправляются,
  пока ученик сам не нажмёт «Отправить педагогу».
