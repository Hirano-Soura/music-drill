window.__addMusic({
  "kind": "group",
  "id": "chord",
  "order": 5,
  "title": "コード",
  "lead": "コード名から構成音を、五線の和音からコード名を答える。三和音から七の和音へ、基本形から転回形へ広げる。同じ構成音で名前が 2 つあるもの（C6 と Am7/C など）は、どちらを選んでも正解。テンションは辞書の分野「コード」と一緒に足す。",
  "ranges": [
    {"id": "chord-tones-triad", "type": "chord-tones", "title": "三和音の構成音", "lead": "コード名を見て、構成音を 4 択で",
     "spec": {"clef": "treble", "show": "name", "roots": ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb", "Ab", "F#"], "types": ["", "m", "dim", "aug", "sus4"]}},
    {"id": "chord-tones-7th", "type": "chord-tones", "title": "七の和音の構成音", "lead": "7・maj7・m7・m7(♭5)・dim7 など",
     "spec": {"clef": "treble", "show": "name", "roots": ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb", "Ab", "F#"], "types": ["7", "maj7", "m7", "m7b5", "dim7", "mmaj7", "6", "m6"]}},
    {"id": "chord-name-triad", "type": "chord-name", "title": "五線の三和音 → コード名", "lead": "基本形だけ",
     "spec": {"clef": "treble", "low": "C4", "roots": ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb"], "types": ["", "m", "dim", "aug"], "inversions": false}},
    {"id": "chord-name-inv", "type": "chord-name", "title": "三和音の転回形 → コード名", "lead": "いちばん下の音が根音でないときは、分母（オンコード）で書く",
     "spec": {"clef": "treble", "low": "C4", "roots": ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb"], "types": ["", "m"], "inversions": true}},
    {"id": "chord-name-7th", "type": "chord-name", "title": "七の和音 → コード名", "lead": "基本形と転回形。6 と m7 の転回形のように、名前が 2 つあるものはどちらも正解",
     "spec": {"clef": "treble", "low": "C4", "roots": ["C", "D", "E", "F", "G", "A", "B", "Bb"], "types": ["7", "maj7", "m7", "m7b5", "6"], "inversions": true}}
  ]
});
