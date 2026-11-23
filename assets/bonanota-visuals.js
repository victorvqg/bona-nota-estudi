/* ============================================================================
   BonaNotaVisuals · Motor compartit de laboratoris visuals interactius
   Arquitectura HTML/CSS/JS pur · Sense frameworks ni dependències externes
   Suport: aïllament per alumne (uid), auto-alçada, modal i premi únic (+10 ⭐)
   ============================================================================ */
(function (global) {
  'use strict';

  const DEFAULT_COLORS = {
    bg1: '#fff7ed',
    bg2: '#ffedd5',
    border: '#fb923c',
    hover: '#ea580c',
    shadow: 'rgba(234, 88, 12, 0.17)',
    iconBg: '#fed7aa',
    title: '#7c2d12',
    sub: '#9a3412',
    badgeBorder: '#fdba74',
    badgeText: '#c2410c',
    headerBg: 'linear-gradient(120deg,#1c1917,#dc2626 60%,#ea580c)'
  };

  let CFG = null;
  let initialized = false;
  let listenersBound = false;
  let currentModalUrl = '';
  let prevBodyOverflow = '';
  let prevFocusEl = null;
  let pendingHeaderCelebration = null;
  const rewardInFlight = Object.create(null);

  function sanitizeUid(raw) {
    if (raw == null) return 'anon';
    const clean = String(raw)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
    return clean || 'anon';
  }

  function resolveUid() {
    if (CFG && typeof CFG.getUserId === 'function') {
      try {
        const res = CFG.getUserId();
        if (res) return sanitizeUid(res);
      } catch (e) {}
    }
    try {
      const fromUrl = new URLSearchParams(global.location.search).get('uid');
      if (fromUrl) return sanitizeUid(fromUrl);
    } catch (e) {}
    return 'anon';
  }

  function storageVisualKey(uid, world) {
    return 'bonanota_visual_' + uid + '_' + world;
  }

  function storageRewardKey(uid, world) {
    return 'bonanota_visual_reward_' + uid + '_' + world;
  }

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildUrl(fitxaNum) {
    if (!CFG) return '';
    const uid = resolveUid();
    const sep = CFG.src.indexOf('?') === -1 ? '?' : '&';
    const params = ['embed=1'];
    const n = Number(fitxaNum);
    if (Number.isInteger(n) && n >= 1 && n <= CFG.total) {
      params.push('fitxa=' + n);
    }
    params.push('world=' + encodeURIComponent(CFG.world));
    params.push('uid=' + encodeURIComponent(uid));
    return CFG.src + sep + params.join('&');
  }

  function isRewardClaimedInProfile(world) {
    if (CFG && typeof CFG.getProfileState === 'function') {
      try {
        const prof = CFG.getProfileState();
        if (prof && prof.visuals && prof.visuals[world] && prof.visuals[world].rewardClaimed === true) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  function isRewardClaimed(uid, world) {
    if (isRewardClaimedInProfile(world)) return true;
    try {
      const raw = localStorage.getItem(storageRewardKey(uid, world));
      if (!raw) return false;
      if (raw === '1' || raw === 'true') return true;
      const parsed = JSON.parse(raw);
      return !!(parsed && parsed.rewardClaimed === true);
    } catch (e) {
      return false;
    }
  }

  function markRewardClaimedLocal(uid, world, stars) {
    try {
      localStorage.setItem(
        storageRewardKey(uid, world),
        JSON.stringify({
          rewardClaimed: true,
          uid: uid,
          world: world,
          stars: stars,
          claimedAt: Date.now()
        })
      );
    } catch (e) {}
  }

  function parseCountFromRaw(raw) {
    if (!raw) return 0;
    try {
      const d = JSON.parse(raw);
      if (Array.isArray(d)) return d.length;
      if (d && typeof d === 'object') {
        if (Array.isArray(d.completed)) return d.completed.length;
        if (typeof d.explored === 'number') return d.explored;
        if (Array.isArray(d.fitxes)) return d.fitxes.length;
        if (Array.isArray(d.explored)) return d.explored.length;
      }
    } catch (e) {}
    return 0;
  }

  function readState() {
    if (!CFG) return { explored: 0, total: 6, completed: false, rewardClaimed: false, uid: 'anon' };
    const total = CFG.total || 6;
    const uid = resolveUid();
    let bestCount = 0;

    try {
      bestCount = Math.max(bestCount, parseCountFromRaw(localStorage.getItem(storageVisualKey(uid, CFG.world))));
    } catch (e) {}

    // Retrocompatibilitat estrictament limitada a uid === 'anon'
    if (uid === 'anon') {
      try {
        bestCount = Math.max(bestCount, parseCountFromRaw(localStorage.getItem('bonanota_visual_' + CFG.world)));
        bestCount = Math.max(bestCount, parseCountFromRaw(localStorage.getItem('bonanota_prova_visual_' + CFG.world + '_estat')));
        if (CFG.legacyFitxesKey) {
          bestCount = Math.max(bestCount, parseCountFromRaw(localStorage.getItem(CFG.legacyFitxesKey)));
        }
      } catch (e) {}
    }

    const explored = Math.max(0, Math.min(total, bestCount));
    const rewardClaimed = isRewardClaimed(uid, CFG.world);
    return {
      uid: uid,
      explored: explored,
      total: total,
      completed: explored >= total,
      rewardClaimed: rewardClaimed
    };
  }

  function badgeText(st) {
    const total = st.total || (CFG ? CFG.total : 6);
    const stars = CFG && typeof CFG.rewardStars === 'number' ? CFG.rewardStars : 10;
    if (st.completed) {
      return st.rewardClaimed
        ? '✅ ' + total + '/' + total + ' · +' + stars + ' ⭐'
        : '✅ ' + total + '/' + total + ' ⭐';
    }
    return '(' + st.explored + '/' + total + ')';
  }

  function updateBadge(st) {
    const b = document.getElementById('bnVisualBadge');
    if (!b) return;
    b.textContent = badgeText(st);
    b.classList.toggle('fet', !!st.completed);
  }

  function readHeaderStars() {
    if (typeof global.puntsTots === 'function') {
      try {
        const v = Number(global.puntsTots());
        if (Number.isFinite(v)) return v;
      } catch (e) {}
    }
    const el = document.getElementById('punts');
    if (el) {
      const m = (el.textContent || '').match(/⭐\s*(\d+)/);
      if (m) return Number(m[1]);
    }
    return null;
  }

  function syncModalStars(overrideVal) {
    const mp = document.getElementById('bnVisualModalPunts');
    if (!mp) return;
    const isTast = CFG && typeof CFG.isDemoOrTast === 'function' && !!global.MODE_TAST;
    const val = typeof overrideVal === 'number' ? overrideVal : readHeaderStars();
    if (val === null || isTast) {
      mp.hidden = true;
      return;
    }
    mp.hidden = false;
    mp.textContent = '⭐ ' + val;
  }

  function isReducedMotion() {
    try {
      if (document.body && document.body.classList.contains('suau')) return true;
      if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch (e) {}
    return false;
  }

  function renderCounterValue(el, val, isMainHeader) {
    if (!el) return;
    if (isMainHeader) {
      const ext = el.querySelector('.pt-ext');
      const extHtml = ext ? ext.outerHTML : '';
      el.innerHTML = '⭐ ' + val + extHtml;
    } else {
      el.textContent = '⭐ ' + val;
    }
  }

  function animateCounterTarget(targetEl, fromVal, toVal, stars, isMainHeader) {
    if (!targetEl) return;
    const reduced = isReducedMotion();

    if (reduced) {
      renderCounterValue(targetEl, toVal, isMainHeader);
      if (isMainHeader && typeof global.pintaCap === 'function') {
        try { global.pintaCap(); } catch (e) {}
      }
      return;
    }

    // 1) Mostra valor inicial abans de l'arribada de les estrelles
    renderCounterValue(targetEl, fromVal, isMainHeader);

    // 2) Estrelles volant des del centre fins al marcador (per sobre del modal, z-index 10002)
    try {
      const rect = targetEl.getBoundingClientRect();
      const x0 = Math.round(global.innerWidth / 2);
      const y0 = Math.round(global.innerHeight * 0.56);
      const dx = Math.round(rect.left + rect.width / 2 - x0);
      const dy = Math.round(rect.top + rect.height / 2 - y0);

      const fly = document.createElement('div');
      fly.className = 'bn-vis-fly';
      fly.textContent = '+' + stars + ' ⭐';
      fly.style.left = x0 + 'px';
      fly.style.top = y0 + 'px';
      document.body.appendChild(fly);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fly.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(0.65)';
          fly.style.opacity = '0.15';
        });
      });
      setTimeout(function () { fly.remove(); }, 950);
    } catch (e) {}

    // 3) Comptador pujant +1 a +1 quan arriben les estrelles + efecte boing + so
    const steps = Math.max(1, Math.min(20, toVal - fromVal));
    const startDelay = 420;
    const duration = 680;
    setTimeout(function () {
      const t0 = performance.now();
      targetEl.classList.remove('boing', 'is-boing');
      void targetEl.offsetWidth;
      targetEl.classList.add(isMainHeader ? 'boing' : 'is-boing');
      if (typeof global.so === 'function') {
        try { global.so('coin'); } catch (e) {}
      }
      function tick(now) {
        const p = Math.min(1, (now - t0) / duration);
        const cur = Math.round(fromVal + (toVal - fromVal) * p);
        renderCounterValue(targetEl, cur, isMainHeader);
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          renderCounterValue(targetEl, toVal, isMainHeader);
          if (isMainHeader && typeof global.pintaCap === 'function') {
            try { global.pintaCap(); } catch (e) {}
          }
          // Actualitza també la targeta d'estadístiques de l'hero si és visible
          const heroStat = document.querySelector('.hero .stats .mini b');
          const prof = getActiveProfile();
          if (heroStat && prof && typeof prof.punts === 'number' && heroStat.textContent.indexOf('⭐') !== -1) {
            heroStat.textContent = '⭐ ' + prof.punts;
          }
        }
      }
      requestAnimationFrame(tick);
    }, startDelay);
  }

  function celebrateStarsOnCounter(stars, beforeTotal, afterTotal) {
    if (typeof beforeTotal !== 'number' || typeof afterTotal !== 'number' || afterTotal <= beforeTotal) {
      return;
    }
    const modal = document.getElementById('bnVisualModal');
    const modalOpen = !!(modal && !modal.hidden);
    if (modalOpen) {
      const mp = document.getElementById('bnVisualModalPunts');
      if (mp && !mp.hidden) {
        animateCounterTarget(mp, beforeTotal, afterTotal, stars, false);
      }
      // En tancar el modal, també animarem el marcador principal #punts perquè l'alumne ho vegi pujar al món
      pendingHeaderCelebration = { from: beforeTotal, to: afterTotal, stars: stars };
    } else {
      const puntsEl = document.getElementById('punts');
      if (puntsEl) {
        animateCounterTarget(puntsEl, beforeTotal, afterTotal, stars, true);
      }
    }
  }

  function showRewardToast(stars) {
    let toast = document.getElementById('bnVisualToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bnVisualToast';
      toast.className = 'bn-vis-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = '⭐ Laboratori completat! +' + stars + ' estrelles afegides';
    toast.classList.add('is-open');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () {
      toast.classList.remove('is-open');
    }, 4500);
  }

  function getActiveProfile() {
    if (CFG && typeof CFG.getProfileState === 'function') {
      try {
        return CFG.getProfileState() || null;
      } catch (e) {}
    }
    return (typeof global.S === 'object' && global.S) ? global.S : null;
  }

  function isSafeSimulationMode() {
    try {
      if (CFG && CFG.forceRealRpc === true) return false;
      if (global.__BN_TEST_VISUAL_RPC === true) return false;
      const host = global.location.hostname || '';
      const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host) || global.location.protocol === 'file:';
      const usp = new URLSearchParams(global.location.search);
      const isDemo = usp.get('demo') === '1' || !!global.MODE_DEMO;
      const isTast = usp.get('tast') === '1' || !!global.MODE_TAST;
      const isDemoOrTast = isDemo || isTast || (CFG && typeof CFG.isDemoOrTast === 'function' && !!CFG.isDemoOrTast());
      const prof = getActiveProfile();
      const hasSession =
        !!(prof && prof.nom) &&
        typeof global.pinDe === 'function' &&
        !!global.pinDe(prof.nom);
      return isLocal || isDemoOrTast || !hasSession;
    } catch (e) {
      return true;
    }
  }

  // Adaptador oficial amb RPC real bn_visual_premi de Supabase (idempotència server-side).
  // Protegit perquè a localhost / ?demo=1 / ?tast=1 o sense sessió + PIN no escrigui a producció.
  async function defaultSupabaseRewardAdapter(payload) {
    const beforeTotal = readHeaderStars();
    if (isSafeSimulationMode()) {
      console.log('[PROVA LOCAL · SIMULACIÓ SUPABASE] Premi únic visual (+' + payload.stars + ' ⭐):', payload);
      return {
        claimed: true,
        toast: true,
        stars: payload.stars,
        beforeTotal: beforeTotal,
        afterTotal: beforeTotal !== null ? beforeTotal + payload.stars : null
      };
    }

    const prof = getActiveProfile();
    const nom = prof && prof.nom;
    const pin = typeof global.pinDe === 'function' ? global.pinDe(nom) : '';
    const rpcFn = typeof global.rpc === 'function' ? global.rpc : null;
    if (!nom || !pin || !rpcFn) {
      return { claimed: false, toast: false };
    }

    try {
      const res = await rpcFn('bn_visual_premi', {
        p_nom: nom,
        p_pin: pin,
        p_assig: payload.world,
        p_reward_key: payload.rewardKey,
        p_stars: payload.stars
      });

      if (!res || res.ok !== true) {
        return { claimed: false, toast: false };
      }

      if (res.already_claimed === true) {
        if (prof && typeof prof === 'object') {
          prof.visuals = prof.visuals || {};
          prof.visuals[payload.world] = {
            rewardClaimed: true,
            stars: payload.stars,
            ts: Date.now()
          };
        }
        return { claimed: true, toast: false, stars: payload.stars };
      }

      if (res.awarded === true) {
        const awardedStars = Number(res.stars) || payload.stars || 10;
        if (prof && typeof prof === 'object') {
          prof.visuals = prof.visuals || {};
          prof.visuals[payload.world] = {
            rewardClaimed: true,
            stars: awardedStars,
            ts: Date.now()
          };
        }
        if (typeof global.suma === 'function') {
          global.suma(awardedStars);
        }
        if (typeof global.registra === 'function') {
          global.registra('joc', {
            joc: payload.rewardKey,
            punts: prof ? prof.punts : 0,
            stars: awardedStars
          });
        }
        const afterTotal = readHeaderStars();
        return {
          claimed: true,
          toast: true,
          stars: awardedStars,
          beforeTotal: beforeTotal,
          afterTotal: afterTotal !== null ? afterTotal : (beforeTotal !== null ? beforeTotal + awardedStars : null)
        };
      }

      return { claimed: false, toast: false };
    } catch (err) {
      console.warn('[BonaNotaVisuals] Error de xarxa a bn_visual_premi:', err);
      return { claimed: false, toast: false };
    }
  }

  async function tryClaimReward(st) {
    if (!CFG || st.completed !== true) return;
    const uid = st.uid || resolveUid();
    const world = CFG.world;
    const stars = typeof CFG.rewardStars === 'number' ? CFG.rewardStars : 10;
    const lockKey = uid + ':' + world;

    if (stars <= 0) return;
    if (isRewardClaimed(uid, world)) {
      updateBadge(Object.assign({}, st, { rewardClaimed: true }));
      return;
    }
    if (rewardInFlight[lockKey]) return;

    rewardInFlight[lockKey] = true;
    const payload = {
      world: world,
      uid: uid,
      stars: stars,
      rewardKey: 'visual_' + world,
      explored: st.explored,
      total: st.total
    };

    try {
      const handler =
        typeof CFG.onReward === 'function'
          ? CFG.onReward
          : typeof CFG.onCompleteReward === 'function'
            ? CFG.onCompleteReward
            : defaultSupabaseRewardAdapter;

      const result = await Promise.resolve(handler(payload));
      const claimed = typeof result === 'object' && result !== null ? result.claimed === true : result !== false;
      const shouldToast = typeof result === 'object' && result !== null ? result.toast !== false : claimed;
      const finalStars = (typeof result === 'object' && result !== null && Number(result.stars)) || stars;

      if (claimed) {
        markRewardClaimedLocal(uid, world, finalStars);
        updateBadge(Object.assign({}, st, { rewardClaimed: true }));
        if (shouldToast) {
          showRewardToast(finalStars);
          const bTot = typeof result === 'object' && result !== null && typeof result.beforeTotal === 'number'
            ? result.beforeTotal
            : null;
          const aTot = typeof result === 'object' && result !== null && typeof result.afterTotal === 'number'
            ? result.afterTotal
            : null;
          celebrateStarsOnCounter(finalStars, bTot, aTot);
        }
      }
    } catch (err) {
      console.warn('[BonaNotaVisuals] Error a onReward:', err);
    } finally {
      rewardInFlight[lockKey] = false;
    }
  }

  function injectStyles(colors) {
    const c = Object.assign({}, DEFAULT_COLORS, colors || {});
    let style = document.getElementById('bnVisualsStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'bnVisualsStyle';
      document.head.appendChild(style);
    }
    style.textContent =
      '.bn-vis-card{margin-top:14px;width:100%;display:flex;align-items:center;gap:12px;text-align:left;' +
      'background:linear-gradient(135deg,' + c.bg1 + ',' + c.bg2 + ');border:2px solid ' + c.border + ';' +
      'border-radius:16px;padding:13px 16px;min-height:60px;cursor:pointer;color:var(--txt,#1e293b);' +
      'box-shadow:var(--om,0 4px 14px rgba(15,23,42,.08));transition:transform .2s,box-shadow .2s,border-color .2s;font-family:inherit}' +
      '.bn-vis-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px ' + c.shadow + ';border-color:' + c.hover + '}' +
      '.bn-vis-card:focus-visible{outline:3px solid var(--blau2,#2563eb);outline-offset:3px}' +
      '.bn-vis-ic{flex:none;width:44px;height:44px;border-radius:12px;background:' + c.iconBg + ';' +
      'display:inline-flex;align-items:center;justify-content:center;font-size:24px}' +
      '.bn-vis-txt{flex:1;min-width:0}' +
      '.bn-vis-txt b{display:block;font-size:17px;line-height:1.25;color:' + c.title + '}' +
      '.bn-vis-txt small{display:block;font-size:13.5px;font-weight:700;color:' + c.sub + ';margin-top:2px;line-height:1.35}' +
      '.bn-vis-badge{flex:none;display:inline-flex;align-items:center;justify-content:center;min-height:32px;' +
      'padding:4px 11px;border-radius:999px;font-weight:900;font-size:13.5px;background:#fff;' +
      'border:2px solid ' + c.badgeBorder + ';color:' + c.badgeText + ';white-space:nowrap}' +
      '.bn-vis-badge.fet{background:#dcfce7;border-color:#4ade80;color:#15803d}' +
      '.bn-vis-modal{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;background:#0a0e17}' +
      '.bn-vis-modal[hidden]{display:none}' +
      '.bn-vis-cap{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;' +
      'padding:8px 12px;padding-top:calc(8px + env(safe-area-inset-top,0px));' +
      'background:' + c.headerBg + ';color:#fff;box-shadow:0 2px 12px rgba(0,0,0,.35)}' +
      '.bn-vis-cap-tit{font-weight:900;font-size:16px;line-height:1.25;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}' +
      '.bn-vis-modal-punts{flex:none;display:inline-flex;align-items:center;gap:4px;min-height:36px;padding:4px 12px;' +
      'border-radius:999px;background:rgba(15,23,42,.42);border:2px solid rgba(250,204,21,.65);color:#fef08a;' +
      'font-weight:900;font-size:14.5px;white-space:nowrap;transition:transform .25s ease}' +
      '.bn-vis-modal-punts.is-boing{animation:bnVisBoing .48s cubic-bezier(.3,1.8,.5,1)}' +
      '@keyframes bnVisBoing{0%{transform:scale(1)}45%{transform:scale(1.24)}100%{transform:scale(1)}}' +
      '.bn-vis-fly{position:fixed;z-index:10002;pointer-events:none;transform:translate(-50%,-50%) scale(1.1);' +
      'font-weight:900;font-size:22px;color:#facc15;text-shadow:0 2px 0 #92400e,0 0 16px rgba(250,204,21,.85);' +
      'white-space:nowrap;transition:transform .78s cubic-bezier(.5,-.35,.6,1),opacity .78s ease-in;will-change:transform}' +
      '.bn-vis-tanca{flex:none;min-height:48px;min-width:48px;padding:0 16px;border-radius:999px;' +
      'border:2px solid rgba(255,255,255,.55);background:rgba(15,23,42,.38);color:#fff;font-weight:900;' +
      'font-size:14.5px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;' +
      'white-space:nowrap;transition:background .15s,border-color .15s;font-family:inherit}' +
      '.bn-vis-tanca:hover{background:rgba(15,23,42,.62);border-color:#fff}' +
      '.bn-vis-tanca:focus-visible{outline:3px solid #facc15;outline-offset:2px}' +
      '.bn-vis-frame{flex:1;width:100%;height:100%;border:0;display:block;background:#0a0e17}' +
      '.bn-vis-inline{margin:14px 0 4px}' +
      '.bn-vis-inline-frame{width:100%;height:560px;border:0;display:block;background:transparent;overflow:hidden;border-radius:20px}' +
      '.bn-vis-joc-bar{display:flex;justify-content:flex-end;margin:0 0 10px}' +
      '.bn-vis-joc-btn{min-height:44px;padding:0 14px;border-radius:999px;border:2px solid ' + c.border + ';' +
      'background:' + c.bg1 + ';color:' + c.sub + ';font-weight:900;font-size:14px;cursor:pointer;' +
      'display:inline-flex;align-items:center;gap:6px;transition:background .15s,border-color .15s;font-family:inherit}' +
      '.bn-vis-joc-btn:hover{background:' + c.bg2 + ';border-color:' + c.hover + '}' +
      '.bn-vis-joc-btn:focus-visible{outline:3px solid var(--blau2,#2563eb);outline-offset:2px}' +
      '.bn-vis-toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translate(-50%,20px);' +
      'z-index:10001;background:#0f172a;color:#fef08a;border:2px solid #facc15;border-radius:999px;padding:11px 18px;' +
      'font-weight:900;font-size:14.5px;box-shadow:0 12px 30px rgba(15,23,42,.45);opacity:0;pointer-events:none;' +
      'transition:opacity .22s ease,transform .22s ease;max-width:calc(100vw - 24px);text-align:center}' +
      '.bn-vis-toast.is-open{opacity:1;transform:translate(-50%,0)}' +
      '@media(max-width:520px){.bn-vis-card{flex-wrap:wrap;padding:12px}.bn-vis-badge{margin-left:auto}' +
      '.bn-vis-cap-tit{font-size:14.5px}.bn-vis-tanca{padding:0 12px;font-size:13.5px}}';
  }

  function ensureModal() {
    if (document.getElementById('bnVisualModal')) return;
    const modal = document.createElement('div');
    modal.id = 'bnVisualModal';
    modal.className = 'bn-vis-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'bnVisualTit');
    modal.hidden = true;
    modal.innerHTML =
      '<div class="bn-vis-cap">' +
      '<span id="bnVisualTit" class="bn-vis-cap-tit"></span>' +
      '<span id="bnVisualModalPunts" class="bn-vis-modal-punts" aria-live="polite" hidden></span>' +
      '<button type="button" id="bnVisualTanca" class="bn-vis-tanca" aria-label="Tornar al món">✕ Tornar al món</button>' +
      '</div>' +
      '<iframe id="bnVisualFrame" class="bn-vis-frame" title="Laboratori Visual"></iframe>';
    document.body.appendChild(modal);
    const bt = document.getElementById('bnVisualTanca');
    if (bt) bt.addEventListener('click', tanca);
  }

  function obre(fitxaNum) {
    if (!CFG) return;
    ensureModal();
    const m = document.getElementById('bnVisualModal');
    const f = document.getElementById('bnVisualFrame');
    const tit = document.getElementById('bnVisualTit');
    if (!m || !f) return;

    const n = Number(fitxaNum);
    const hasFitxa = Number.isInteger(n) && n >= 1 && n <= CFG.total;
    const destUrl = buildUrl(hasFitxa ? n : null);

    if (tit) {
      const baseTit = CFG.modalTitol || CFG.titol || 'Laboratori Visual';
      tit.textContent = hasFitxa ? baseTit + ' · Fitxa ' + n : baseTit;
    }
    if (currentModalUrl !== destUrl) {
      f.src = destUrl;
      currentModalUrl = destUrl;
    }

    prevFocusEl = document.activeElement;
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    syncModalStars();
    m.hidden = false;

    const bt = document.getElementById('bnVisualTanca');
    if (bt) bt.focus({ preventScroll: true });
  }

  function tanca() {
    const m = document.getElementById('bnVisualModal');
    if (!m || m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = prevBodyOverflow || '';
    if (prevFocusEl && typeof prevFocusEl.focus === 'function') {
      try {
        prevFocusEl.focus({ preventScroll: true });
      } catch (e) {}
    }
    if (pendingHeaderCelebration) {
      const pend = pendingHeaderCelebration;
      pendingHeaderCelebration = null;
      const puntsEl = document.getElementById('punts');
      if (puntsEl) {
        setTimeout(function () {
          animateCounterTarget(puntsEl, pend.from, pend.to, pend.stars, true);
        }, 120);
      }
    }
  }

  function bindListeners() {
    if (listenersBound) return;
    listenersBound = true;

    global.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const m = document.getElementById('bnVisualModal');
        if (m && !m.hidden) {
          e.preventDefault();
          tanca();
        }
      }
    });

    global.addEventListener('message', function (e) {
      const d = e.data;
      if (!CFG || !d || typeof d !== 'object') return;
      if (d.world && d.world !== CFG.world) return;

      if (d.type === 'BONANOTA_VISUAL_CLOSE') {
        tanca();
        return;
      }

      if (d.type === 'BONANOTA_VISUAL_RESIZE') {
        const h = Math.ceil(Number(d.height) || 0);
        if (h <= 0) return;
        const frames = Array.prototype.slice.call(
          document.querySelectorAll('iframe.bn-vis-inline-frame')
        );
        const target =
          frames.find(function (fr) { return fr.contentWindow === e.source; }) ||
          frames.find(function (fr) { return Number(fr.dataset.fitxa) === Number(d.fitxa); });
        if (target) target.style.height = Math.max(220, h) + 'px';
        return;
      }

      if (d.type === 'BONANOTA_VISUAL_PROGRESS') {
        const uid = resolveUid();
        const total = Number(d.total) || CFG.total || 6;
        const rawExplored = Number(d.explored);
        const explored = Math.max(0, Math.min(total, Number.isFinite(rawExplored) ? rawExplored : 0));
        const completed = d.completed === true;
        const rewardClaimed = isRewardClaimed(uid, CFG.world);

        const st = {
          uid: uid,
          world: CFG.world,
          explored: explored,
          total: total,
          completed: completed,
          rewardClaimed: rewardClaimed,
          updatedAt: Date.now()
        };

        try {
          const key = storageVisualKey(uid, CFG.world);
          const prevRaw = localStorage.getItem(key);
          const prevObj = prevRaw ? JSON.parse(prevRaw) : null;
          if (!prevObj || typeof prevObj !== 'object' || (!Array.isArray(prevObj.completed) && !Array.isArray(prevObj.fitxes) && !Array.isArray(prevObj))) {
            localStorage.setItem(key, JSON.stringify({
              world: CFG.world,
              uid: uid,
              explored: explored,
              total: total,
              completed: completed,
              updatedAt: st.updatedAt
            }));
          }
        } catch (err) {}

        updateBadge(st);
        console.log('[PROVA LOCAL] Progrés ' + CFG.world + ' (' + uid + '):', d);

        if (completed === true) {
          // TODO: Integrar recompensa d'estrelles a Supabase quan es validi la prova
          tryClaimReward(st);
        }
      }
    });
  }

  function init(config) {
    if (!config || !config.world || !config.src) {
      throw new Error('BonaNotaVisuals.init requereix { world, src }');
    }
    CFG = Object.assign(
      {
        total: 6,
        rewardStars: 10,
        icona: '🧪',
        titol: 'Laboratori Visual',
        subtitol: '',
        botoJoc: '🧪 Obre laboratori visual',
        temes: {},
        jocs: {},
        getUserId: null,
        onReward: null,
        getProfileState: null
      },
      config
    );
    currentModalUrl = '';
    injectStyles(CFG.color);
    if (document.body) {
      ensureModal();
    } else {
      document.addEventListener('DOMContentLoaded', ensureModal, { once: true });
    }
    bindListeners();
    initialized = true;
    return BonaNotaVisuals;
  }

  function cartaInici() {
    if (!CFG) return '';
    const st = readState();
    return (
      '<button type="button" class="bn-vis-card" id="bnVisualBtn" onclick="BonaNotaVisuals.obre()" aria-haspopup="dialog">' +
      '<span class="bn-vis-ic" aria-hidden="true">' + escHtml(CFG.icona) + '</span>' +
      '<span class="bn-vis-txt">' +
      '<b>' + escHtml(CFG.titol) + '</b>' +
      '<small>' + escHtml(CFG.subtitol) + '</small>' +
      '</span>' +
      '<span id="bnVisualBadge" class="bn-vis-badge' + (st.completed ? ' fet' : '') + '">' +
      escHtml(badgeText(st)) +
      '</span>' +
      '</button>'
    );
  }

  function inlineTemaHtml(tema) {
    if (!CFG || !tema) return '';
    const id = typeof tema === 'string' ? tema : tema.id;
    const titol = typeof tema === 'string' ? 'Fitxa ' + CFG.temes[id] : (tema.titol || 'Visual interactiu');
    const n = CFG.temes && CFG.temes[id];
    if (!n) return '';
    return (
      '<div class="bn-vis-inline" data-world="' + escHtml(CFG.world) + '" data-fitxa="' + n + '">' +
      '<iframe class="bn-vis-inline-frame" data-world="' + escHtml(CFG.world) + '" data-fitxa="' + n + '" ' +
      'src="' + escHtml(buildUrl(n)) + '" loading="lazy" scrolling="no" ' +
      'title="Visual interactiu: ' + escHtml(titol) + '"></iframe>' +
      '</div>'
    );
  }

  function insertaBotoJoc(jocId, container) {
    if (!CFG || !CFG.jocs) return;
    const n = CFG.jocs[jocId];
    if (!n) return;
    const target = container || document.getElementById('app');
    if (!target) return;
    const bar = document.createElement('div');
    bar.className = 'bn-vis-joc-bar';
    bar.innerHTML =
      '<button type="button" class="bn-vis-joc-btn" onclick="BonaNotaVisuals.obre(' + n + ')" aria-haspopup="dialog">' +
      escHtml(CFG.botoJoc || '🧪 Obre laboratori visual') +
      '</button>';
    target.prepend(bar);
  }

  const BonaNotaVisuals = {
    init: init,
    cartaInici: cartaInici,
    inlineTemaHtml: inlineTemaHtml,
    insertaBotoJoc: insertaBotoJoc,
    obre: obre,
    tanca: tanca,
    estat: readState,
    getUid: resolveUid,
    get isInitialized() { return initialized; }
  };

  global.BonaNotaVisuals = BonaNotaVisuals;
})(window);
