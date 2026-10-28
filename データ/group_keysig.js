window.__addMusic({
  "kind": "group",
  "id": "keysig",
  "order": 2,
  "title": "調号",
  "lead": "調号を見て調を答える（長調と、同じ調号の短調＝平行調）。逆に、調の名前から調号を答える。♯・♭ 4 つまでを先に固め、7 つまでへ広げる。",
  "ranges": [
    {"id": "keysig-read-4", "type": "keysig", "title": "調号 → 調（4 つまで）", "lead": "ト音記号。♯・♭ 0〜4 つ",
     "spec": {"clef": "treble", "max": 4, "dir": "read"}},
    {"id": "keysig-write-4", "type": "keysig", "title": "調 → 調号（4 つまで）", "lead": "長調と短調の名前から、♯・♭ の数を答える",
     "spec": {"clef": "treble", "max": 4, "dir": "write"}},
    {"id": "keysig-read-7", "type": "keysig", "title": "調号 → 調（7 つまで）", "lead": "ト音記号。♯・♭ 0〜7 つ",
     "spec": {"clef": "treble", "max": 7, "dir": "read"}},
    {"id": "keysig-bass-7", "type": "keysig", "title": "調号 → 調（ヘ音記号）", "lead": "ヘ音記号の調号の位置で。♯・♭ 0〜7 つ",
     "spec": {"clef": "bass", "max": 7, "dir": "read"}},
    {"id": "keysig-write-7", "type": "keysig", "title": "調 → 調号（7 つまで）", "lead": "長調と短調の名前から、♯・♭ の数を答える",
     "spec": {"clef": "treble", "max": 7, "dir": "write"}}
  ]
});
