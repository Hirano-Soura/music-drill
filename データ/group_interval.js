window.__addMusic({
  "kind": "group",
  "id": "interval",
  "order": 3,
  "title": "音程",
  "lead": "2 つの音の隔たりを、度数（何度）と質（長・短・完全・増・減）で答える。まず幹音（♯・♭ の無い音）だけで、次に増4度と減5度、最後に臨時記号つき。",
  "ranges": [
    {"id": "interval-basic", "type": "interval", "title": "幹音・長短完全", "lead": "ト音記号の C4 〜 C5。長・短・完全の 1〜8 度",
     "spec": {"clef": "treble", "low": "C4", "high": "C5", "accidentals": false, "qualities": ["P", "M", "m"], "maxNum": 8}},
    {"id": "interval-tritone", "type": "interval", "title": "幹音・増4度と減5度まで", "lead": "C4 〜 G5。ファとシの間の増4度・減5度を入れる",
     "spec": {"clef": "treble", "low": "C4", "high": "G5", "accidentals": false, "qualities": ["P", "M", "m", "A", "d"], "maxNum": 8}},
    {"id": "interval-acc", "type": "interval", "title": "♯・♭ つき", "lead": "C4 〜 C5 に ♯・♭ を混ぜる。増・減の音程が増える",
     "spec": {"clef": "treble", "low": "C4", "high": "C5", "accidentals": true, "qualities": ["P", "M", "m", "A", "d"], "maxNum": 8}},
    {"id": "interval-bass", "type": "interval", "title": "ヘ音記号", "lead": "C3 〜 C4。長・短・完全と、増4度・減5度",
     "spec": {"clef": "bass", "low": "C3", "high": "C4", "accidentals": false, "qualities": ["P", "M", "m", "A", "d"], "maxNum": 8}}
  ]
});
