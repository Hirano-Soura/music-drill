// 読譜の出題と採点（改善計画 項目48-1。計画/音楽.md §3「出題の種類」）
//
// データには問題ではなく「出題範囲の宣言」を書く（type ＋ spec。LC-2）。ここが宣言から問いを計算で作る。
// 音の計算はすべて 理論.js（window.MusicTheory）を呼ぶ。ここに音の規則を書かない（LD-1）。
//
// 問いの形（画面と検査が読む）
//   type     … 出題の種類（TYPES の鍵）
//   target   … 記録の鍵。「種類×対象」（例: "note:treble:E5"）。苦手はこの単位で数える
//   clef / fifths / staff … 五線に描くもの。staff は列の並びで、1 列が同時に鳴る音（和音なら複数）
//   prompt   … 五線のほかに文字で出すもの（{kind, value}）。表記に合わせた文字は label() が作る
//   choices  … 選択肢の id の並び。answer は正解の id（メロディは id の列）。accept は正解として認める id の全部
(function (G) {
  "use strict";
  var T = G.MusicTheory;

  // ---- 乱数（種を決めると同じ問いが出る。検査で使う） ----
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function shuffle(a, r) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function between(low, high, alts, rare) {
    var out = [], lo = T.dia(low), hi = T.dia(high);
    for (var d = lo; d <= hi; d++) {
      (alts || [0]).forEach(function (a) {
        var p = T.fromDia(d, a);
        // E♯・F♭・B♯・C♭ は、rare を宣言した範囲でだけ出す
        if (a !== 0 && !rare && ((a > 0 && (p.step === 2 || p.step === 6)) || (a < 0 && (p.step === 3 || p.step === 0)))) return;
        out.push(p);
      });
    }
    return out;
  }
  function uniqKeys(ps) {
    var seen = {}, out = [];
    ps.forEach(function (p) { var k = T.key(T.cls(p)); if (!seen[k]) { seen[k] = 1; out.push(k); } });
    return out;
  }
  // 選択肢の並び: 文字の順、同じ文字なら ♭ ♮ ♯ の順
  function byLetter(a, b) {
    var x = T.parse(a), y = T.parse(b);
    return x.step - y.step || x.alt - y.alt;
  }

  // ---- 種類ごとの作り方 ----
  //   all(range) … 範囲の宣言から作れる問いの全部（メロディのように数えきれないものは見本 n 問）
  var TYPES = {};

  // 単音: 五線の 1 音 → 音名
  TYPES.note = {
    all: function (r) {
      var s = r.spec, ps = between(s.low, s.high, s.accidentals ? [-1, 0, 1] : [0], s.rare);
      var choices = uniqKeys(ps).sort(byLetter);
      return ps.map(function (p) {
        return {type: "note", target: "note:" + s.clef + ":" + T.key(p), clef: s.clef, fifths: 0, staff: [[p]],
          prompt: null, choices: choices, answer: T.key(T.cls(p)), accept: [T.key(T.cls(p))]};
      });
    }
  };

  // 調号: 調号 → 調（長調と平行調の短調）／調 → 調号
  TYPES.keysig = {
    all: function (r) {
      var s = r.spec, out = [], ns = [];
      for (var n = -s.max; n <= s.max; n++) ns.push(n);
      var choices = ns.map(String);
      var dirs = s.dir === "both" ? ["read", "write"] : [s.dir || "read"];
      dirs.forEach(function (dir) {
        ns.forEach(function (n) {
          if (dir === "read") {
            out.push({type: "keysig", dir: dir, target: "keysig:read:" + s.clef + ":" + n, clef: s.clef, fifths: n, staff: [],
              prompt: null, choices: choices, answer: String(n), accept: [String(n)]});
          } else {
            ["major", "minor"].forEach(function (mode) {
              var k = T.keyAt(n, mode);
              out.push({type: "keysig", dir: dir, target: "keysig:write:" + k, clef: s.clef, fifths: 0, staff: [],
                prompt: {kind: "key", value: k}, choices: choices, answer: String(n), accept: [String(n)]});
            });
          }
        });
      });
      return out;
    }
  };

  // 音程: 2 音 → 度数
  TYPES.interval = {
    all: function (r) {
      var s = r.spec, ps = between(s.low, s.high, s.accidentals ? [-1, 0, 1] : [0], s.rare), out = [], names = {};
      ps.forEach(function (a) {
        ps.forEach(function (b) {
          if (T.dia(b) <= T.dia(a)) return;
          var iv;
          try { iv = T.interval(a, b); } catch (e) { return; }
          if (iv.num > (s.maxNum || 8) || s.qualities.indexOf(iv.quality) < 0) return;
          names[iv.name] = 1;
          out.push({type: "interval", target: "interval:" + iv.name, clef: s.clef, fifths: 0, staff: [[a], [b]],
            prompt: null, answer: iv.name, accept: [iv.name]});
        });
      });
      var choices = Object.keys(names).sort(T.compareIntervals);
      out.forEach(function (q) { q.choices = choices; });
      return out;
    }
  };

  // メロディ: 4〜8 音の旋律 → 音名の列（または移動ドの階名）。調の音だけで作る
  TYPES.melody = {
    make: function (r, rand) {
      var s = r.spec, k = s.keys[Math.floor(rand() * s.keys.length)], x = T.parseKey(k), fifths = T.fifthsOf(k);
      var sc = T.scale(k), lo = T.dia(s.low), hi = T.dia(s.high);
      var len = s.length[0] + Math.floor(rand() * (s.length[1] - s.length[0] + 1));
      var d = lo + Math.floor(rand() * (hi - lo + 1)), ds = [d];
      for (var i = 1; i < len; i++) {
        var step = rand() < (s.stepRate == null ? 0.75 : s.stepRate) ? 1 : 2 + Math.floor(rand() * ((s.maxLeap || 4) - 1));
        var dir = rand() < 0.5 ? -1 : 1;
        if (d + dir * step < lo || d + dir * step > hi) dir = -dir;
        if (d + dir * step < lo || d + dir * step > hi) step = 1;
        d = Math.max(lo, Math.min(hi, d + dir * step));
        ds.push(d);
      }
      var tonicStep = x.tonic.step;
      var notes = ds.map(function (dd) {
        var p = T.fromDia(dd);
        var deg = ((p.step - tonicStep) % 7 + 7) % 7;
        p.alt = sc[deg].alt;
        return {p: p, deg: deg};
      });
      var answer = notes.map(function (n) { return s.solfege ? String(n.deg) : T.key(T.cls(n.p)); });
      var choices = s.solfege ? ["0", "1", "2", "3", "4", "5", "6"] : sc.map(function (p) { return T.key(p); });
      return {type: "melody", target: "melody:" + r.id, clef: s.clef, fifths: fifths, key: k, staff: notes.map(function (n) { return [n.p]; }),
        prompt: s.solfege ? {kind: "key", value: k} : null, choices: choices, answer: answer, accept: [answer.join(" ")], solfege: !!s.solfege};
    },
    all: function (r, n) {
      var out = [];
      for (var i = 0; i < (n || 200); i++) out.push(this.make(r, rng(hash(r.id) + i)));
      return out;
    }
  };

  // コード構成音: コード名 → 構成音（show: "name"）／五線の和音 → 構成音（show: "staff"）。4 択
  function chordList(s) {
    var out = [];
    s.roots.forEach(function (root) {
      s.types.forEach(function (sym) { out.push(T.chordName(root, sym)); });
    });
    return out;
  }
  TYPES["chord-tones"] = {
    all: function (r) {
      var s = r.spec;
      return chordList(s).map(function (c) {
        var tones = T.chordTones(c).map(T.key), ans = tones.join(",");
        var rand = rng(hash(r.id + c)), root = T.parseChord(c).root, cands = [];
        // 紛らわしい選択肢: 同じ根音のほかの種類と、構成音の 1 つだけを半音ずらしたもの
        T.CHORDS.forEach(function (t) { cands.push(T.chordTones(T.chordName(root, t.sym)).map(T.key).join(",")); });
        tones.forEach(function (tk, i) {
          [-1, 1].forEach(function (a) {
            var p = T.parse(tk); if (Math.abs(p.alt + a) > 1 || i === 0) return;
            var alt = tones.slice(); alt[i] = T.key({step: p.step, alt: p.alt + a, oct: null}); cands.push(alt.join(","));
          });
        });
        var wrong = shuffle(cands.filter(function (x, i) { return x !== ans && cands.indexOf(x) === i && x.split(",").length === tones.length; }), rand).slice(0, 3);
        var staff = s.show === "staff" ? [T.voicing(c, s.low || "C4")] : [];
        return {type: "chord-tones", target: "chord-tones:" + c, clef: s.clef, fifths: 0, staff: staff,
          prompt: s.show === "staff" ? null : {kind: "chord", value: c}, choices: shuffle([ans].concat(wrong), rand), answer: ans, accept: [ans]};
      });
    }
  };

  // コード名: 五線の和音（転回形を含む）→ コード名。4 択。同じ構成音で名前が 2 つあるもの（C6 と Am7/C）は、どちらも正解
  TYPES["chord-name"] = {
    all: function (r) {
      var s = r.spec, out = [];
      chordList(s).forEach(function (c) {
        var n = T.chordTones(c).length, invs = s.inversions ? n : 1;
        for (var inv = 0; inv < invs; inv++) {
          var bass = T.chordTones(c)[inv], name = T.chordName(T.parseChord(c).root, T.parseChord(c).type.sym, bass);
          var notes = T.voicing(name, s.low || "C4"), accept = T.identify(notes);
          var rand = rng(hash(r.id + name)), root = T.parseChord(c).root, cands = [];
          s.types.forEach(function (sym) { cands.push(T.chordName(root, sym, s.inversions ? bass : null)); });
          T.chordTones(c).forEach(function (b) { cands.push(T.chordName(root, T.parseChord(c).type.sym, b)); });
          s.roots.forEach(function (rt) { cands.push(T.chordName(rt, T.parseChord(c).type.sym)); });
          var wrong = shuffle(cands.filter(function (x, i) { return accept.indexOf(x) < 0 && cands.indexOf(x) === i; }), rand).slice(0, 3);
          out.push({type: "chord-name", target: "chord-name:" + T.parseChord(c).type.sym + ":" + inv, clef: s.clef, fifths: 0, staff: [notes],
            prompt: null, choices: shuffle([name].concat(wrong), rand), answer: name, accept: accept});
        }
      });
      return out;
    }
  };

  function all(range, n) {
    var t = TYPES[range.type];
    if (!t) throw new Error("出題の種類がありません: " + range.type);
    return t.all(range, n);
  }

  // ---- 表記に合わせた文字（画面が使う） ----
  function signLabel(n) { n = +n; return n === 0 ? "なし" : (n > 0 ? "♯" : "♭") + " " + Math.abs(n); }
  function label(q, id, sys) {
    if (q.type === "note") return T.name(id, sys);
    if (q.type === "keysig") {
      if (q.dir === "read") return T.keyName(T.keyAt(+id, "major"), sys) + " ／ " + T.keyName(T.keyAt(+id, "minor"), sys);
      return signLabel(id);
    }
    if (q.type === "interval") return T.intervalName(id, "ja");
    if (q.type === "melody") return q.solfege ? T.SOLFEGE[+id] : T.name(id, sys);
    if (q.type === "chord-tones") return id.split(",").map(function (k) { return T.name(k, sys); }).join(" ");
    if (q.type === "chord-name") return id;
    return id;
  }
  function promptText(q, sys) {
    if (!q.prompt) return "";
    if (q.prompt.kind === "key") return T.keyName(q.prompt.value, sys);
    if (q.prompt.kind === "chord") return q.prompt.value;
    return "";
  }
  function isCorrect(q, id) { return q.accept.indexOf(id) >= 0; }

  // ---- 記録と出す順 ----
  //   記録は「種類×対象」(target) ごとの {ok, ms} の並び。ms はメロディなら 1 音あたり
  //   goal … portal.js の goal（直近の問題数・正答率・回答時間の中央値。計画 §3 決定4）
  function median(xs) {
    if (!xs.length) return null;
    var a = xs.slice().sort(function (x, y) { return x - y; }), m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }
  function status(log, goal) {
    var last = log.slice(-goal.recent);
    var n = last.length, okN = last.filter(function (x) { return x.ok; }).length;
    var acc = n ? okN / n : null, med = median(last.map(function (x) { return x.ms; }));
    return {n: n, acc: acc, med: med, met: n >= goal.recent && acc >= goal.accuracy && med <= goal.medianMs};
  }
  // 苦手ほど多く出す。まだ出していない対象・間違えた対象・遅い対象を重くする。直前と同じ対象は避ける
  function weight(log, goal) {
    if (!log || !log.length) return 3;
    var st = status(log, {recent: 5, accuracy: 0, medianMs: 0});
    return 1 + 4 * (1 - st.acc) + (st.med > goal.medianMs ? 2 : 0);
  }
  function pick(qs, byTarget, goal, rand, lastTarget) {
    var ws = qs.map(function (q) { return q.target === lastTarget && qs.length > 1 ? 0 : weight(byTarget[q.target], goal); });
    var sum = ws.reduce(function (a, b) { return a + b; }, 0), x = rand() * sum;
    for (var i = 0; i < qs.length; i++) { x -= ws[i]; if (x < 0) return qs[i]; }
    return qs[qs.length - 1];
  }

  G.MusicDrill = {
    TYPES: TYPES, all: all, rng: rng, hash: hash, label: label, promptText: promptText, isCorrect: isCorrect,
    status: status, weight: weight, pick: pick, median: median
  };
})(typeof window !== "undefined" ? window : this);
