// Apps, apparaten en iconen. Inline SVG/tekst-logo's: TV-fonts tonen geen emoji.
var CATALOG = (function () {
  function svg(body, vb) {
    return '<svg viewBox="' + (vb || '0 0 64 64') + '" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }
  function word(text, style) { return '<span class="wordmark" style="' + (style || '') + '">' + text + '</span>'; }

  /* ---------- Apps ----------
     match: regex op de app-naam zoals de TV die meldt (gebruikt om het echte
     app-id te vinden); ids: bekende app-id's als terugval. */
  var apps = {
    youtube: { name: 'YouTube', match: /^youtube$/i, ids: ['111299001912'], bg: '#e62117',
      logo: svg('<rect x="6" y="14" width="52" height="36" rx="10" fill="#fff"/><path d="M27 23v18l15-9z" fill="#e62117"/>') },
    spotify: { name: 'Spotify', match: /spotify/i, ids: ['3201606009684'], bg: '#151515',
      logo: svg('<circle cx="32" cy="32" r="24" fill="#1ed760"/><g stroke="#000" stroke-width="4.5"><path d="M18 25c9-3 20-2 28 2.5"/><path d="M20 33c7.5-2 15.5-1.5 22 2"/></g><path d="M22 40.5c5.5-1.4 11-1 15 1.4" stroke="#000" stroke-width="4"/>') },
    netflix: { name: 'Netflix', match: /netflix/i, ids: ['3201907018807', '11101200001'], bg: '#141414',
      logo: svg('<path d="M20 6h9.5l6.5 25V6h8.5v52c-3 0-6 .3-8.8.8L28 33.5v25.3c-2.9.4-5.6.8-8 1.2z" fill="#e50914"/>') },
    prime: { name: 'Prime Video', match: /prime video|amazon/i, ids: ['3201910019365', 'org.tizen.ignition', '3201512006785'],
      bg: 'linear-gradient(135deg,#0f79af,#1aa8e8)', logo: word('prime video', 'font-size:40px;font-weight:700;letter-spacing:-1px') },
    disney: { name: 'Disney+', match: /disney/i, ids: ['3201901017640'], bg: 'linear-gradient(135deg,#071a4a,#1b4aa6)',
      logo: word('Disney+', 'font-size:48px;font-weight:600;font-style:italic') },
    twitch: { name: 'Twitch', match: /twitch/i, ids: [], bg: '#9146ff',
      logo: svg('<path d="M14 8h40v28L42 48h-9l-7 7v-7H16V18z" fill="#fff"/><path d="M20 14v29h9v6l6-6h8l7-7V14z" fill="#9146ff"/><path d="M30 22v10M40 22v10" stroke="#fff" stroke-width="4.5" stroke-linecap="butt"/>') },
    plex: { name: 'Plex', match: /^plex/i, ids: ['3201512006963'], bg: '#1f2326',
      logo: word('plex<b style="color:#e5a00d">›</b>', 'font-size:52px;font-weight:700') },
    appletv: { name: 'Apple TV', match: /apple tv/i, ids: ['3201807016597'], bg: '#0b0b0c',
      logo: word('Apple TV', 'font-size:42px;font-weight:600') },
    max: { name: 'Max', match: /^(hbo )?max$/i, ids: [], bg: 'linear-gradient(135deg,#0019a3,#002be7)',
      logo: word('max', 'font-size:58px;font-weight:800;letter-spacing:-2px') },
    npo: { name: 'NPO Start', match: /npo/i, ids: [], bg: '#ff6d00',
      logo: word('NPO Start', 'font-size:42px;font-weight:800') },
    videoland: { name: 'Videoland', match: /videoland/i, ids: [], bg: 'linear-gradient(135deg,#2a0a12,#c8102e)',
      logo: word('videoland', 'font-size:42px;font-weight:700') },
    ziggo: { name: 'Ziggo GO', match: /ziggo/i, ids: [], bg: '#f48c00',
      logo: word('Ziggo GO', 'font-size:42px;font-weight:800') },
    kpn: { name: 'KPN TV', match: /kpn/i, ids: [], bg: '#00a300',
      logo: word('KPN TV', 'font-size:46px;font-weight:800') },
    viaplay: { name: 'Viaplay', match: /viaplay/i, ids: [], bg: 'linear-gradient(135deg,#1a0633,#5b1a8f)',
      logo: word('viaplay', 'font-size:44px;font-weight:700') },
    dazn: { name: 'DAZN', match: /dazn/i, ids: [], bg: '#0c161c',
      logo: word('DAZN', 'font-size:50px;font-weight:900;color:#f7ff1a') }
  };
  var appOrder = ['youtube', 'spotify', 'netflix', 'prime', 'disney', 'twitch', 'plex', 'appletv', 'max',
    'npo', 'videoland', 'ziggo', 'kpn', 'viaplay', 'dazn'];

  // Tegel voor een app die niet in de catalogus staat
  function genericApp(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return {
      name: name,
      bg: 'linear-gradient(135deg,hsl(' + h + ',45%,22%),hsl(' + ((h + 40) % 360) + ',55%,38%))',
      logo: word(name.length > 12 ? name.charAt(0).toUpperCase() : name, 'font-size:' + (name.length > 12 ? 64 : 40) + 'px;font-weight:700')
    };
  }

  /* ---------- Apparaten op HDMI ---------- */
  var W = 'stroke="#fff" stroke-width="4"';
  var devIcons = {
    switch: svg('<rect x="10" y="10" width="20" height="44" rx="10" fill="#fff"/><rect x="34" y="10" width="20" height="44" rx="10" ' + W + '/><circle cx="20" cy="24" r="4" fill="#e60012"/><circle cx="44" cy="38" r="4" fill="#fff"/>'),
    ps: svg('<path d="M18 22h28c6 0 10 4 11 10l2 12c1 5-5 8-9 4l-6-6H20l-6 6c-4 4-10 1-9-4l2-12c1-6 5-10 11-10z" fill="#fff"/><g fill="#0050b5"><circle cx="44" cy="30" r="2.6"/><circle cx="49" cy="35" r="2.6"/><path d="M17 31h10M22 26v10" stroke="#0050b5" stroke-width="3.5"/></g>'),
    xbox: svg('<circle cx="32" cy="32" r="23" fill="#fff"/><path d="M19 17c6 3 10 8 13 12 3-4 7-9 13-12M16 46c5-8 11-14 16-17 5 3 11 9 16 17" stroke="#107c10" stroke-width="5"/>'),
    pc: svg('<rect x="8" y="12" width="48" height="30" rx="4" ' + W + '/><path d="M24 52h16M32 42v10" ' + W + '/>'),
    tvbox: svg('<rect x="10" y="22" width="44" height="22" rx="6" ' + W + '/><circle cx="46" cy="33" r="2.5" fill="#fff"/>'),
    play: svg('<rect x="8" y="12" width="48" height="40" rx="10" ' + W + '/><path d="M27 23v18l14-9z" fill="#fff"/>'),
    decoder: svg('<rect x="8" y="28" width="48" height="20" rx="4" ' + W + '/><path d="M24 28l-8-14M40 28l8-14" ' + W + '/><circle cx="46" cy="38" r="2.5" fill="#fff"/>'),
    hdmi: svg('<path d="M10 22h44v10l-6 8H16l-6-8z" ' + W + '/><path d="M20 30h24" stroke="#fff" stroke-width="3"/>'),
    tv: svg('<rect x="8" y="12" width="48" height="32" rx="5" ' + W + '/><path d="M22 54h20" ' + W + '/>')
  };
  var red = 'linear-gradient(120deg,#c8101a,#ff3a3a)', blue = 'linear-gradient(120deg,#00317c,#0a73d9)',
    green = 'linear-gradient(120deg,#0b5e0b,#24a524)', slate = 'linear-gradient(120deg,#2a2f3b,#4a5266)';
  var devices = {
    none: { name: 'Niet gebruikt' },
    switch2: { name: 'Nintendo Switch 2', bg: red, icon: 'switch', dot: '#ff8a8a' },
    switch: { name: 'Nintendo Switch', bg: red, icon: 'switch', dot: '#ff8a8a' },
    ps5: { name: 'PlayStation 5', bg: blue, icon: 'ps', dot: '#5fe08a' },
    ps4: { name: 'PlayStation 4', bg: blue, icon: 'ps', dot: '#5fe08a' },
    xsx: { name: 'Xbox Series X', bg: green, icon: 'xbox', dot: '#a6ff8a' },
    xss: { name: 'Xbox Series S', bg: green, icon: 'xbox', dot: '#a6ff8a' },
    xone: { name: 'Xbox One', bg: green, icon: 'xbox', dot: '#a6ff8a' },
    pc: { name: 'PC', bg: slate, icon: 'pc', dot: '#9fb4ff' },
    appletv: { name: 'Apple TV', bg: 'linear-gradient(120deg,#151517,#3a3a3e)', icon: 'tvbox', dot: '#cfcfd4' },
    media: { name: 'Mediaspeler', bg: 'linear-gradient(120deg,#05505a,#0d8f98)', icon: 'play', dot: '#7ff3f0' },
    decoder: { name: 'TV-decoder', bg: 'linear-gradient(120deg,#8a3b00,#e57a12)', icon: 'decoder', dot: '#ffd29a' },
    generic: { name: 'HDMI-apparaat', bg: slate, icon: 'hdmi', dot: '#9fb4ff' }
  };
  var deviceOrder = ['none', 'switch2', 'switch', 'ps5', 'ps4', 'xsx', 'xss', 'xone', 'pc', 'appletv', 'media', 'decoder', 'generic'];
  var tvDevice = { name: 'TV', bg: 'linear-gradient(120deg,#1b2440,#34477a)', icon: 'tv', dot: '#9fb4ff' };

  /* ---------- Overige iconen ---------- */
  var gear = svg('<circle cx="32" cy="32" r="8" stroke="currentColor" stroke-width="4"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M13.6 50.4l5.7-5.7M44.7 19.3l5.7-5.7" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="32" r="17" stroke="currentColor" stroke-width="4"/>');

  var sunCore = '<circle cx="32" cy="32" r="11" fill="#FFC94D"/><g stroke="#FFC94D" stroke-width="3.5"><path d="M32 8v6M32 50v6M8 32h6M50 32h6M15 15l4.2 4.2M44.8 44.8L49 49M15 49l4.2-4.2M44.8 19.2L49 15"/></g>';
  var moon = '<path d="M40 12a20 20 0 1 0 12 30A16 16 0 0 1 40 12z" fill="#C9D4FF"/>';
  var cloudPath = 'M20 48h26a10 10 0 0 0 0-20 14 14 0 0 0-27-2A11 11 0 0 0 20 48z';
  var cloud = '<path d="' + cloudPath + '" fill="#DDE4F2"/>', darkCloud = '<path d="' + cloudPath + '" fill="#9AA6BF"/>';
  var weather = {
    clear: function (n) { return svg(n ? moon : sunCore); },
    partly: function (n) { return svg((n ? '<g transform="translate(-6,-8) scale(.7)">' + moon + '</g>' : '<g transform="translate(-8,-10) scale(.75)">' + sunCore + '</g>') + cloud); },
    cloudy: function () { return svg(cloud); },
    fog: function () { return svg('<g stroke="#C3CCDD" stroke-width="3.5"><path d="M12 26h40M8 34h44M14 42h38M18 50h30"/></g>'); },
    drizzle: function () { return svg(cloud + '<g stroke="#6FA8FF" stroke-width="3"><path d="M26 53l-1.5 4M38 53l-1.5 4"/></g>'); },
    rain: function () { return svg(darkCloud + '<g stroke="#6FA8FF" stroke-width="3.5"><path d="M24 52l-3 7M34 52l-3 7M44 52l-3 7"/></g>'); },
    snow: function () { return svg(cloud + '<g fill="#fff"><circle cx="23" cy="56" r="2.6"/><circle cx="33" cy="59" r="2.6"/><circle cx="43" cy="56" r="2.6"/></g>'); },
    thunder: function () { return svg(darkCloud + '<path d="M34 46l-6 10h7l-4 8 10-12h-7l4-6z" fill="#FFD84D"/>'); }
  };

  return {
    apps: apps, appOrder: appOrder, genericApp: genericApp,
    devices: devices, deviceOrder: deviceOrder, devIcons: devIcons, tvDevice: tvDevice,
    gear: gear, weather: weather
  };
})();
