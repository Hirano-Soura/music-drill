// 音の計算（改善計画 項目48-1・48。計画/音楽.md §2-2）
//
// 音名と音の高さの番号、五線の上の位置、度数（音程）、調号、コード名と構成音の対応は、ここにだけ書く（LD-1）。
// 読譜の出題と採点（出題.js）も、辞書の譜例も、この関数を呼ぶ。検査は tests/test_music.js。
//
// ★ 音は「文字＋変化記号＋オクターブ」で持ち、番号（MIDI の番号。C4 = 60）は計算で出す。
//    F♯ と G♭ は同じ鍵盤でも、楽譜では別の位置に書き、度数も変わる（増4度と減5度）。番号だけで持つと崩れる。
//
// 音の形: {step: 0〜6（C D E F G A B）, alt: -2〜2（𝄫 ♭ ♮ ♯ 𝄪）, oct: オクターブ（C4 の 4）}
// 音名の文字列: "C4"・"F#4"・"Bb3"・"F♯4"・"B♭3"。オクターブを省くと音の種類（ピッチクラス）として扱い、oct は null
(function (G) {
  "use strict";

  var LETTERS = "CDEFGAB";
  var SEMI = [0, 2, 4, 5, 7, 9, 11];          // C からの半音の数
  var FIFTHS = [0, 2, 4, -1, 1, 3, 5];        // 五度圏の位置（C = 0。♯ 側が正）。調号の数もここから出す

  function mod(a, n) { return ((a % n) + n) % n; }
  function pitch(step, alt, oct) { return {step: step, alt: alt, oct: oct == null ? null : oct}; }

  // ---- 音名の読み書き ----
  var ACC_IN = {"": 0, "♮": 0, "#": 1, "♯": 1, "x": 2, "##": 2, "♯♯": 2, "𝄪": 2, "b": -1, "♭": -1, "bb": -2, "♭♭": -2, "𝄫": -2};
  var NOTE_RE = /^([A-Ga-g])(𝄪|𝄫|##|bb|♯♯|♭♭|#|b|♯|♭|x|♮)?(-?\d+)?$/;
  function parse(s) {
    if (s && typeof s === "object") return s;
    var m = NOTE_RE.exec(String(s).trim());
    if (!m) throw new Error("音名として読めません: " + s);
    return pitch(LETTERS.indexOf(m[1].toUpperCase()), ACC_IN[m[2] || ""], m[3] == null ? null : +m[3]);
  }
  // 機械の鍵（記録の鍵・検査の比較に使う）。"F#4"・"Bb3"・"F##4"。音の種類なら "F#"
  function key(p) {
    p = parse(p);
    var a = p.alt > 0 ? new Array(p.alt + 1).join("#") : new Array(-p.alt + 1).join("b");
    return LETTERS[p.step] + a + (p.oct == null ? "" : p.oct);
  }
  function cls(p) { p = parse(p); return pitch(p.step, p.alt, null); }
  function midi(p) {
    p = parse(p);
    if (p.oct == null) throw new Error("オクターブの無い音に番号はありません: " + key(p));
    return 12 * (p.oct + 1) + SEMI[p.step] + p.alt;
  }
  // 文字の上での高さ（C4 = 28。白鍵を 1 つずつ数える）。五線の位置と度数はこれで数える
  function dia(p) { p = parse(p); return 7 * p.oct + p.step; }
  function fromDia(d, alt) { return pitch(mod(d, 7), alt || 0, Math.floor(d / 7)); }
  function same(a, b) { a = parse(a); b = parse(b); return a.step === b.step && a.alt === b.alt && a.oct === b.oct; }

  // ---- 音名の表記（計画/音楽.md §2-3） ----
  //   en 英米式 / ja 日本式 / fixed 固定ド / de ドイツ式。変化記号の付け方が表記ごとに違う
  var SYSTEMS = [
    {id: "en", label: "英米式", letters: ["C", "D", "E", "F", "G", "A", "B"]},
    {id: "ja", label: "日本式", letters: ["ハ", "ニ", "ホ", "ヘ", "ト", "イ", "ロ"]},
    {id: "fixed", label: "固定ド", letters: ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"]},
    {id: "de", label: "ドイツ式", letters: ["C", "D", "E", "F", "G", "A", "H"]}
  ];
  var ACC_SIGN = {"-2": "𝄫", "-1": "♭", "0": "", "1": "♯", "2": "𝄪"};
  var JA_PREFIX = {"-2": "重変", "-1": "変", "0": "", "1": "嬰", "2": "重嬰"};
  function system(id) {
    for (var i = 0; i < SYSTEMS.length; i++) if (SYSTEMS[i].id === id) return SYSTEMS[i];
    throw new Error("音名の表記がありません: " + id);
  }
  // ドイツ式: ♯ は語尾に -is、♭ は -es。E・A は母音なので Es・As、H の ♭ は B
  function germanName(p) {
    var base = system("de").letters[p.step];
    if (p.alt === 0) return base;
    if (p.alt > 0) return base + (p.alt === 1 ? "is" : "isis");
    if (p.step === 6) return p.alt === -1 ? "B" : "Heses";
    var es = (p.step === 2 || p.step === 5) ? "s" : "es";
    return base + (p.alt === -1 ? es : es + "es");
  }
  function name(p, sys, withOct) {
    p = parse(p);
    var s = sys || "en", out;
    if (s === "de") out = germanName(p);
    else if (s === "ja") out = JA_PREFIX[p.alt] + system("ja").letters[p.step];
    else out = system(s).letters[p.step] + ACC_SIGN[p.alt];
    return withOct && p.oct != null ? out + p.oct : out;
  }

  // ---- 五線 ----
  //   位置は、第1線（いちばん下の線）を 0 とし、線と間を 1 ずつ数える。偶数が線、奇数が間
  var CLEFS = {
    treble: {label: "ト音記号", bottom: "E4", line: 2, glyph: "𝄞"},  // ト（G4）が第2線
    bass:   {label: "ヘ音記号", bottom: "G2", line: 4, glyph: "𝄢"},  // ヘ（F3）が第4線
    alto:   {label: "ハ音記号（アルト）", bottom: "F3", line: 3, glyph: "𝄡"}  // ハ（C4）が第3線
  };
  function clef(id) {
    if (!CLEFS[id]) throw new Error("音部記号がありません: " + id);
    return CLEFS[id];
  }
  function staffPos(p, clefId) { return dia(p) - dia(clef(clefId).bottom); }
  // 位置 → 「第n線」「第n間」「下第n線」…。加線は下が -2, -4…、上が 10, 12…
  function placeOf(pos) {
    if (pos >= 0 && pos <= 8) return pos % 2 === 0 ? {where: "line", n: pos / 2 + 1} : {where: "space", n: (pos + 1) / 2};
    if (pos < 0) return pos % 2 === 0 ? {where: "below-line", n: -pos / 2} : {where: "below-space", n: (-pos + 1) / 2};
    return pos % 2 === 0 ? {where: "above-line", n: (pos - 8) / 2} : {where: "above-space", n: (pos - 7) / 2};
  }
  function ledgers(pos) {
    var out = [], k;
    for (k = -2; k >= pos; k -= 2) out.push(k);
    for (k = 10; k <= pos; k += 2) out.push(k);
    return out;
  }
  function pitchAt(pos, clefId, alt) { return fromDia(dia(clef(clefId).bottom) + pos, alt); }

  // ---- 度数（音程） ----
  //   名前は品質＋度数: P 完全 / M 長 / m 短 / A 増 / d 減 / AA 重増 / dd 重減。"M3"・"P5"・"A4"・"d5"
  var BASE = [0, 2, 4, 5, 7, 9, 11];              // 1〜7度の、長・完全のときの半音の数
  var PERFECT = [true, false, false, true, true, false, false];
  var Q_PERFECT = {"-2": "dd", "-1": "d", "0": "P", "1": "A", "2": "AA"};
  var Q_MAJOR = {"-3": "dd", "-2": "d", "-1": "m", "0": "M", "1": "A", "2": "AA"};
  var Q_JA = {P: "完全", M: "長", m: "短", A: "増", d: "減", AA: "重増", dd: "重減"};
  var Q_ORDER = ["dd", "d", "m", "P", "M", "A", "AA"];
  function qualityOffset(simple, q) {
    var t = PERFECT[simple] ? Q_PERFECT : Q_MAJOR;
    for (var k in t) if (t[k] === q) return +k;
    throw new Error((simple + 1) + "度に " + q + " はありません");
  }
  // a から b への度数。b が a より下なら入れ替えて上行で数える
  function interval(a, b) {
    a = parse(a); b = parse(b);
    var d = dia(b) - dia(a), s = midi(b) - midi(a);
    if (d < 0 || (d === 0 && s < 0)) { d = -d; s = -s; }
    var simple = d % 7, octs = Math.floor(d / 7);
    var off = s - (BASE[simple] + 12 * octs);
    var q = (PERFECT[simple] ? Q_PERFECT : Q_MAJOR)[off];
    if (!q) throw new Error("度数の名前が付きません: " + key(a) + " → " + key(b));
    return {num: d + 1, quality: q, semis: s, name: q + (d + 1)};
  }
  function parseInterval(s) {
    var m = /^(AA|dd|P|M|m|A|d)(\d+)$/.exec(s);
    if (!m) throw new Error("度数として読めません: " + s);
    return {quality: m[1], num: +m[2]};
  }
  function intervalName(s, sys) {
    var iv = parseInterval(s);
    return sys === "en" ? s : Q_JA[iv.quality] + iv.num + "度";
  }
  // p から度数 s だけ上の音。音の種類（オクターブ無し）を渡したら、音の種類で返す
  function transpose(p, s) {
    p = parse(p);
    var noOct = p.oct == null, q = noOct ? pitch(p.step, p.alt, 4) : p;
    var iv = parseInterval(s), d = iv.num - 1, simple = d % 7, octs = Math.floor(d / 7);
    var semis = BASE[simple] + 12 * octs + qualityOffset(simple, iv.quality);
    var t = fromDia(dia(q) + d);
    t.alt = midi(q) + semis - midi(t);
    return noOct ? cls(t) : t;
  }
  function compareIntervals(a, b) {
    var x = parseInterval(a), y = parseInterval(b);
    return x.num - y.num || Q_ORDER.indexOf(x.quality) - Q_ORDER.indexOf(y.quality);
  }

  // ---- 調と調号 ----
  //   調の鍵: 長調は主音だけ（"G"・"Eb"）、短調は主音に m を付ける（"Em"・"C#m"）
  //   fifths: 調号の数（♯ が正、♭ が負）
  var SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6];        // F C G D A E B
  var FLAT_ORDER = [6, 2, 5, 1, 4, 0, 3];         // B E A D G C F
  // 調号を五線に書く高さ（音部記号ごと。慣習の位置）
  var KEYSIG_AT = {
    treble: {sharp: ["F5", "C5", "G5", "D5", "A4", "E5", "B4"], flat: ["B4", "E5", "A4", "D5", "G4", "C5", "F4"]},
    bass:   {sharp: ["F3", "C3", "G3", "D3", "A2", "E3", "B2"], flat: ["B2", "E3", "A2", "D3", "G2", "C3", "F2"]},
    alto:   {sharp: ["F4", "C4", "G4", "D4", "A3", "E4", "B3"], flat: ["B3", "E4", "A3", "D4", "G3", "C4", "F3"]}
  };
  function parseKey(k) {
    var m = /^([A-G](?:#|b|♯|♭)?)(m?)$/.exec(k);
    if (!m) throw new Error("調として読めません: " + k);
    return {tonic: cls(m[1]), mode: m[2] ? "minor" : "major"};
  }
  function fifthsOfClass(p) { p = parse(p); return FIFTHS[p.step] + 7 * p.alt; }
  function fifthsOf(k) {
    var x = typeof k === "string" ? parseKey(k) : k;
    return fifthsOfClass(x.tonic) - (x.mode === "minor" ? 3 : 0);
  }
  function classAtFifths(n) {
    for (var s = 0; s < 7; s++) if (mod(n - FIFTHS[s], 7) === 0) return pitch(s, (n - FIFTHS[s]) / 7, null);
  }
  function keyAt(n, mode) {
    var t = classAtFifths(mode === "minor" ? n + 3 : n);
    return key(t) + (mode === "minor" ? "m" : "");
  }
  // 調号に付く音（♯ なら F♯ C♯ …の順）
  function keySignature(n) {
    if (Math.abs(n) > 7) throw new Error("調号は 7 つまで: " + n);
    var order = n >= 0 ? SHARP_ORDER : FLAT_ORDER, out = [];
    for (var i = 0; i < Math.abs(n); i++) out.push(pitch(order[i], n > 0 ? 1 : -1, null));
    return out;
  }
  function keySigPlaces(n, clefId) {
    var t = KEYSIG_AT[clefId] || KEYSIG_AT.treble;
    return (n >= 0 ? t.sharp : t.flat).slice(0, Math.abs(n)).map(function (s) { return staffPos(s, clefId); });
  }
  // 調号のもとで、その文字の音に付いている変化（調号に無ければ 0）
  function altInKey(step, n) {
    var a = 0;
    keySignature(n).forEach(function (p) { if (p.step === step) a = p.alt; });
    return a;
  }
  // 調号 n の五線に音 p を書くとき、臨時記号が要るか。要るなら変化（0 なら ♮）、要らなければ null
  function accidentalIn(p, n) {
    p = parse(p);
    return altInKey(p.step, n || 0) === p.alt ? null : p.alt;
  }
  var KEY_JA_MODE = {major: "長調", minor: "短調"};
  var KEY_DE_MODE = {major: "-Dur", minor: "-Moll"};
  function keyName(k, sys) {
    var x = parseKey(k);
    if (sys === "de") {
      var n = germanName(x.tonic);
      return (x.mode === "minor" ? n.toLowerCase() : n) + KEY_DE_MODE[x.mode];
    }
    if (sys === "en") return name(x.tonic, "en") + (x.mode === "minor" ? " minor" : " major");
    return name(x.tonic, "ja") + KEY_JA_MODE[x.mode];   // 調の名前は、固定ドの人も日本式で呼ぶ
  }
  // 音階。form: major / natural（自然的短音階）/ harmonic（和声的短音階）/ melodic（旋律的短音階の上行）
  var SCALES = {
    major: ["P1", "M2", "M3", "P4", "P5", "M6", "M7"],
    natural: ["P1", "M2", "m3", "P4", "P5", "m6", "m7"],
    harmonic: ["P1", "M2", "m3", "P4", "P5", "m6", "M7"],
    melodic: ["P1", "M2", "m3", "P4", "P5", "M6", "M7"]
  };
  function scale(k, form) {
    var x = parseKey(k);
    var f = form || (x.mode === "minor" ? "natural" : "major");
    return SCALES[f].map(function (s) { return transpose(x.tonic, s); });
  }
  // 移動ドの階名（長調の主音をド、短調の主音をラ）。scale の何番目かで引く
  var SOLFEGE = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];
  function solfege(degree, mode) { return SOLFEGE[mod(degree + (mode === "minor" ? 5 : 0), 7)]; }

  // ---- コード ----
  //   sym は機械の鍵（ASCII）、disp は表示。aka は同じ種類の別の書き方（コード譜の流儀の違い）
  var CHORDS = [
    {sym: "",       disp: "",       tones: ["P1", "M3", "P5"],       ja: "メジャー・トライアド", aka: ["M", "maj"]},
    {sym: "m",      disp: "m",      tones: ["P1", "m3", "P5"],       ja: "マイナー・トライアド", aka: ["-", "min"]},
    {sym: "dim",    disp: "dim",    tones: ["P1", "m3", "d5"],       ja: "ディミニッシュ・トライアド", aka: ["°", "o"]},
    {sym: "aug",    disp: "aug",    tones: ["P1", "M3", "A5"],       ja: "オーギュメント・トライアド", aka: ["+", "#5", "(#5)"]},
    {sym: "sus4",   disp: "sus4",   tones: ["P1", "P4", "P5"],       ja: "サスペンデッド・フォース", aka: ["sus"]},
    {sym: "sus2",   disp: "sus2",   tones: ["P1", "M2", "P5"],       ja: "サスペンデッド・セカンド", aka: []},
    {sym: "6",      disp: "6",      tones: ["P1", "M3", "P5", "M6"], ja: "シックス", aka: ["M6"]},
    {sym: "m6",     disp: "m6",     tones: ["P1", "m3", "P5", "M6"], ja: "マイナー・シックス", aka: ["-6"]},
    {sym: "7",      disp: "7",      tones: ["P1", "M3", "P5", "m7"], ja: "ドミナント・セブンス", aka: ["dom7"]},
    {sym: "maj7",   disp: "maj7",   tones: ["P1", "M3", "P5", "M7"], ja: "メジャー・セブンス", aka: ["M7", "△7", "Δ7", "△", "Maj7"]},
    {sym: "m7",     disp: "m7",     tones: ["P1", "m3", "P5", "m7"], ja: "マイナー・セブンス", aka: ["-7", "min7"]},
    {sym: "mmaj7",  disp: "mM7",    tones: ["P1", "m3", "P5", "M7"], ja: "マイナー・メジャー・セブンス", aka: ["mM7", "m(maj7)", "m△7", "-maj7"]},
    {sym: "m7b5",   disp: "m7(♭5)", tones: ["P1", "m3", "d5", "m7"], ja: "マイナー・セブンス・フラット・ファイブ（ハーフ・ディミニッシュ）", aka: ["m7(b5)", "m7-5", "m7(-5)", "ø", "ø7"]},
    {sym: "dim7",   disp: "dim7",   tones: ["P1", "m3", "d5", "d7"], ja: "ディミニッシュ・セブンス", aka: ["°7", "o7"]},
    {sym: "7sus4",  disp: "7sus4",  tones: ["P1", "P4", "P5", "m7"], ja: "セブンス・サスフォー", aka: []},
    {sym: "aug7",   disp: "aug7",   tones: ["P1", "M3", "A5", "m7"], ja: "オーギュメント・セブンス", aka: ["7(#5)", "7#5", "+7"]}
  ];
  var CHORD_BY = {};
  CHORDS.forEach(function (c) {
    [c.sym, c.disp].concat(c.aka).forEach(function (s) { CHORD_BY[normSym(s)] = c; });
  });
  function normSym(s) { return String(s).replace(/♭/g, "b").replace(/♯/g, "#"); }
  function chordType(sym) {
    var c = CHORD_BY[normSym(sym)];
    if (!c) throw new Error("コードの種類として読めません: " + sym);
    return c;
  }
  var CHORD_RE = /^([A-G](?:𝄪|𝄫|##|bb|#|b|♯|♭)?)([^/]*)(?:\/(.+))?$/;
  // "Bm7(♭5)"・"C/E"・"F#m7" → {root, type, bass}。bass は分母（オンコード）が無ければ根音
  function parseChord(s) {
    var m = CHORD_RE.exec(String(s).trim());
    if (!m) throw new Error("コード名として読めません: " + s);
    var root = cls(m[1]);
    return {root: root, type: chordType(m[2]), bass: m[3] ? cls(m[3]) : root};
  }
  function chordName(root, sym, bass, sys) {
    var t = chordType(sym), r = parse(root);
    var s = name(r, sys === "de" ? "de" : "en") + t.disp;
    if (bass != null) {
      var b = parse(bass);
      if (b.step !== r.step || b.alt !== r.alt) s += "/" + name(b, sys === "de" ? "de" : "en");
    }
    return s;
  }
  // 構成音（音の種類。根音から積む順）
  function chordTones(s) {
    var c = parseChord(s);
    return c.type.tones.map(function (iv) { return transpose(c.root, iv); });
  }
  // 転回形: 0 基本形 / 1 第1転回形 / 2 第2転回形 / 3 第3転回形。分母が構成音に無ければ -1
  function inversion(s) {
    var c = parseChord(s), tones = chordTones(s);
    for (var i = 0; i < tones.length; i++) if (tones[i].step === c.bass.step && tones[i].alt === c.bass.alt) return i;
    return -1;
  }
  // 五線に置く音の並び（下から）。いちばん下の音を、文字の高さで low 以上の最初の位置に置き、上へ密集して積む
  function voicing(s, low) {
    var c = parseChord(s), tones = chordTones(s), inv = inversion(s);
    var order = inv >= 0 ? tones.slice(inv).concat(tones.slice(0, inv)) : [c.bass].concat(tones);
    var floor = dia(low || "C4"), out = [], last = null;
    order.forEach(function (t) {
      var d = floor + mod(t.step - mod(floor, 7), 7);
      if (last != null) while (d <= last) d += 7;
      var p = pitch(t.step, t.alt, Math.floor(d / 7));
      out.push(p); last = d;
    });
    return out;
  }
  // 音の集まり → 考えられるコード名すべて。notes は下から並べる（いちばん下を分母に使う）
  //   同じ構成音で名前が 2 つあるもの（C6 と Am7/C）は、どちらも返す。異名同音は区別する（C E G♯ は Caug、C E A♭ は A♭aug/C）
  function identify(notes) {
    var ps = notes.map(parse), seen = {}, classes = [];
    ps.forEach(function (p) { var k = key(cls(p)); if (!seen[k]) { seen[k] = 1; classes.push(cls(p)); } });
    var bass = cls(ps[0]), out = [];
    classes.forEach(function (root) {
      var ivs = classes.map(function (p) { return interval(pitch(root.step, root.alt, 4), above(root, p)).name; });
      CHORDS.forEach(function (t) {
        if (t.tones.length !== ivs.length) return;
        if (t.tones.every(function (iv) { return ivs.indexOf(iv) >= 0; })) out.push(chordName(root, t.sym, bass));
      });
    });
    return out;
  }
  // 音の種類 p を、root（4 オクターブ）以上で最も近い高さに置く
  function above(root, p) {
    var r = pitch(root.step, root.alt, 4), d = dia(r) + mod(p.step - root.step, 7);
    return pitch(p.step, p.alt, Math.floor(d / 7));
  }

  var T = {
    LETTERS: LETTERS, SYSTEMS: SYSTEMS, CLEFS: CLEFS, CHORDS: CHORDS, SOLFEGE: SOLFEGE,
    parse: parse, key: key, cls: cls, midi: midi, dia: dia, fromDia: fromDia, same: same, name: name,
    staffPos: staffPos, placeOf: placeOf, ledgers: ledgers, pitchAt: pitchAt, clef: clef,
    interval: interval, parseInterval: parseInterval, intervalName: intervalName, transpose: transpose,
    compareIntervals: compareIntervals,
    parseKey: parseKey, fifthsOf: fifthsOf, keyAt: keyAt, keySignature: keySignature, keySigPlaces: keySigPlaces,
    accidentalIn: accidentalIn, keyName: keyName, scale: scale, solfege: solfege,
    chordType: chordType, parseChord: parseChord, chordName: chordName, chordTones: chordTones,
    inversion: inversion, voicing: voicing, identify: identify
  };
  G.MusicTheory = T;
  if (typeof module !== "undefined" && module.exports) module.exports = T;
})(typeof window !== "undefined" ? window : this);
