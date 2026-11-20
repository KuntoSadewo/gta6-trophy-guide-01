// GTA VI trophy guide & tracker: checklist saved in localStorage, filters,
// spoiler mode, export/import, roadmap and missable panels. Loads only
// data/trophies.json from this app's own files; makes no network request.
(function () {
  'use strict';

  var KEY = 'gta6-trophy-checklist-v1';
  var SPOILER_KEY = 'gta6-trophy-spoiler-v1';

  var listEl = document.getElementById('trophyList');
  var guideBody = document.getElementById('guideBody');
  var roadmapList = document.getElementById('roadmapList');
  var missableBody = document.getElementById('missableBody');
  var searchEl = document.getElementById('search');
  var kindEl = document.getElementById('kind');
  var gradeEl = document.getElementById('grade');
  var spoilerEl = document.getElementById('spoiler');
  var earnedOnlyEl = document.getElementById('earnedOnly');

  var trophies = [];
  var earned = new Set(loadStored(KEY));
  var selectedId = null;
  var spoilerOn = loadStored(SPOILER_KEY)[0] === '1';

  var KIND_LABELS = {
    story: 'Story',
    collectibles: 'Collectibles',
    activities: 'Activities',
    online: 'Online',
    platinum: 'Platinum'
  };

  var ROADMAP = [
    {
      stage: 1,
      title: 'Play the story — Chapters 1–4 and the final mission',
      text: 'Story trophies unlock as you play: the opening mission Gone Fishing, one trophy per chapter, one per named story mission (Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory) and a gold for the final mission. Nothing here can be missed by playing normally.'
    },
    {
      stage: 2,
      title: 'Finish the side stories',
      text: 'Complete the final mission for each contact — Andy, Kenton, Billy, Randy and Tyrone — and eight Stranger mission strands across Leonida. These unlock as the story opens the map up; check the contacts\u2019 missions before the finale.'
    },
    {
      stage: 3,
      title: 'Activities, challenges and crime',
      text: 'The biggest block: 250 stunts, gold medals in all 42 Shooting Range challenges, drone races at all 14 Top Fun locations, 20 different race wins, 50 challenges, fishing against Cal, one arcade game, hunting for Bret, robberies (shops, jewelry store, armored truck, 5 bank vaults, one illegal operation per gang), Combat Focus, and the partner, money and oddball trophies. All remain available in free roam after the story.'
    },
    {
      stage: 4,
      title: 'Collectibles and exploration',
      text: 'Meditate at all 18 spots (the one possibly missable trophy — do them as you find them), complete 3 Collectible Card sets, WAiNK It at 100 locations, discover 100 vehicles, explore all 52 areas of Leonida, buy every garage property and register 10 vehicles in the Scooter Bros app.'
    },
    {
      stage: 5,
      title: '100% completion, then the platinum',
      text: 'Open Progress > Stats > 100% Completion after the story to see what is left — earlier progress counts. When A Long Road (gold, 100% completion) pops, the platinum Vice Got a Price! follows with it. The guides put the platinum at roughly 200 hours and a 4/10 difficulty.'
    }
  ];

  function loadStored(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveEarned() {
    try { localStorage.setItem(KEY, JSON.stringify(Array.from(earned).sort())); } catch (e) { /* storage unavailable */ }
  }

  function saveSpoiler() {
    try { localStorage.setItem(SPOILER_KEY, JSON.stringify([spoilerOn ? '1' : '0'])); } catch (e) { /* storage unavailable */ }
  }

  function isStory(t) { return t.kind === 'story'; }
  function isHiddenFromSpoiler(t) {
    return spoilerOn && isStory(t) && !earned.has(t.name);
  }

  function trophyLabel(t) {
    return isHiddenFromSpoiler(t) ? 'Hidden story trophy' : t.name;
  }
  function trophyDesc(t) {
    return isHiddenFromSpoiler(t) ? 'Hidden until earned — turn spoiler mode off, or earn it, to reveal it.' : t.description;
  }

  function gradeCounts() {
    var counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
    trophies.forEach(function (t) {
      counts[t.grade][1] += 1;
      if (earned.has(t.name)) counts[t.grade][0] += 1;
    });
    return counts;
  }

  function nextUnearned() {
    for (var i = 0; i < trophies.length; i++) {
      if (trophies[i].grade !== 'platinum' && !earned.has(trophies[i].name)) return trophies[i];
    }
    return null;
  }

  function renderProgress() {
    var total = trophies.length;
    var done = earned.size;
    document.getElementById('progressCount').textContent = done + ' of ' + total + ' earned';
    var c = gradeCounts();
    document.getElementById('progressDetail').textContent =
      'Platinum ' + c.platinum[0] + '/' + c.platinum[1] +
      ' · Gold ' + c.gold[0] + '/' + c.gold[1] +
      ' · Silver ' + c.silver[0] + '/' + c.silver[1] +
      ' · Bronze ' + c.bronze[0] + '/' + c.bronze[1];
    var fill = document.getElementById('progressFill');
    fill.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
    document.getElementById('progressBar').setAttribute('aria-valuenow', String(done));
    var next = nextUnearned();
    document.getElementById('progressNext').textContent = next
      ? 'Next up: ' + next.name + ' — ' + next.description
      : (done >= total ? 'Platinum earned — you are a Leonida Legend.' : 'Platinum earned — tick it off to finish.');
  }

  function visibleTrophies() {
    var q = searchEl.value.trim().toLowerCase();
    return trophies.filter(function (t) {
      if (kindEl.value === 'missable' && !t.missable) return false;
      if (kindEl.value !== 'all' && kindEl.value !== 'missable' && t.kind !== kindEl.value) return false;
      if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
      if (earnedOnlyEl.checked && !earned.has(t.name)) return false;
      if (q) {
        var hay = (t.name + ' ' + t.description + ' ' + (t.guide || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function badge(text, cls) {
    var s = document.createElement('span');
    s.className = 'badge ' + cls;
    s.textContent = text;
    return s;
  }

  function renderList() {
    var shown = visibleTrophies();
    listEl.replaceChildren();
    document.getElementById('listCount').textContent = '(' + shown.length + ' of ' + trophies.length + ' shown)';
    if (!shown.length) {
      var empty = document.createElement('li');
      empty.className = 'empty-list';
      empty.textContent = kindEl.value === 'online'
        ? 'No online trophies: every one of the 55 is offline and single-player, so the online filter is empty by design.'
        : 'No trophies match these filters. Clear the search or pick another kind or grade.';
      listEl.append(empty);
      return;
    }
    shown.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'trophy' + (earned.has(t.name) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
      li.dataset.id = String(t.id);

      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned.has(t.name);
      box.setAttribute('aria-label', 'Earned: ' + t.name);
      box.addEventListener('change', function (ev) {
        ev.stopPropagation();
        if (box.checked) earned.add(t.name); else earned.delete(t.name);
        saveEarned();
        renderProgress();
        renderList();
        renderGuide();
      });
      li.append(box);

      var name = document.createElement('span');
      name.className = 'trophy-name';
      name.textContent = trophyLabel(t);
      li.append(name);

      var desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = trophyDesc(t);
      li.append(desc);

      var meta = document.createElement('div');
      meta.className = 'trophy-meta';
      meta.append(badge(t.grade.charAt(0).toUpperCase() + t.grade.slice(1), 'grade-' + t.grade));
      meta.append(badge(KIND_LABELS[t.kind] || t.kind, 'kind'));
      if (t.count) meta.append(badge('Count: ' + t.count, 'count'));
      if (t.hidden) meta.append(badge('Hidden', 'hidden-badge'));
      if (t.missable) meta.append(badge('MISSABLE', 'missable'));
      li.append(meta);

      var link = document.createElement('span');
      link.className = 'trophy-guide-link';
      link.textContent = 'Guide \u2192';
      li.append(link);

      // A click on the checkbox itself must not also select the row: the
      // checkbox's change handler re-renders the list, and re-rendering the
      // row during the click would destroy the checkbox before its change
      // event fires, so the tick would never be saved.
      li.addEventListener('click', function (ev) {
        if (ev.target === box) return;
        selectedId = t.id;
        renderList();
        renderGuide();
        document.getElementById('guidePanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      listEl.append(li);
    });
  }

  function renderGuide() {
    var t = null;
    for (var i = 0; i < trophies.length; i++) {
      if (trophies[i].id === selectedId) { t = trophies[i]; break; }
    }
    guideBody.replaceChildren();
    if (!t) {
      var p = document.createElement('p');
      p.textContent = 'Select a trophy in the checklist to read its guide, with sources.';
      guideBody.append(p);
      return;
    }
    var name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = trophyLabel(t);
    guideBody.append(name);

    var desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = 'Official: ' + trophyDesc(t);
    guideBody.append(desc);

    var meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(badge(t.grade.charAt(0).toUpperCase() + t.grade.slice(1), 'grade-' + t.grade));
    if (t.missable) {
      var flag = document.createElement('span');
      flag.className = 'missable-flag';
      flag.textContent = 'Possibly missable — see the guide below.';
      meta.append(flag);
    }
    guideBody.append(meta);

    var guide = document.createElement('div');
    guide.className = 'guide-text';
    guide.textContent = t.guide;
    guideBody.append(guide);

    if (t.sources && t.sources.length) {
      var h = document.createElement('p');
      h.innerHTML = '<strong>Sources for this guide:</strong>';
      guideBody.append(h);
      var ul = document.createElement('ul');
      ul.className = 'guide-sources';
      t.sources.forEach(function (s) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.target = '_blank';
        a.rel = 'noopener';
        li.append(a);
        ul.append(li);
      });
      guideBody.append(ul);
    }
  }

  function renderRoadmap() {
    roadmapList.replaceChildren();
    ROADMAP.forEach(function (stage) {
      var li = document.createElement('li');
      var h = document.createElement('h3');
      h.textContent = stage.title;
      li.append(h);
      var p = document.createElement('p');
      p.textContent = stage.text;
      li.append(p);
      var inStage = trophies.filter(function (t) { return t.roadmapStage === stage.stage; });
      var doneStage = inStage.filter(function (t) { return earned.has(t.name); }).length;
      var count = document.createElement('span');
      count.className = 'stage-count';
      count.textContent = doneStage + ' / ' + inStage.length + ' trophies in this stage';
      li.append(count);
      roadmapList.append(li);
    });
  }

  function renderMissable() {
    var miss = trophies.filter(function (t) { return t.missable; });
    missableBody.replaceChildren();
    var note = document.createElement('p');
    note.textContent = 'Built from the official descriptions and the cited guides: only one trophy is reported as possibly missable. The game has no mission replay, so keep manual saves across the story just in case.';
    missableBody.append(note);
    if (!miss.length) {
      var none = document.createElement('p');
      none.textContent = 'No missable trophies flagged.';
      missableBody.append(none);
      return;
    }
    var ul = document.createElement('ul');
    ul.className = 'missable-list';
    miss.forEach(function (t) {
      var li = document.createElement('li');
      var name = document.createElement('span');
      name.className = 'trophy-name';
      name.textContent = t.name + ' — ' + t.description;
      li.append(name);
      var g = document.createElement('p');
      g.textContent = t.guide;
      li.append(g);
      ul.append(li);
    });
    missableBody.append(ul);
  }

  function renderAll() {
    renderProgress();
    renderList();
    renderGuide();
    renderRoadmap();
    renderMissable();
  }

  function download(filename, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  document.getElementById('export').addEventListener('click', function () {
    download('gta6-trophy-progress.json', JSON.stringify({
      game: 'Grand Theft Auto VI',
      platform: 'PlayStation 5',
      exportedAt: new Date().toISOString(),
      earned: Array.from(earned).sort()
    }, null, 2));
  });

  document.getElementById('import').addEventListener('change', function (ev) {
    var file = ev.target.files && ev.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var names = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(names)) throw new Error('no earned list');
        var known = new Set(trophies.map(function (t) { return t.name; }));
        earned = new Set(names.filter(function (n) { return known.has(n); }));
        saveEarned();
        renderAll();
      } catch (e) {
        alert('That file is not a trophy-progress export from this guide.');
      }
      ev.target.value = '';
    };
    reader.readAsText(file);
  });

  document.getElementById('reset').addEventListener('click', function () {
    if (!confirm('Clear all earned trophies? This cannot be undone.')) return;
    earned = new Set();
    saveEarned();
    renderAll();
  });

  searchEl.addEventListener('input', renderList);
  kindEl.addEventListener('change', renderList);
  gradeEl.addEventListener('change', renderList);
  earnedOnlyEl.addEventListener('change', renderList);
  spoilerEl.addEventListener('change', function () {
    spoilerOn = spoilerEl.checked;
    saveSpoiler();
    renderList();
    renderGuide();
  });

  // Deep-link state for screenshots and sharing: ?guide=<id>&spoiler=1&filter=<kind>&panel=roadmap|missable
  var params = new URLSearchParams(window.location.search);
  if (params.get('spoiler') === '1') spoilerOn = true;
  if (params.get('filter')) {
    var f = params.get('filter');
    if (['story', 'missable', 'collectibles', 'activities', 'online'].indexOf(f) !== -1) kindEl.value = f;
  }
  if (params.get('guide')) {
    var gid = Number(params.get('guide'));
    if (Number.isInteger(gid)) selectedId = gid;
  }
  spoilerEl.checked = spoilerOn;

  fetch('data/trophies.json')
    .then(function (r) { return r.json(); })
    .then(function (doc) {
      trophies = doc.trophies || [];
      renderAll();
      var panel = params.get('panel');
      if (panel === 'roadmap') document.getElementById('roadmapPanel').scrollIntoView();
      if (panel === 'missable') document.getElementById('missablePanel').scrollIntoView();
      if (selectedId) document.getElementById('guidePanel').scrollIntoView();
    })
    .catch(function () {
      listEl.replaceChildren();
      var li = document.createElement('li');
      li.className = 'empty-list';
      li.textContent = 'Could not load data/trophies.json. Serve the app/ folder over HTTP (node serve.ts) and reload.';
      listEl.append(li);
    });
})();
