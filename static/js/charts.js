// PerFACT interactive bar charts — growing bars on scroll, tabbed metrics,
// digitized directly from the paper's tables (see comments per chart).
(function () {
  "use strict";

  var TASKS6 = ["TableTop", "Box", "Bins", "Shelf I", "Shelf II", "Shelf III"];
  var C = {
    blue: "#3B6FD4", orange: "#E0862A", teal: "#2AA7A0", purple: "#6B4FD6",
    green: "#2D9B63", rose: "#C74E86", slate: "#9AA0A6", gold: "#C9A227",
    red: "#C0392B", lightblue: "#7AAFD4"
  };
  var OURS = { color: C.purple, ours: true };

  var CHARTS = {

    // ── Main results: Table III / Table IV ──────────────────────────────
    main: {
      groups: [
        { label: "Sampling-based", methods: ["ait"] },
        { label: "Neural Samplers", methods: ["mpnets", "simpnet"] },
        { label: "Ours", methods: ["ours"] }
      ],
      methodDefs: {
        ait:     { label: "AIT*",         color: C.blue },
        mpnets:  { label: "MPNets",       color: C.orange },
        simpnet: { label: "SIMPNet",      color: C.teal },
        ours:    { label: "MπNetsFusion", color: OURS.color, ours: true }
      },
      methodOrder: ["ait", "mpnets", "simpnet", "ours"],
      tasks: TASKS6,
      tabs: [
        { key: "time", label: "Planning Time ↓", unit: "s",
          desc: "MπNetsFusion plans in <b>0.22–0.24s</b> across the six environments. Averaged over Table III, this is approximately <b>4.6×</b> faster than AIT*, <b>18.5×</b> faster than MPNets, and <b>13.1×</b> faster than SIMPNet.",
          data: { ait: [1.02, 1.02, 1.02, 1.02, 1.02, 1.2], mpnets: [5.79, 2.8, 3.63, 3.39, 2.68, 7], simpnet: [4.54, 2.2, 3.55, 2.21, 2.57, 3.44], ours: [0.22, 0.23, 0.24, 0.24, 0.22, 0.22] } },
        { key: "sr", label: "Success Rate ↑", unit: "%",
          desc: "MπNetsFusion reaches <b>52.4%</b> average success — on par with AIT* (42.1%), MPNets (51%) and SIMPNet (51.8%) — while being an order of magnitude faster. Shelf tasks remain the hardest for every planner due to narrow passages and limited shelf-primitive diversity in training.",
          data: { ait: [31, 57, 69, 42, 27, 27], mpnets: [49, 67.3, 84.2, 40, 34, 32], simpnet: [67, 88.6, 95, 44, 35, 33], ours: [58.0, 61.3, 84.5, 38.0, 34.3, 38.3] } }
      ]
    },

  };

  // ── Unified paired-comparison panels (mixed units, small multiples) ────
  // Used where a bar-chart-per-metric would be too sparse (e.g. only two
  // conditions being compared): every metric is one row, independently
  // scaled, all visible at once instead of behind metric tabs.
  var COMPARE_PANELS = {

    // MotionBenchGen workspace-quality ablation: Table I
    wsquality: {
      legend: [
        { key: "random", label: "Random Placement", color: C.slate },
        { key: "llm", label: "MotionBenchGen (LLM-guided)", color: OURS.color, ours: true }
      ],
      rows: [
        { label: "Scene Collision Rate", better: "down", unit: "%", random: 53.00, llm: 14.00,
          note: "share of scenes with at least one object-object collision" },
        { label: "Object Collision Rate", better: "down", unit: "%", random: 37.28, llm: 9.00,
          note: "share of individual objects involved in a collision" },
        { label: "Object-Category Entropy", better: "up", unit: "", random: 0.74, llm: 0.92,
          note: "diversity of object types placed per workspace" },
        { label: "Table Surface Coverage", better: "neutral", unit: "%", random: 20.26, llm: 14.62,
          note: "occupied table area — a density trade-off, not strictly better/worse" }
      ]
    }
  };

  // ── Named ablation/comparison charts (Ablations & Comparisons section) ──
  var NAMED_CHARTS = {

    // Table VII (Nr / S) + Table VIII (Cold-start / Params)
    combining: {
      groups: [
        { label: "Attention Baseline", methods: ["act"] },
        { label: "π-Variants", methods: ["all", "config"] },
        { label: "Cross-Attention", methods: ["vitac"] },
        { label: "Ours", methods: ["ours"] }
      ],
      methodDefs: {
        act:    { label: "ACT",                 color: C.red },
        all:    { label: "MπNetsFusion-All",     color: C.lightblue },
        config: { label: "MπNetsFusion-Config",  color: C.blue },
        vitac:  { label: "ViTacFormer",          color: C.rose },
        ours:   { label: "MπNetsFusion",         color: OURS.color, ours: true }
      },
      methodOrder: ["act", "all", "config", "vitac", "ours"],
      tasks: TASKS6,
      tabs: [
        { key: "reach", label: "Goal Reaching ↑", unit: "%", tasks: TASKS6,
          desc: "Fusing modalities through bottleneck tokens (All / Config / Ours) reaches the goal far more reliably than vanilla pairwise attention (ACT), which lets the workspace embedding dominate.",
          data: { act: [87, 86, 88.5, 69.66, 74, 85.3], all: [96, 97.6, 100, 100, 95, 93], config: [100, 99.3, 100, 100, 98.3, 93.3], vitac: [100, 100, 100, 100, 98.3, 99.33], ours: [100, 100, 100, 100, 100, 97.3] } },
        { key: "succ", label: "Success Rate ↑", unit: "%", tasks: TASKS6,
          desc: "MπNetsFusion, its All/Config variants, and ViTacFormer all land within a few points of each other — well above the ACT baseline — confirming that restricting cross-modal flow through bottleneck tokens is what matters most.",
          data: { act: [37, 51, 65.25, 30.6, 27, 28.3], all: [49, 61, 86.75, 34, 31, 36.6], config: [57, 60.3, 85, 40.3, 34, 40.6], vitac: [57, 62, 85.75, 35.7, 34.6, 33.4], ours: [58, 61.3, 84.5, 38.0, 34.3, 38.3] } },
        { key: "cold", label: "Cold-Start Time ↓", unit: "ms", tasks: [""],
          desc: "MπNetsFusion responds to a new problem in <b>4.1ms</b> — close to the smallest ACT baseline (3.8ms) despite fusing more modalities, and faster than both separated-modality variants.",
          data: { act: [3.8], all: [7], config: [4.6], vitac: [5.01], ours: [4.1] } },
        { key: "params", label: "Network Size ↓", unit: "M", tasks: [""],
          desc: "At <b>4.9M</b> parameters, MπNetsFusion stays close to the lean ACT baseline (4.52M) — the All/Config variants that separate modalities further cost noticeably more parameters for little extra accuracy.",
          data: { act: [4.52], all: [7.32], config: [6.1], vitac: [4.6], ours: [4.9] } }
      ]
    },

    // Figure 10: Neural MP (base / GMM head) vs MπNetsFusion
    neuralmp: {
      groups: [{ label: "Neural MP", methods: ["base", "gmm"] }, { label: "Ours", methods: ["ours"] }],
      methodDefs: {
        base: { label: "Neural MP (base policy)", color: C.slate },
        gmm:  { label: "Neural MP (GMM head)",     color: C.green },
        ours: { label: "MπNetsFusion",             color: OURS.color, ours: true }
      },
      methodOrder: ["base", "gmm", "ours"],
      tasks: TASKS6,
      tabs: [
        { key: "sr", label: "Success Rate ↑", unit: "%",
          desc: "Neural MP's GMM head closes much of the gap to its multi-modal, sampling-based base policy, but MπNetsFusion still edges ahead on TableTop, Box and — most notably — Bins (84.5% vs 58.5%), without any explicit multi-modal sampling head.",
          data: { base: [4.0, 19.0, 27.0, 14.0, 11.0, 13.0], gmm: [47.0, 61.0, 58.5, 43.4, 34.4, 29.4], ours: [58.0, 61.3, 84.5, 38.0, 34.3, 38.3] } },
        { key: "time", label: "Planning Time ↓", unit: "s",
          desc: "MπNetsFusion plans roughly <b>15×</b> faster than Neural MP's GMM head across every task, since it makes a single forward pass rather than recurrently decoding with an RNN-based head. (Digitized from Fig. 10 — no per-task timing values are printed in the paper.)",
          data: { base: [0.68, 0.72, 0.70, 0.68, 0.70, 0.70], gmm: [3.45, 3.40, 3.60, 3.55, 3.48, 3.42], ours: [0.22, 0.23, 0.24, 0.24, 0.22, 0.22] } }
      ]
    },

    // Figure 11: Diffusion Policy vs MπNetsFusion
    diffusion: {
      groups: [{ label: "Diffusion Policy", methods: ["dp"] }, { label: "Ours", methods: ["ours"] }],
      methodDefs: {
        dp:   { label: "Diffusion Policy", color: C.gold },
        ours: { label: "MπNetsFusion",     color: OURS.color, ours: true }
      },
      methodOrder: ["dp", "ours"],
      tasks: TASKS6,
      tabs: [
        { key: "sr", label: "Success Rate ↑", unit: "%",
          desc: "With the same ACT-style encoder, MπNetsFusion's single-step flow head matches or slightly exceeds Diffusion Policy's success rate on every task.",
          data: { dp: [48, 55, 62, 33, 26, 29], ours: [58.0, 61.3, 84.5, 38.0, 34.3, 38.3] } },
        { key: "time", label: "Planning Time ↓", unit: "s",
          desc: "Diffusion Policy's 100 denoising steps make it roughly <b>12×</b> slower than MπNetsFusion for comparable success. (Digitized from Fig. 11 — no per-task timing values are printed in the paper.)",
          data: { dp: [2.10, 2.75, 2.78, 2.65, 2.65, 2.75], ours: [0.22, 0.23, 0.24, 0.24, 0.22, 0.22] } }
      ]
    },

    // Table IX / Table X: action-chunk size
    actionchunk: {
      groups: [{ label: "Chunk Size", methods: ["c1", "c5", "c20", "cmain"] }],
      methodDefs: {
        c1:    { label: "#1",          color: C.lightblue },
        c5:    { label: "#5",          color: C.blue },
        c20:   { label: "#20",         color: C.green },
        cmain: { label: "#10 (Ours)",  color: OURS.color, ours: true }
      },
      methodOrder: ["c1", "c5", "c20", "cmain"],
      tasks: TASKS6,
      tabs: [
        { key: "sr", label: "Success Rate ↑", unit: "%", tasks: TASKS6,
          desc: "Success rate is essentially flat across chunk sizes — expected, since all planners run open-loop to a fixed horizon in a static environment.",
          data: { c1: [55, 57, 82, 35, 32, 36], c5: [57, 60, 81, 30, 34, 37], c20: [52, 60, 83, 35, 32, 40], cmain: [58, 61.3, 84.5, 35.7, 34.6, 33.4] } },
        { key: "time", label: "Planning Time ↓", unit: "s", tasks: TASKS6,
          desc: "Larger chunks mean fewer robot point-cloud re-samples per rollout, so planning time drops sharply as chunk size grows from 1 to 10.",
          data: { c1: [1.38, 1.36, 1.34, 1.38, 1.39, 1.41], c5: [0.44, 0.49, 0.47, 0.47, 0.46, 0.47], c20: [0.29, 0.34, 0.30, 0.30, 0.28, 0.28], cmain: [0.22, 0.23, 0.24, 0.24, 0.22, 0.22] } },
        { key: "rel", label: "Relative Time (×) ↓", unit: "x", tasks: TASKS6,
          desc: "Normalized to the main chunk size (10): a chunk of 1 is roughly <b>6×</b> slower, chunk 5 is <b>~2×</b> slower, and chunk 20 is <b>~1.3×</b> slower than the main policy.",
          data: { c1: [6.27, 5.91, 5.58, 5.57, 6.31, 6.40], c5: [2.0, 2.13, 1.95, 1.95, 2.09, 2.13], c20: [1.31, 1.47, 1.25, 1.25, 1.27, 1.27], cmain: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0] } }
      ]
    },

    // Table XII: bottleneck token count
    bottleneck: {
      groups: [{ label: "Bottleneck Tokens", methods: ["actwo", "b1", "b2", "b4", "b6", "b8"] }],
      methodDefs: {
        actwo: { label: "ACT (w/o)",  color: C.red },
        b1:    { label: "#1",         color: C.slate },
        b2:    { label: "#2",         color: C.lightblue },
        b4:    { label: "#4 (Ours)",  color: OURS.color, ours: true },
        b6:    { label: "#6",         color: C.orange },
        b8:    { label: "#8",         color: C.teal }
      },
      methodOrder: ["actwo", "b1", "b2", "b4", "b6", "b8"],
      tasks: TASKS6,
      tabs: [
        { key: "sr", label: "Success Rate ↑", unit: "%",
          desc: "Any nonzero number of bottleneck tokens beats the no-bottleneck ACT baseline by a wide margin; performance is fairly stable from 1–8 tokens, so 4 is a good accuracy/size trade-off.",
          data: { actwo: [37, 51, 65.25, 30.6, 27, 28.3], b1: [54, 60, 84, 34, 32, 35], b2: [54, 61, 80, 38, 33, 32], b4: [58, 61.3, 84.5, 35.7, 34.6, 33.4], b6: [56, 61, 86, 32, 32, 38], b8: [53, 61, 84, 33, 32, 35] } }
      ]
    },

    // Table XIII: PointNet++ set-abstraction radius
    radius: {
      groups: [{ label: "Set-Abstraction Radius", methods: ["r005", "r01", "r03"] }],
      methodDefs: {
        r005: { label: "0.05",        color: C.lightblue },
        r01:  { label: "0.1 (Ours)",  color: OURS.color, ours: true },
        r03:  { label: "0.3",         color: C.orange }
      },
      methodOrder: ["r005", "r01", "r03"],
      tasks: TASKS6,
      tabs: [
        { key: "sr", label: "Success Rate ↑", unit: "%",
          desc: "Performance barely moves across radii — the downsampled point clouds (16 robot / 128 scene tokens) already cover the planning space well at any tested radius.",
          data: { r005: [46, 59.7, 77.6, 31.7, 29.7, 35.7], r01: [48, 59, 77, 34, 29, 37], r03: [48, 61, 74.4, 37.3, 28.7, 36.7] } }
      ]
    },

    // Table XI: workspace-generation source
    workspacegen: {
      groups: [{ label: "Training Workspaces", methods: ["random", "llm"] }],
      methodDefs: {
        random: { label: "Random Placement",              color: C.slate },
        llm:    { label: "MotionBenchGen (Ours)",       color: OURS.color, ours: true }
      },
      methodOrder: ["random", "llm"],
      tasks: TASKS6,
      tabs: [
        { key: "sr", label: "Success Rate ↑", unit: "%",
          desc: "Trained on matched-size (~430K trajectory) datasets, the planner trained on MotionBenchGen's LLM-guided workspaces beats the random-placement baseline on every task — most on Bins (+6pp).",
          data: { random: [45, 55, 71, 33, 26, 32], llm: [48, 59, 77, 34, 29, 37] } }
      ]
    },

    // Table VI: failure analysis (6 shelf variants + main tasks)
    failure: {
      groups: [{ label: "Environments", methods: ["v"] }],
      methodDefs: { v: { label: "MπNetsFusion", color: OURS.color, ours: true } },
      methodOrder: ["v"],
      tasks: ["TableTop", "Box", "Bins", "Shelf 1", "Shelf 2", "Shelf 3", "Shelf 4", "Shelf 5", "Shelf 6"],
      tabs: [
        { key: "success", label: "Success ↑", unit: "%", color: C.green,
          desc: "Success is high and stable on TableTop/Box/Bins, but drops sharply across all six shelf variants — the recurring bottleneck for open-loop planning.",
          data: { v: [58, 61.3, 84.5, 38.0, 34.3, 38.3, 34.3, 28.3, 25.3] } },
        { key: "collision", label: "Any Collision ↓", unit: "%", color: C.red,
          desc: "Collision rate mirrors the success-rate trend in reverse — shelf environments see 59–74% of rollouts collide somewhere, roughly double the rate on open tasks.",
          data: { v: [42, 38.7, 15.5, 62, 65.7, 59, 65.7, 71.7, 74.3] } },
        { key: "self", label: "Self-Collision", unit: "%", color: C.gold,
          desc: "Self-collisions stay in the single digits to low teens everywhere — most failures come from hitting the environment, not the robot hitting itself.",
          data: { v: [4, 10.7, 2.0, 9.7, 12.7, 10.3, 7.7, 9.3, 13.0] } },
        { key: "scene", label: "Scene-Collision", unit: "%", color: C.rose,
          desc: "Scene collisions dominate the failure mode in shelves (45–52%), consistent with the limited diversity of shelf-like primitives in the MotionBenchGen training pool and the narrow passages shelves require.",
          data: { v: [32, 21, 12.5, 48.7, 48.0, 44.7, 52.3, 50.0, 51.7] } }
      ]
    }
  };

  // ── Real-world deployment: Table XIV ────────────────────────────────
  var REALWORLD = {
    groups: [{ label: "Metric", methods: ["reach", "succ"] }],
    methodDefs: {
      reach: { label: "Reached Goal", color: C.lightblue },
      succ:  { label: "Successful",   color: OURS.color, ours: true }
    },
    methodOrder: ["reach", "succ"],
    tasks: ["TableTop", "Bins", "Articulated", "Shelf", "Total"],
    tabs: [
      { key: "rate", label: "Real-World Rate", unit: "%",
        data: { reach: [100, 100, 100, 100, 100], succ: [96, 84, 60, 36, 69] } }
    ]
  };

  // ─────────────────────────────────────────────────────────────────────
  // Shared rendering engine
  // ─────────────────────────────────────────────────────────────────────

  function dataRange(data, methodOrder) {
    var min = Infinity, max = -Infinity;
    methodOrder.forEach(function (m) {
      (data[m] || []).forEach(function (v) {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
    if (!isFinite(min)) { min = 0; max = 1; }
    return { min: min, max: max * 1.12 || 1 };
  }

  function toHeight(v, range) {
    return range.max > 0 ? Math.max(0, (v / range.max) * 92) : 0;
  }

  function fmtVal(v, unit) {
    if (unit === "%") return v.toFixed(1) + "%";
    if (unit === "s") return v.toFixed(2) + "s";
    if (unit === "ms") return v.toFixed(1) + "ms";
    if (unit === "M") return v.toFixed(2) + "M";
    if (unit === "x") return v.toFixed(2) + "x";
    return v < 0.1 ? v.toFixed(3) : v.toFixed(2);
  }

  function buildLegend(container, spec) {
    var legend = document.createElement("div");
    legend.className = "fmp-legend";
    spec.groups.forEach(function (grp) {
      var grpEl = document.createElement("span");
      grpEl.className = "fmp-legend-group";
      var lbl = document.createElement("span");
      lbl.className = "fmp-legend-group-label";
      lbl.textContent = grp.label + ":";
      grpEl.appendChild(lbl);
      grp.methods.forEach(function (m) {
        var def = spec.methodDefs[m];
        if (!def) return;
        var item = document.createElement("span");
        item.className = "fmp-legend-item";
        var sw = document.createElement("span");
        sw.className = "fmp-legend-swatch";
        sw.style.background = def.color;
        item.appendChild(sw);
        item.appendChild(document.createTextNode(def.label));
        grpEl.appendChild(item);
      });
      legend.appendChild(grpEl);
    });
    container.appendChild(legend);
  }

  function buildPlot(wrap, tab, spec) {
    var tasks = tab.tasks || spec.tasks;
    var range = dataRange(tab.data, spec.methodOrder);
    if (tab.unit === "%") range = { min: 0, max: 100 };

    var axis = document.createElement("div");
    axis.className = "fmp-y-axis";
    var ticks;
    if (tab.unit === "%") {
      ticks = [0, 25, 50, 75, 100];
    } else {
      var step = range.max > 6 ? Math.ceil(range.max / 4) : range.max > 2 ? 1 : (range.max > 0.4 ? 0.5 : 0.1);
      ticks = [];
      for (var t = 0; t <= range.max + step; t += step) ticks.push(Math.round(t * 100) / 100);
    }
    ticks.slice().reverse().forEach(function (v) {
      var tick = document.createElement("div");
      tick.className = "fmp-y-tick";
      tick.textContent = fmtVal(v, tab.unit);
      axis.appendChild(tick);
    });
    wrap.appendChild(axis);

    var plot = document.createElement("div");
    plot.className = "fmp-chart-plot";
    if (tasks.length === 1 && !tasks[0]) plot.classList.add("fmp-chart-plot-single");

    tasks.forEach(function (task, ti) {
      var group = document.createElement("div");
      group.className = "fmp-bar-group";
      var bars = document.createElement("div");
      bars.className = "fmp-bar-group-bars";

      var prevGrp = null;
      spec.methodOrder.forEach(function (m) {
        var curGrp = null;
        spec.groups.forEach(function (g) { if (g.methods.indexOf(m) >= 0) curGrp = g.label; });
        if (prevGrp && curGrp !== prevGrp) {
          var sp = document.createElement("div"); sp.className = "fmp-bar-spacer"; bars.appendChild(sp);
        }
        prevGrp = curGrp;

        var v = (tab.data[m] || [])[ti];
        if (v === undefined || v === null) return;
        var pct = toHeight(v, range);

        var bar = document.createElement("div");
        bar.className = "fmp-bar";
        var def = spec.methodDefs[m];
        var color = tab.color || (def && def.color) || C.blue;
        bar.style.background = color;
        if ((def && def.ours) || tab.oursColor) bar.classList.add("fmp-bar-ours");
        bar.style.setProperty("--target", pct + "%");

        var tip = document.createElement("span");
        tip.className = "fmp-bar-tooltip";
        var tipLabel = def ? def.label : "";
        tip.textContent = (task ? task + " · " : "") + tipLabel + ": " + fmtVal(v, tab.unit);
        bar.appendChild(tip);
        bars.appendChild(bar);
      });

      group.appendChild(bars);
      if (task) {
        var lbl = document.createElement("div");
        lbl.className = "fmp-bar-group-label";
        lbl.textContent = task;
        group.appendChild(lbl);
      }
      plot.appendChild(group);
    });
    wrap.appendChild(plot);
  }

  function buildChart(el, spec) {
    var activeIdx = 0;
    var multiTab = spec.tabs.length > 1;

    if (multiTab) {
      var tabs = document.createElement("div");
      tabs.className = "fmp-metric-tabs";
      spec.tabs.forEach(function (tab, idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fmp-metric-tab" + (idx === 0 ? " active" : "");
        btn.textContent = tab.label;
        btn.addEventListener("click", function () {
          if (idx === activeIdx) return;
          activeIdx = idx;
          tabs.querySelectorAll(".fmp-metric-tab").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          wrap.innerHTML = "";
          buildPlot(wrap, spec.tabs[activeIdx], spec);
          requestAnimationFrame(function () { el.classList.add("in-view"); });
          if (desc) {
            desc.innerHTML = spec.tabs[activeIdx].desc || "";
            desc.classList.remove("desc-visible");
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { desc.classList.add("desc-visible"); });
            });
          }
        });
        tabs.appendChild(btn);
      });
      el.appendChild(tabs);
    }

    buildLegend(el, spec);

    var wrap = document.createElement("div");
    wrap.className = "fmp-chart-wrap";
    el.appendChild(wrap);
    buildPlot(wrap, spec.tabs[0], spec);

    var desc = null;
    if (spec.tabs[0].desc) {
      desc = document.createElement("p");
      desc.className = "fmp-chart-desc desc-visible";
      desc.innerHTML = spec.tabs[0].desc;
      el.appendChild(desc);
    }
  }

  function initInView() {
    var els = document.querySelectorAll(".fmp-bar-chart, .compare-panel");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) { obs.observe(el); });
  }

  // ── Unified paired-comparison panel: one row per metric, each ──────────
  // independently scaled so mixed units (%, counts, entropy) stay legible
  // side by side instead of hiding behind metric tabs.
  function fmtCompare(v, unit) {
    if (unit === "%") return v.toFixed(1) + "%";
    return (Number.isInteger(v) ? v : v.toFixed(2)).toString();
  }

  function buildComparePanel(el, spec) {
    el.classList.add("compare-panel");

    var legend = document.createElement("div");
    legend.className = "fmp-legend compare-legend";
    spec.legend.forEach(function (m) {
      var item = document.createElement("span");
      item.className = "fmp-legend-item";
      var sw = document.createElement("span");
      sw.className = "fmp-legend-swatch";
      sw.style.background = m.color;
      item.appendChild(sw);
      item.appendChild(document.createTextNode(m.label));
      legend.appendChild(item);
    });
    el.appendChild(legend);

    var rows = document.createElement("div");
    rows.className = "compare-rows";

    spec.rows.forEach(function (r) {
      var rowMax = Math.max(r.random, r.llm) * 1.18 || 1;
      var row = document.createElement("div");
      row.className = "compare-row";

      var label = document.createElement("div");
      label.className = "compare-label";
      var arrow = r.better === "down" ? "↓ lower better" : r.better === "up" ? "↑ higher better" : "trade-off";
      label.innerHTML = r.label + '<span class="compare-arrow compare-arrow-' + r.better + '">' + arrow + "</span>" +
        (r.note ? '<span class="compare-note">' + r.note + "</span>" : "");
      row.appendChild(label);

      var bars = document.createElement("div");
      bars.className = "compare-bars";
      spec.legend.forEach(function (m) {
        var v = r[m.key];
        if (v === undefined) return;
        var line = document.createElement("div");
        line.className = "compare-bar-line";
        var track = document.createElement("div");
        track.className = "compare-bar-track";
        var fill = document.createElement("div");
        fill.className = "compare-bar-fill";
        fill.style.background = m.color;
        fill.style.setProperty("--target", Math.max(2, (v / rowMax) * 100) + "%");
        track.appendChild(fill);
        line.appendChild(track);
        var val = document.createElement("span");
        val.className = "compare-bar-value";
        val.textContent = fmtCompare(v, r.unit);
        line.appendChild(val);
        bars.appendChild(line);
      });
      row.appendChild(bars);

      var delta = document.createElement("div");
      var diff = r.llm - r.random;
      var sign = diff > 0 ? "+" : "";
      var deltaCls = r.better === "neutral" ? "neutral" : (r.better === "down" ? diff < 0 : diff > 0) ? "good" : "bad";
      delta.className = "compare-delta compare-delta-" + deltaCls;
      delta.textContent = sign + fmtCompare(diff, r.unit);
      row.appendChild(delta);

      rows.appendChild(row);
    });

    el.appendChild(rows);
  }

  // ── Section-level tab switching (Ablations & Comparisons) ──────────────
  function initSecTabs() {
    document.querySelectorAll(".sec-tab-nav").forEach(function (nav) {
      var btns = nav.querySelectorAll(".sec-tab");
      var parent = nav.parentElement;
      function activate(btn) {
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var targetId = btn.getAttribute("data-panel");
        parent.querySelectorAll(".sec-panel").forEach(function (p) {
          if (p.id === targetId) {
            p.classList.remove("sec-panel-hidden");
            p.querySelectorAll(".fmp-bar-chart").forEach(function (c) { c.classList.add("in-view"); });
          } else {
            p.classList.add("sec-panel-hidden");
          }
        });
      }
      btns.forEach(function (btn) { btn.addEventListener("click", function () { activate(btn); }); });
    });
  }

  // ── Task gallery tabs (real-world figure switcher) ──────────────────────
  function initTaskGalleries() {
    document.querySelectorAll(".task-gallery").forEach(function (gallery) {
      var nav = gallery.querySelector(".task-gallery-nav");
      if (!nav) return;
      var btns = nav.querySelectorAll("button");
      btns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          btns.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          var targetId = btn.getAttribute("data-panel");
          gallery.querySelectorAll(".task-gallery-panel").forEach(function (p) {
            p.classList.toggle("active", p.id === targetId);
          });
        });
      });
    });
  }

  // ── Generic scroll reveal for .reveal-block wrapper sections ───────────
  function initReveal() {
    var blocks = document.querySelectorAll(".reveal-block");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      blocks.forEach(function (b) { b.classList.add("is-visible"); });
      return;
    }
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); rio.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    blocks.forEach(function (b) { rio.observe(b); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".fmp-bar-chart[data-chart]").forEach(function (el) {
      var key = el.getAttribute("data-chart");
      var spec = CHARTS[key] || NAMED_CHARTS[key] || (key === "realworld" ? REALWORLD : null);
      if (spec) buildChart(el, spec);
    });
    document.querySelectorAll("[data-compare]").forEach(function (el) {
      var spec = COMPARE_PANELS[el.getAttribute("data-compare")];
      if (spec) buildComparePanel(el, spec);
    });
    initInView();
    initSecTabs();
    initTaskGalleries();
    initReveal();
  });
})();
