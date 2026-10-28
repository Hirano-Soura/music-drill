window.__addMusic({
  "kind": "group",
  "id": "note",
  "order": 1,
  "title": "単音",
  "lead": "五線の 1 音を音名で答える。まず五線の中、次に加線、最後に ♯・♭ の付いた音。ト音記号とヘ音記号の両方を読めるようにする。",
  "ranges": [
    {"id": "note-treble", "type": "note", "title": "ト音記号・五線の中", "lead": "E4（第1線）〜 F5（第5線）",
     "spec": {"clef": "treble", "low": "E4", "high": "F5", "accidentals": false}},
    {"id": "note-treble-ledger", "type": "note", "title": "ト音記号・加線まで", "lead": "A3（下第2線）〜 C6（上第2線）",
     "spec": {"clef": "treble", "low": "A3", "high": "C6", "accidentals": false}},
    {"id": "note-bass", "type": "note", "title": "ヘ音記号・五線の中", "lead": "G2（第1線）〜 A3（第5線）",
     "spec": {"clef": "bass", "low": "G2", "high": "A3", "accidentals": false}},
    {"id": "note-bass-ledger", "type": "note", "title": "ヘ音記号・加線まで", "lead": "C2（下第2線）〜 E4（上第2線）",
     "spec": {"clef": "bass", "low": "C2", "high": "E4", "accidentals": false}},
    {"id": "note-treble-acc", "type": "note", "title": "ト音記号・♯ と ♭", "lead": "C4 〜 A5 に、♯・♭ の付いた音を混ぜる",
     "spec": {"clef": "treble", "low": "C4", "high": "A5", "accidentals": true}},
    {"id": "note-bass-acc", "type": "note", "title": "ヘ音記号・♯ と ♭", "lead": "E2 〜 C4 に、♯・♭ の付いた音を混ぜる",
     "spec": {"clef": "bass", "low": "E2", "high": "C4", "accidentals": true}},
    {"id": "note-alto", "type": "note", "title": "ハ音記号（アルト記号）", "lead": "ビオラの楽譜。第3線が C4。E3 〜 A4",
     "spec": {"clef": "alto", "low": "E3", "high": "A4", "accidentals": false}}
  ]
});
