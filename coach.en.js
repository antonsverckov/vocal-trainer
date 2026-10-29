// The teacher's words in English — same structure and ids as coach.js. Used when the site is in English.
// {place} in the praise is the name of a passage: «Phrase 3», «T64 · …», «Repetition 2 · from G3».

window.COACH_EN = {
  intro: {
    great: [
      { id: "great1", text: "Wow, that was clean! Almost every note right on the spot — you sound amazing. You can raise the tempo or try a higher key." },
      { id: "great2", text: "Fire! Keep it up — your ear and your voice are working together. Try it a little faster now, you're ready." },
      { id: "great3", text: "Now that's what I'm talking about! Clean, confident, beautiful. I'm proud of you — let's keep going." },
      { id: "great4", text: "Simply beautiful! Your voice listens to you better and better. Let's lock it in and make it harder." },
    ],
    good: [
      { id: "good1", text: "You sound good! The foundation is there — polish a couple of spots and it'll be really clean." },
      { id: "good2", text: "Nice, most of the notes are in place! Let me show you where it can be even better." },
      { id: "good3", text: "Great progress! A little more attention to a few notes and it'll be fire." },
      { id: "good4", text: "I like how you're doing! A couple of spots need some work — let's go through them." },
    ],
    weak: [
      { id: "weak1", text: "No worries — everyone starts like this, honestly. Your voice is learning; let's take it piece by piece." },
      { id: "weak2", text: "Well done for trying! It's tricky for now — that's normal. Slow the tempo down and let's go one spot at a time." },
      { id: "weak3", text: "Don't worry, this is part of the work. Every try already trains your ear. Let's take one spot and make it beautiful." },
      { id: "weak4", text: "Easy, you'll get there! Let's find together what's in the way and fix it." },
    ],
  },

  praise: [
    { id: "praise1", text: "And «{place}» — that was a real treat, so clean!" },
    { id: "praise2", text: "By the way, «{place}» was sung really well — keep it just like that." },
    { id: "praise3", text: "I especially liked «{place}» — you sound confident and accurate there." },
    { id: "praise4", text: "«{place}» — simply lovely! Remember that feeling." },
  ],

  tips: {
    flat: {
      title: "Singing flat",
      say: [
        { id: "flat1", text: "In places you're a little flat. Think of the note a touch higher than it seems, and keep your breath support — don't let the sound drop at the end." },
        { id: "flat2", text: "The sound sometimes sags. Imagine the note flying up and forward, and don't save breath on the long notes." },
        { id: "flat3", text: "You're slightly flat — easy to fix! Smile with your eyes, lift your cheekbones, and the sound will get higher and brighter by itself." },
      ],
    },
    sharp: {
      title: "Singing sharp",
      say: [
        { id: "sharp1", text: "In places you're a little sharp. Ease off the pressure: sing softer and freer, don't push the sound with your throat." },
        { id: "sharp2", text: "The sound sometimes drifts up. Relax your neck and jaw, breathe out more calmly — the note will settle in place by itself." },
        { id: "sharp3", text: "Lots of energy — that's great! Just a little less pressure and you'll be spot on." },
      ],
    },
    octaveUp: {
      title: "An octave high",
      say: [
        { id: "octup1", text: "You hear the note correctly, but you're singing it an octave higher. Listen to the piano and come down to its pitch." },
        { id: "octup2", text: "The melody is right, just an octave higher. Try singing where the starting note sounds at the beginning." },
      ],
    },
    octaveDown: {
      title: "An octave low",
      say: [
        { id: "octdown1", text: "The note is right, but an octave lower. Try singing it where the piano plays — higher and lighter." },
        { id: "octdown2", text: "Your ear didn't let you down — it's just an octave lower. Bring the sound up to the piano, you'll be comfortable there." },
      ],
    },
    unstable: {
      title: "Wobbly pitch",
      say: [
        { id: "unstable1", text: "You hear the notes, but the sound wobbles a bit. Keep an even breath and don't push — let the note stand like a string." },
        { id: "unstable2", text: "The pitch wanders a little. Take your breath early and carry the sound evenly to the end of the note." },
        { id: "unstable3", text: "Almost spot on! Now just hold the note steady — imagine drawing the sound along a straight line." },
      ],
    },
    late: {
      title: "Arriving late",
      say: [
        { id: "late1", text: "You land on the note a bit late. Hear it in your head ahead of time and hit it right away, without sliding in." },
        { id: "late2", text: "The note doesn't settle straight away. Breathe in early and start the sound right on the pitch." },
        { id: "late3", text: "You do hit it — just a bit late. Sing the note in your head before you come in and it'll all line up." },
      ],
    },
    silent: {
      title: "Some notes I didn't catch",
      say: [
        { id: "silent1", text: "I couldn't catch a couple of notes — they were very short or quiet. Sing them more confidently and hold them to the end." },
        { id: "silent2", text: "Some notes slipped by too quickly. Don't be afraid to be heard — let every note sound fully." },
        { id: "silent3", text: "Here and there the sound disappeared. Keep your breath to the end of the phrase and sing boldly — you have a good voice, let it be heard!" },
      ],
    },
  },

  technique: {
    breath: {
      title: "Running out of breath before the phrase ends",
      say: [
        { id: "t_breath1", text: "Accuracy drops towards the end of the phrase — looks like you're running out of breath. Breathe in early and low, into your belly and sides, not your shoulders, and spend the air sparingly, as if breathing out through a straw." },
        { id: "t_breath2", text: "The last notes of the phrases are harder than the first ones. Take a calm, deep breath in the pause before the phrase and don't blow all the air on the first notes." },
      ],
    },
    sag: {
      title: "The note sags at the end",
      say: [
        { id: "t_sag1", text: "The note sags at the end. That's support: keep your belly and ribs engaged right to the end of the sound, as if it keeps flying forward." },
        { id: "t_sag2", text: "The pitch drops towards the end of the notes. Don't let go of the breath too early — carry the sound on support until you release it." },
      ],
    },
    fade: {
      title: "The sound fades",
      say: [
        { id: "t_fade1", text: "The sound fades towards the end of the note. Sing evenly for the whole length — the same breath from start to finish, as if the note were even longer." },
      ],
    },
    scoop: {
      title: "Scooping up to the note",
      say: [
        { id: "t_scoop1", text: "You scoop up into the note from below. Hear the note in your head before you breathe and start right on it — from above, not pulling up from below." },
        { id: "t_scoop2", text: "The starts of the notes slide in from below. A soft but precise onset: imagine hitting the note like a dot, with no run-up." },
      ],
    },
    lateOnset: {
      title: "Late onset",
      say: [
        { id: "t_late1", text: "You come in late. Breathe in during the pause before the note, and start the sound together with the key, not after it." },
      ],
    },
    wobble: {
      title: "Uneven sound",
      say: [
        { id: "t_wobble1", text: "The sound is uneven — the pitch wanders without a rhythm. That's not vibrato, it's unsteady support. Sing the note with a straight, even tone on a light, steady breath, and don't squeeze your throat." },
      ],
    },
    vibWide: {
      title: "Vibrato too wide",
      say: [
        { id: "t_vibwide1", text: "The vibrato is too wide — the sound swings almost a semitone. Ease off pressure and volume, free your larynx: vibrato should be light, not a wobble." },
      ],
    },
    vibFast: {
      title: "Trembling vibrato",
      say: [
        { id: "t_vibfast1", text: "The vibrato is fast and trembling — usually that's tension. Relax your jaw and tongue, sing more freely: the vibrato will come by itself, calmer and more beautiful." },
      ],
    },
    vibSlow: {
      title: "Slow wobble",
      say: [
        { id: "t_vibslow1", text: "The sound swings slowly — more a wobble than vibrato. Keep your support more even and don't press: let the note stand, and the vibrato will be light and quicker." },
      ],
    },
    vibGood: {
      title: "Beautiful vibrato",
      positive: true,
      say: [
        { id: "t_vibgood1", text: "You've got a lively, even vibrato — a sign of a free voice. Love it!" },
        { id: "t_vibgood2", text: "What a beautiful vibrato! The sound is free and warm — keep it up." },
      ],
    },
    straight: {
      title: "Steady straight tone",
      positive: true,
      say: [
        { id: "t_straight1", text: "The sound is even and straight — exactly what a warm-up needs. On the long notes you can try letting a light vibrato in." },
        { id: "t_straight2", text: "A very even, focused sound — that shows good support. Excellent!" },
      ],
    },
  },

  outro: [
    { id: "try1", text: "Listen to how it should sound and try this part again — you can do it!" },
    { id: "try2", text: "Press «How it should sound», then sing this spot on its own. I'm sure the second time will be better." },
    { id: "try3", text: "Let's do it together: first listen, then sing this little bit. You've got this!" },
  ],
};
