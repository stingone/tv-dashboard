// TV Dashboard — bewust ES5 zodat het ook op oudere Tizen-browsers draait.
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
    'september', 'oktober', 'november', 'december'];
  var hasTizen = typeof tizen !== 'undefined';

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function getJSON(url, ok, fail) {
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.timeout = 15000;
    x.onload = function () {
      var j;
      try { j = JSON.parse(x.responseText); } catch (e) { if (fail) fail(e); return; }
      if (x.status >= 200 && x.status < 300) ok(j); else if (fail) fail(new Error('HTTP ' + x.status));
    };
    x.onerror = x.ontimeout = function () { if (fail) fail(new Error('netwerk')); };
    x.send();
  }

  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.innerHTML = esc(msg);
    t.className = 'toast show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 2600);
  }

  /* ---------- Instellingen (bewaard op de TV) ---------- */
  var STORE_KEY = 'tvdash.settings.v1';
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function loadSettings() {
    var s = clone(DEFAULTS);
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved) for (var k in saved) if (saved.hasOwnProperty(k)) s[k] = saved[k];
    } catch (e) { /* geen opslag beschikbaar */ }
    if (!s.extra) s.extra = {};   // niet-catalogus-apps: { appId: naam }
    return s;
  }
  function saveSettings() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* negeren */ }
  }
  var S = loadSettings();

  /* ---------- Schalen naar het scherm ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var st = $('stage'), tf = 'scale(' + s + ')';
    st.style.transform = tf;
    st.style.webkitTransform = tf;
    st.style.left = ((window.innerWidth - 1920 * s) / 2) + 'px';
    st.style.top = ((window.innerHeight - 1080 * s) / 2) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- Achtergrond (procedureel getekend) ---------- */
  function rng(seed) {
    return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }
  function drawSky(kind) {
    var c = $('sky'), x = c.getContext('2d'), W = 1920, H = 1080, r = rng(11), i, px, py, s, g;
    var gauss = function () { return (r() + r() + r() + r() - 2) / 1.15; };
    x.clearRect(0, 0, W, H);

    g = x.createLinearGradient(0, 0, 0, H);
    if (kind === 'minimal') {
      g.addColorStop(0, '#0a0d16'); g.addColorStop(1, '#161b2b');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      return;
    }
    if (kind === 'aurora') {
      g.addColorStop(0, '#02050a'); g.addColorStop(0.6, '#061722'); g.addColorStop(1, '#0b2430');
    } else {
      g.addColorStop(0, '#03040a'); g.addColorStop(0.5, '#0a0e1d'); g.addColorStop(0.82, '#211b31'); g.addColorStop(1, '#2e2534');
    }
    x.fillStyle = g; x.fillRect(0, 0, W, H);

    if (kind === 'stars') {
      // Melkweg: diagonale band van gloed, dichte sterren en donkere stofbanen
      x.save();
      x.translate(W * 0.6, H * 0.42); x.rotate(-0.5);
      for (i = 0; i < 70; i++) {
        px = (r() - 0.5) * 2600; py = gauss() * 80; s = 120 + r() * 240;
        var col = r() < 0.5 ? '140,130,200' : '215,190,160';
        g = x.createRadialGradient(px, py, 0, px, py, s);
        g.addColorStop(0, 'rgba(' + col + ',0.11)'); g.addColorStop(1, 'rgba(' + col + ',0)');
        x.fillStyle = g; x.fillRect(px - s, py - s, s * 2, s * 2);
      }
      for (i = 0; i < 3200; i++) {
        px = (r() - 0.5) * 2800; py = gauss() * 100; s = r() * 1.2 + 0.3;
        x.fillStyle = 'rgba(255,255,255,' + (0.12 + r() * 0.5).toFixed(2) + ')';
        x.fillRect(px, py, s, s);
      }
      for (i = 0; i < 30; i++) {
        px = (r() - 0.5) * 2200; py = gauss() * 25; s = 40 + r() * 100;
        g = x.createRadialGradient(px, py, 0, px, py, s);
        g.addColorStop(0, 'rgba(3,4,10,0.4)'); g.addColorStop(1, 'rgba(3,4,10,0)');
        x.fillStyle = g; x.fillRect(px - s, py - s, s * 2, s * 2);
      }
      x.restore();
    }

    if (kind === 'aurora') {
      x.globalCompositeOperation = 'lighter';
      var bands = [
        { y: 260, a: 0.16, c: '60,255,170', ph: 0, h: 380 },
        { y: 330, a: 0.12, c: '40,210,200', ph: 2.1, h: 300 },
        { y: 200, a: 0.07, c: '170,90,255', ph: 4.2, h: 260 }
      ];
      for (var b = 0; b < bands.length; b++) {
        var B = bands[b];
        for (px = 0; px < W; px += 3) {
          var y0 = B.y + 110 * Math.sin(px / 340 + B.ph) + 35 * Math.sin(px / 95 + B.ph * 2);
          var h = B.h * (0.6 + 0.4 * Math.sin(px / 210 + B.ph));
          var a = B.a * (0.5 + 0.5 * Math.sin(px / 130 + B.ph * 3));
          g = x.createLinearGradient(0, y0, 0, y0 + h);
          g.addColorStop(0, 'rgba(' + B.c + ',0)');
          g.addColorStop(0.75, 'rgba(' + B.c + ',' + a.toFixed(3) + ')');
          g.addColorStop(1, 'rgba(' + B.c + ',0)');
          x.fillStyle = g; x.fillRect(px, y0, 3, h);
        }
      }
      x.globalCompositeOperation = 'source-over';
    }

    // Losse sterren
    for (i = 0; i < 1500; i++) {
      px = r() * W; py = Math.pow(r(), 1.3) * H * 0.85;
      var big = r() < 0.025;
      x.fillStyle = 'rgba(255,255,255,' + (big ? 0.95 : 0.2 + r() * 0.6).toFixed(2) + ')';
      if (big) { x.beginPath(); x.arc(px, py, 1.6, 0, 6.3); x.fill(); }
      else { s = r() * 1.3 + 0.3; x.fillRect(px, py, s, s); }
    }

    // Bergen: verre rij met een piek rechts, dichte voorgrond
    function ridge(base, amp, color, seed) {
      var rr = rng(seed), n1 = rr() * 6, n2 = rr() * 6;
      x.beginPath(); x.moveTo(0, H);
      for (var X = 0; X <= W; X += 6) {
        var peak = Math.exp(-Math.pow((X - 1380) / 300, 2)) * 1.6;
        var y = base - amp * (0.35 + peak + 0.18 * Math.sin(X / 160 + n1) + 0.08 * Math.sin(X / 37 + n2));
        x.lineTo(X, y);
      }
      x.lineTo(W, H); x.closePath();
      x.fillStyle = color; x.fill();
    }
    ridge(H * 0.86, 130, kind === 'aurora' ? '#06121a' : '#0b0b13', 3);
    ridge(H * 0.95, 60, '#030407', 9);
  }

  var shootTimer;
  function scheduleShootingStar() {
    clearTimeout(shootTimer);
    if (S.background === 'minimal') return;
    shootTimer = setTimeout(function () {
      var el = $('shooting');
      el.className = 'shooting';
      el.style.left = (900 + Math.random() * 800) + 'px';
      el.style.top = (60 + Math.random() * 260) + 'px';
      void el.offsetWidth;   // animatie opnieuw starten
      el.className = 'shooting go';
      scheduleShootingStar();
    }, 12000 + Math.random() * 25000);
  }

  /* ---------- Klok ---------- */
  function tick() {
    var d = new Date(), h = d.getHours(), t;
    if (S.clock24) t = pad(h) + ':' + pad(d.getMinutes());
    else t = (h % 12 || 12) + ':' + pad(d.getMinutes()) + '<small>' + (h < 12 ? 'AM' : 'PM') + '</small>';
    $('clock').innerHTML = t;
    var dn = DAYS[d.getDay()];
    $('date').innerHTML = dn.charAt(0).toUpperCase() + dn.slice(1) + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  setInterval(tick, 1000);

  /* ---------- Weer (Open-Meteo, geen API-key) ---------- */
  var WMO = {
    0: ['Helder', 'clear'], 1: ['Overwegend helder', 'clear'], 2: ['Half bewolkt', 'partly'],
    3: ['Bewolkt', 'cloudy'], 45: ['Mist', 'fog'], 48: ['Rijpmist', 'fog'],
    51: ['Motregen', 'drizzle'], 53: ['Motregen', 'drizzle'], 55: ['Motregen', 'drizzle'],
    56: ['IJzel', 'drizzle'], 57: ['IJzel', 'drizzle'],
    61: ['Lichte regen', 'rain'], 63: ['Regen', 'rain'], 65: ['Zware regen', 'rain'],
    66: ['IJzel', 'rain'], 67: ['IJzel', 'rain'],
    71: ['Lichte sneeuw', 'snow'], 73: ['Sneeuw', 'snow'], 75: ['Zware sneeuw', 'snow'], 77: ['Sneeuw', 'snow'],
    80: ['Buien', 'rain'], 81: ['Buien', 'rain'], 82: ['Zware buien', 'rain'],
    85: ['Sneeuwbuien', 'snow'], 86: ['Sneeuwbuien', 'snow'],
    95: ['Onweer', 'thunder'], 96: ['Onweer', 'thunder'], 99: ['Onweer', 'thunder']
  };
  var loc = null;
  function loadWeather() {
    if (!S.weather) return;
    var go = function (l) {
      loc = l;
      getJSON('https://api.open-meteo.com/v1/forecast?latitude=' + l.lat + '&longitude=' + l.lon +
        '&current=temperature_2m,weather_code,is_day&timezone=auto', function (j) {
        var w = WMO[j.current.weather_code] || ['', 'cloudy'];
        $('wIcon').innerHTML = CATALOG.weather[w[1]](!j.current.is_day);
        $('wTemp').innerHTML = Math.round(j.current.temperature_2m) + '°';
        $('wDesc').innerHTML = esc(w[0] + (l.name ? ' · ' + l.name : ''));
      });
    };
    if (S.location) return go(S.location);
    if (loc) return go(loc);
    getJSON('https://ipwho.is/?fields=city,latitude,longitude,success', function (j) {
      go(j.success !== false && j.latitude ? { name: j.city, lat: j.latitude, lon: j.longitude } : FALLBACK_LOCATION);
    }, function () { go(FALLBACK_LOCATION); });
  }
  setInterval(loadWeather, 15 * 60000);

  /* ---------- Geïnstalleerde apps ---------- */
  // null = onbekend (bijv. in een gewone browser): dan worden alle apps getoond.
  // De laatst bekende lijst wordt bewaard zodat de rij direct klopt bij opstarten.
  var installed = null;
  try { installed = JSON.parse(localStorage.getItem('tvdash.installed') || 'null'); } catch (e) { /* negeren */ }

  function setInstalled(list) {
    installed = list;
    try { localStorage.setItem('tvdash.installed', JSON.stringify(list)); } catch (e) { /* negeren */ }
    buildMain();
    if (settingsOpen) renderSettings();
  }

  // TizenBrew heeft geen application.info-recht, dus getAppsInfo faalt daar
  // meestal; dan vragen we de lijst op via de remote-API van de TV.
  function scanApps() {
    var viaRemote = function () {
      if (location.hostname !== '127.0.0.1') return;   // niet op de TV
      remote(function (s) {
        wsListeners['ed.installedApp.get'] = function (m) {
          var data = (m.data && (m.data.data || m.data)) || [], list = [];
          for (var i = 0; i < data.length; i++) {
            if (data[i].appId && data[i].name) list.push({ id: data[i].appId, name: data[i].name, type: data[i].app_type });
          }
          if (list.length) setInstalled(list);
        };
        s.send(JSON.stringify({ method: 'ms.channel.emit', params: { event: 'ed.installedApp.get', to: 'host' } }));
      }, true);
    };
    if (!hasTizen || !tizen.application || !tizen.application.getAppsInfo) return viaRemote();
    try {
      tizen.application.getAppsInfo(function (list) {
        var out = [];
        for (var i = 0; i < list.length; i++) {
          if (list[i].show && list[i].name) out.push({ id: list[i].id, name: list[i].name });
        }
        if (out.length) setInstalled(out); else viaRemote();
      }, viaRemote);
    } catch (e) { viaRemote(); }
  }

  // Geeft het app-id voor een catalogus-app, of null als hij niet op de TV staat.
  function resolveApp(key) {
    var a = CATALOG.apps[key];
    if (!installed) return a.ids[0] || 'unknown';
    var i, j;
    for (i = 0; i < installed.length; i++) if (a.match.test(installed[i].name)) return installed[i].id;
    for (j = 0; j < a.ids.length; j++)
      for (i = 0; i < installed.length; i++) if (installed[i].id === a.ids[j]) return a.ids[j];
    return null;
  }

  // Alle apps die in de rij kunnen staan: { key, name, id, bg, logo }
  function appInfo(key) {
    if (key.indexOf('x:') === 0) {
      var id = key.slice(2), nm = S.extra[id] || id, g = CATALOG.genericApp(nm);
      return { key: key, id: id, name: nm, bg: g.bg, logo: g.logo };
    }
    var a = CATALOG.apps[key];
    if (!a) return null;
    if (key === 'youtube' && S.youtubeVia === 'tizentube') {
      var tt = findTizenTube();
      if (tt) return { key: key, id: 'tb:' + tt.fullName, tb: tt, name: a.name, bg: a.bg, logo: a.logo };
    }
    return { key: key, id: resolveApp(key), name: a.name, bg: a.bg, logo: a.logo };
  }

  /* ---------- TizenBrew-modules (bijv. TizenTube) ----------
     Het dashboard draait in het TizenBrew-venster, dus we kunnen de
     TizenBrew-service (ws://127.0.0.1:8081) vragen een module te starten,
     precies zoals het TizenBrew-startscherm dat doet. */
  var TB = { GetModules: 4, LaunchModule: 5 };
  var tbModules = null;

  function loadTbModules() {
    if (location.hostname !== '127.0.0.1') return;
    var s;
    try { s = new WebSocket('ws://127.0.0.1:8081'); } catch (e) { return; }
    var ask = function () { s.send(JSON.stringify({ type: TB.GetModules, payload: false })); };
    s.onopen = ask;
    s.onmessage = function (ev) {
      var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.type !== TB.GetModules) return;
      if (!m.payload) return setTimeout(ask, 500);   // service nog bezig met laden
      tbModules = m.payload;
      s.close();
      buildMain();
      if (settingsOpen) renderSettings();
    };
  }

  function findTizenTube() {
    for (var i = 0; tbModules && i < tbModules.length; i++) {
      if (/tizentube/i.test(tbModules[i].fullName || '') || /tizentube/i.test(tbModules[i].appName || '')) return tbModules[i];
    }
    return null;
  }

  function launchTbModule(mod) {
    toast(mod.appName + ' starten…');
    try {
      for (var k = 0; k < (mod.keys || []).length; k++) tizen.tvinputdevice.registerKey(mod.keys[k]);
    } catch (e) { /* al geregistreerd */ }
    var s;
    try { s = new WebSocket('ws://127.0.0.1:8081'); } catch (e) { return toast('TizenBrew niet bereikbaar'); }
    s.onopen = function () {
      s.send(JSON.stringify({ type: TB.LaunchModule, payload: mod }));
      saveSettings();
      if (!mod.evaluateScriptOnDocumentStart) setTimeout(function () { location.href = mod.appPath; }, 150);
    };
    s.onerror = function () { toast('TizenBrew niet bereikbaar'); };
  }

  /* ---------- Hoofdscherm ---------- */
  var rows = [];            // [{ id:'apps'|'src', items:[...] }]
  var focus = { row: 0, i: 0, gear: false };

  function buildMain() {
    var i, html, list;

    // Apps
    list = [];
    for (i = 0; i < S.apps.length; i++) {
      var a = appInfo(S.apps[i]);
      if (a && a.id) list.push(a);
    }
    html = '';
    for (i = 0; i < list.length; i++) {
      html += '<div class="app"><div class="face" style="background:' + list[i].bg + '">' + list[i].logo +
        '</div><div class="name">' + esc(list[i].name) + '</div></div>';
    }
    $('apps').innerHTML = html;
    $('appsRow').style.display = list.length ? '' : 'none';
    var appItems = list;

    // Bronnen
    list = [];
    if (S.tvTile) list.push({ dev: CATALOG.tvDevice, key: 'KEY_TV', port: 'Antenne / kabel' });
    for (var p = 1; p <= 4; p++) {
      var t = S.hdmi[p];
      if (t && t !== 'none' && CATALOG.devices[t]) list.push({ dev: CATALOG.devices[t], key: 'KEY_HDMI' + p, port: 'HDMI ' + p });
    }
    html = '';
    for (i = 0; i < list.length; i++) {
      var d = list[i].dev;
      html += '<div class="src" style="background:' + d.bg + '"><div class="in"><div class="ic">' + CATALOG.devIcons[d.icon] +
        '</div><div class="tx"><div class="nm">' + esc(d.name) + '</div><div class="port"><i style="background:' + d.dot +
        '"></i>' + list[i].port + '</div></div></div></div>';
    }
    $('sources').innerHTML = html;
    $('srcRow').style.display = list.length ? '' : 'none';

    rows = [];
    if (appItems.length) rows.push({ id: 'apps', el: $('apps'), items: appItems, cls: 'app' });
    if (list.length) rows.push({ id: 'src', el: $('sources'), items: list, cls: 'src' });

    $('weather').className = S.weather ? 'weather' : 'weather off';
    if (focus.row >= rows.length) focus.row = Math.max(0, rows.length - 1);
    if (!rows.length) focus.gear = true;
    paintFocus();
  }

  function paintFocus() {
    $('gear').className = focus.gear ? 'gear focus' : 'gear';
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r], kids = row.el.children;
      if (focus.row === r) focus.i = Math.max(0, Math.min(row.items.length - 1, focus.i));
      for (var k = 0; k < kids.length; k++) {
        kids[k].className = row.cls + (!focus.gear && focus.row === r && focus.i === k ? ' focus' : '');
      }
      // Rij laten meeschuiven zodat de focus zichtbaar blijft
      var idx = focus.row === r ? focus.i : 0;
      var tile = kids[idx], shift = 0;
      if (tile) {
        var right = tile.offsetLeft + tile.offsetWidth, view = 1920 - 116 * 2;
        if (right > view) shift = right - view + 40;
      }
      var tf = 'translateX(' + (-shift) + 'px)';
      row.el.style.transform = tf; row.el.style.webkitTransform = tf;
    }
  }

  function activate() {
    if (focus.gear) return openSettings();
    var row = rows[focus.row];
    if (!row) return;
    var it = row.items[focus.i];
    if (row.id === 'apps') launchApp(it);
    else sendKey(it.key, it.dev.name);
  }

  /* ---------- TV aansturen ----------
     Bronwissel via de Samsung remote-API op de TV zelf (poort 8001/8002). De
     eerste keer vraagt de TV om toestemming; het token wordt daarna bewaard. */
  var ws = null, wsReady = false, wsQueue = [], wsListeners = {}, wsLoud = false;
  // quiet: geen melding als de verbinding mislukt (voor achtergrondtaken)
  function remote(cb, quiet) {
    if (ws && wsReady) return cb(ws);
    wsQueue.push(cb);
    if (!quiet) wsLoud = true;
    if (ws) return;
    var name = btoa('TV Dashboard'), token = null;
    try { token = localStorage.getItem('tvdash.token'); } catch (e) { /* negeren */ }
    var urls = [
      'ws://127.0.0.1:8001/api/v2/channels/samsung.remote.control?name=' + name,
      'wss://127.0.0.1:8002/api/v2/channels/samsung.remote.control?name=' + name + (token ? '&token=' + token : '')
    ];
    connect(0);

    function connect(n) {
      if (n >= urls.length) {
        if (wsLoud) toast('Geen verbinding met de TV-remote-API');
        ws = null; wsQueue = []; wsLoud = false;
        return;
      }
      var sock, opened = false;
      try { sock = new WebSocket(urls[n]); } catch (e) { return connect(n + 1); }
      ws = sock;
      sock.onmessage = function (ev) {
        var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.event === 'ms.channel.connect') {
          opened = true; wsReady = true; wsLoud = false;
          if (m.data && m.data.token) { try { localStorage.setItem('tvdash.token', m.data.token); } catch (e) { /* negeren */ } }
          var q = wsQueue; wsQueue = [];
          for (var i = 0; i < q.length; i++) q[i](sock);
        } else if (m.event === 'ms.channel.unauthorized') {
          toast('Kies "Toestaan" in de pop-up op de TV');
        } else if (wsListeners[m.event]) {
          wsListeners[m.event](m);
        }
      };
      sock.onclose = sock.onerror = function () {
        if (!opened) { if (ws === sock) connect(n + 1); }
        else if (ws === sock) { ws = null; wsReady = false; }
      };
    }
  }

  function sendKey(key, label) {
    toast('Naar ' + label + '…');
    remote(function (s) {
      s.send(JSON.stringify({ method: 'ms.remote.control',
        params: { Cmd: 'Click', DataOfCmd: key, Option: 'false', TypeOfRemote: 'SendRemoteKey' } }));
    });
  }

  function launchApp(a) {
    if (a.tb) return launchTbModule(a.tb);
    toast(a.name + ' starten…');
    var viaRemote = function () {
      var type = 2;
      for (var i = 0; installed && i < installed.length; i++) if (installed[i].id === a.id && installed[i].type) type = installed[i].type;
      remote(function (s) {
        s.send(JSON.stringify({ method: 'ms.channel.emit',
          params: { event: 'ed.apps.launch', to: 'host',
            data: { appId: a.id, action_type: type === 4 ? 'NATIVE_LAUNCH' : 'DEEP_LINK' } } }));
      });
    };
    try {
      if (hasTizen && tizen.application) { tizen.application.launch(a.id, null, viaRemote); return; }
    } catch (e) { /* valt terug op de remote-API */ }
    viaRemote();
  }

  /* ---------- Instellingenmenu ---------- */
  var BGS = [['stars', 'Sterrenhemel'], ['aurora', 'Noorderlicht'], ['minimal', 'Minimaal']];
  var items = [], sIdx = 0, settingsOpen = false, resetArmed = false;

  function cycle(list, cur, dir) {
    var i = 0;
    for (var k = 0; k < list.length; k++) if (list[k] === cur) i = k;
    return list[(i + dir + list.length) % list.length];
  }

  function buildItems() {
    items = [];
    var sec = function (t) { items.push({ type: 'sec', label: t }); };
    var info = function (h) { items.push({ type: 'info', html: h }); };

    sec('Weergave');
    var bgName = ''; for (var b = 0; b < BGS.length; b++) if (BGS[b][0] === S.background) bgName = BGS[b][1];
    items.push({ type: 'cycle', label: 'Achtergrond', value: bgName, change: function (d) {
      var keys = []; for (var i = 0; i < BGS.length; i++) keys.push(BGS[i][0]);
      S.background = cycle(keys, S.background, d); drawSky(S.background); scheduleShootingStar();
    } });
    items.push({ type: 'cycle', label: 'Klok', value: S.clock24 ? '24-uurs' : '12-uurs', change: function () {
      S.clock24 = !S.clock24; tick();
    } });
    items.push({ type: 'toggle', label: 'Weer tonen', on: S.weather, toggle: function () {
      S.weather = !S.weather; loadWeather();
    } });

    sec('Apps');
    var tt = findTizenTube();
    items.push({ type: 'cycle', label: 'YouTube openen met',
      sub: tbModules && !tt ? 'TizenTube niet gevonden in TizenBrew' : '',
      value: S.youtubeVia === 'tizentube' ? 'TizenTube' : 'YouTube-app',
      change: function () { S.youtubeVia = S.youtubeVia === 'tizentube' ? 'app' : 'tizentube'; } });
    info((installed ? '<b>' + installed.length + ' apps</b> gevonden op deze TV. '
      : 'Geïnstalleerde apps nog niet opgehaald; alle apps worden getoond. ') +
      'OK zet een app aan of uit, ◀ ▶ verplaatst hem in de rij.');
    items.push({ type: 'action', label: 'Apps op deze TV opnieuw zoeken', run: function () {
      toast('Apps zoeken…'); scanApps();
    } });
    var keys = S.apps.slice(), k, i;
    for (k = 0; k < CATALOG.appOrder.length; k++) if (keys.indexOf(CATALOG.appOrder[k]) < 0) keys.push(CATALOG.appOrder[k]);
    if (installed) {
      // Overige apps op deze TV die niet in de catalogus staan
      for (i = 0; i < installed.length; i++) {
        var known = false;
        for (k = 0; k < CATALOG.appOrder.length; k++) {
          if (resolveApp(CATALOG.appOrder[k]) === installed[i].id) { known = true; break; }
        }
        if (!known && installed[i].id.indexOf('tizenbrew') < 0 && keys.indexOf('x:' + installed[i].id) < 0) {
          keys.push('x:' + installed[i].id);
          if (!S.extra[installed[i].id]) S.extra[installed[i].id] = installed[i].name;
        }
      }
    }
    for (k = 0; k < keys.length; k++) {
      (function (key) {
        var a = appInfo(key);
        if (!a) return;
        var on = S.apps.indexOf(key) >= 0;
        var missing = installed && !a.id;
        items.push({ type: 'toggle', label: a.name, sub: missing ? 'Niet gevonden op deze TV' : '', on: on,
          toggle: function () {
            var p = S.apps.indexOf(key);
            if (p >= 0) S.apps.splice(p, 1); else S.apps.push(key);
          },
          change: on ? function (d) {
            var p = S.apps.indexOf(key), q = p + d;
            if (q < 0 || q >= S.apps.length) return;
            S.apps.splice(p, 1); S.apps.splice(q, 0, key);
            sIdx += d;
          } : null
        });
      })(keys[k]);
    }

    sec('Bronnen');
    items.push({ type: 'toggle', label: 'TV (antenne / kabel)', on: S.tvTile, toggle: function () { S.tvTile = !S.tvTile; } });
    for (var p = 1; p <= 4; p++) {
      (function (port) {
        var t = S.hdmi[port] || 'none';
        items.push({ type: 'cycle', label: 'HDMI ' + port, value: CATALOG.devices[t].name, change: function (d) {
          S.hdmi[port] = cycle(CATALOG.deviceOrder, S.hdmi[port] || 'none', d);
        } });
      })(p);
    }

    sec('Automatisch starten');
    info('<b>1.</b> TizenBrew → Module Manager → kies TV Dashboard → <b>Autolaunch</b>.<br>' +
      '<b>2.</b> TV-instellingen → Algemeen → Smart-functies → <b>Laatste app automatisch starten</b> aan, ' +
      'en open TizenBrew vóór je de TV uitzet.');

    sec('Overig');
    items.push({ type: 'action', label: 'Terug naar TizenBrew', run: exitToTizenBrew });
    items.push({ type: 'action', label: resetArmed ? 'Nogmaals OK om te herstellen' : 'Standaardinstellingen herstellen',
      run: function () {
        if (!resetArmed) { resetArmed = true; return; }
        resetArmed = false;
        S = clone(DEFAULTS); S.extra = {};
        drawSky(S.background); tick(); loadWeather(); scheduleShootingStar();
        toast('Standaardinstellingen hersteld');
      } });
  }

  function focusable(i) { return items[i] && items[i].type !== 'sec' && items[i].type !== 'info'; }

  function renderSettings() {
    buildItems();
    if (!focusable(sIdx)) { for (var f = 0; f < items.length; f++) if (focusable(f)) { sIdx = f; break; } }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i], cls = 'pitem' + (i === sIdx ? ' focus' : '');
      if (it.type === 'sec') html += '<div class="psec">' + esc(it.label) + '</div>';
      else if (it.type === 'info') html += '<div class="pinfo">' + it.html + '</div>';
      else {
        var val = '';
        if (it.type === 'cycle') val = '<span class="arr">◀</span>' + esc(it.value) + '<span class="arr">▶</span>';
        else if (it.type === 'toggle') val = (it.change ? '<span class="arr">◀▶</span>' : '') + '<span class="sw' + (it.on ? ' on' : '') + '"></span>';
        html += '<div class="' + cls + '" data-i="' + i + '"><div class="pl">' + esc(it.label) +
          (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</div><div class="pv">' + val + '</div></div>';
      }
    }
    var inner = $('pinner');
    inner.innerHTML = html;

    // Lijst schuiven zodat het gefocuste item in beeld blijft
    var el = inner.querySelector('.focus'), viewH = $('plist').offsetHeight;
    var off = el ? Math.max(0, el.offsetTop - viewH * 0.4) : 0;
    off = Math.min(off, Math.max(0, inner.scrollHeight - viewH + 20));
    inner.style.transform = 'translateY(' + (-off) + 'px)';
    inner.style.webkitTransform = 'translateY(' + (-off) + 'px)';
  }

  function openSettings() {
    settingsOpen = true; resetArmed = false;
    $('overlay').className = 'overlay open';
    renderSettings();
  }
  function closeSettings() {
    settingsOpen = false;
    $('overlay').className = 'overlay';
    saveSettings();
    buildMain();
  }

  function settingsKey(code) {
    var it = items[sIdx], n;
    if (code !== 13) resetArmed = false;
    switch (code) {
      case 38: n = sIdx - 1; while (n >= 0 && !focusable(n)) n--; if (n >= 0) sIdx = n; break;
      case 40: n = sIdx + 1; while (n < items.length && !focusable(n)) n++; if (n < items.length) sIdx = n; break;
      case 37: if (it && it.change) it.change(-1); break;
      case 39: if (it && it.change) it.change(1); break;
      case 13:
        if (it.type === 'toggle') it.toggle();
        else if (it.type === 'cycle') it.change(1);
        else if (it.type === 'action') it.run();
        break;
      case 10009: case 27: case 8: case 405: closeSettings(); return;
      default: return false;
    }
    saveSettings();
    renderSettings();
  }

  /* ---------- Terug naar TizenBrew ----------
     TizenBrew opent de module in hetzelfde venster, dus terug in de geschiedenis
     is het TizenBrew-menu. Bij autolaunch is er geen geschiedenis: dan de app sluiten. */
  var backArmed = false;
  function exitToTizenBrew() {
    saveSettings();
    if (history.length > 1) {
      history.back();
      setTimeout(closeApp, 1500);   // nog hier? dan was er niets om naar terug te gaan
    } else closeApp();
  }
  function closeApp() {
    try { tizen.application.getCurrentApplication().exit(); } catch (e) { /* niet op Tizen */ }
  }

  /* ---------- Afstandsbediening ---------- */
  try {
    var extra = ['ColorF2Yellow', 'ColorF0Red'];
    for (var r = 0; r < extra.length; r++) tizen.tvinputdevice.registerKey(extra[r]);
  } catch (e) { /* niet op Tizen of al geregistreerd */ }

  document.addEventListener('keydown', function (e) {
    var code = e.keyCode;
    if (settingsOpen) {
      if (settingsKey(code) !== false) e.preventDefault();
      return;
    }
    switch (code) {
      case 37: if (!focus.gear) focus.i--; break;
      case 39: if (!focus.gear) focus.i++; break;
      case 38:
        if (focus.gear) break;
        if (focus.row === 0) focus.gear = true;
        else { focus.row--; focus.i = 0; }
        break;
      case 40:
        if (focus.gear) { if (rows.length) focus.gear = false; }
        else if (focus.row < rows.length - 1) { focus.row++; focus.i = 0; }
        break;
      case 13: activate(); return e.preventDefault();
      case 405: openSettings(); return e.preventDefault();          // geel
      case 403: loadWeather(); toast('Vernieuwen…'); return e.preventDefault(); // rood
      case 10009: case 27:                                         // terug: 2x snel = naar TizenBrew
        if (backArmed) { exitToTizenBrew(); }
        else {
          backArmed = true; toast('Druk nogmaals op Terug om naar TizenBrew te gaan');
          setTimeout(function () { backArmed = false; }, 2500);
        }
        return e.preventDefault();
      default: return;
    }
    if (focus.i < 0) focus.i = 0;
    paintFocus();
    e.preventDefault();
  });

  // Muis/pointer (handig bij testen in de browser)
  $('gear').addEventListener('click', openSettings);
  $('overlay').addEventListener('click', function (e) {
    if (e.target === $('overlay')) closeSettings();
    var p = e.target; while (p && p.getAttribute && !p.getAttribute('data-i')) p = p.parentNode;
    if (p && p.getAttribute) { sIdx = +p.getAttribute('data-i'); settingsKey(13); }
  });
  function bindTiles(stripId, rowId) {
    $(stripId).addEventListener('click', function (e) {
      var p = e.target; while (p && p.parentNode !== $(stripId)) p = p.parentNode;
      if (!p) return;
      for (var r = 0; r < rows.length; r++) if (rows[r].id === rowId) focus.row = r;
      focus.gear = false;
      focus.i = Array.prototype.indexOf.call($(stripId).children, p);
      paintFocus(); activate();
    });
  }
  bindTiles('apps', 'apps');
  bindTiles('sources', 'src');

  /* ---------- Start ---------- */
  $('gear').innerHTML = CATALOG.gear;
  drawSky(S.background);
  scheduleShootingStar();
  tick();
  loadWeather();
  buildMain();
  scanApps();
  loadTbModules();
})();
