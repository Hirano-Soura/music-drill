window.__addMusic({
  "kind": "group",
  "id": "melody",
  "order": 4,
  "title": "メロディ",
  "lead": "4〜8 音の旋律を、左から順に音名で読む。調号の付いた音（ト長調の F♯ など）は、臨時記号が書かれていなくても ♯・♭ の付いた音名で答える。移動ドでは、長調の主音をド、短調の主音をラとして階名で答える。",
  "ranges": [
    {"id": "melody-c", "type": "melody", "title": "ハ長調・ト音記号", "lead": "4〜6 音。順次進行が多め",
     "spec": {"clef": "treble", "keys": ["C"], "low": "C4", "high": "A5", "length": [4, 6], "stepRate": 0.75, "maxLeap": 4}},
    {"id": "melody-keys", "type": "melody", "title": "調号つき・ト音記号", "lead": "ト・ヘ・ニ・変ロ長調とホ・ニ短調。5〜8 音",
     "spec": {"clef": "treble", "keys": ["G", "F", "D", "Bb", "Em", "Dm"], "low": "C4", "high": "A5", "length": [5, 8], "stepRate": 0.65, "maxLeap": 5}},
    {"id": "melody-bass", "type": "melody", "title": "ヘ音記号", "lead": "ハ・ト・ヘ長調。4〜6 音",
     "spec": {"clef": "bass", "keys": ["C", "G", "F"], "low": "E2", "high": "C4", "length": [4, 6], "stepRate": 0.7, "maxLeap": 4}},
    {"id": "melody-solfege", "type": "melody", "title": "移動ド（階名）", "lead": "いろいろな調で、主音からの階名を答える",
     "spec": {"clef": "treble", "keys": ["C", "G", "F", "D", "Bb", "A", "Eb", "Am", "Em", "Dm"], "low": "C4", "high": "A5", "length": [4, 7], "stepRate": 0.7, "maxLeap": 4, "solfege": true}}
  ]
});
