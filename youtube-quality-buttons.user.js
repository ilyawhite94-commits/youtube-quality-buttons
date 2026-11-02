// ==UserScript==
// @name         YouTube Quality Buttons
// @namespace    local.youtube.quality.buttons
// @version      1.0
// @description  Кнопки выбора качества прямо на плеере YouTube
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // [внутренний код YouTube, высота, подпись на кнопке]
  const LEVELS = [
    ['tiny', 144, '144p'],
    ['small', 240, '240p'],
    ['medium', 360, '360p'],
    ['large', 480, '480p'],
    ['hd720', 720, '720p'],
    ['hd1080', 1080, '1080p'],
    ['hd1440', 1440, '1440p'],
    ['hd2160', 2160, '4K'],
    ['highres', 4320, '8K'],
  ];

  let autoMode = true;

  const style = document.createElement('style');
  style.textContent = `
    .yq-bar {
      position: absolute; top: 0; left: 0; z-index: 60;
      display: flex; flex-wrap: wrap; gap: 6px; max-width: 70%;
      opacity: 0; pointer-events: none; transition: opacity .2s;
    }
    #movie_player:not(.ytp-autohide) .yq-bar { opacity: 1; pointer-events: auto; }
    .yq-bar button {
      background: rgba(120,10,10,.55); color: #fff; cursor: pointer;
      border: 1px solid rgba(255,255,255,.3); border-radius: 6px;
      padding: 11px 20px; font: 500 22px/1.3 Roboto, Arial, sans-serif;
    }
    .ytp-fullscreen .yq-bar { top: 0; left: 0; gap: 10px; }
    .ytp-fullscreen .yq-bar button { padding: 15px 28px; font-size: 30px; border-radius: 10px; }
    .yq-bar button:hover { background: rgba(170,20,20,.75); }
    .yq-bar button.yq-active { background: rgba(255,255,255,.85); color: #000; }
    /* прячем меню настроек, пока скрипт переключает качество через него */
    #movie_player.yq-busy .ytp-popup { opacity: 0 !important; pointer-events: none !important; }
  `;
  document.head.appendChild(style);

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const getPlayer = () => document.getElementById('movie_player');

  // Запасной способ: имитируем клики по меню настроек
  async function viaMenu(height) {
    const p = getPlayer();
    const btn = p && p.querySelector('.ytp-settings-button');
    if (!btn) return;
    p.classList.add('yq-busy');
    try {
      btn.click();
      await wait(150);
      const items = p.querySelectorAll('.ytp-settings-menu .ytp-menuitem');
      if (!items.length) return;
      items[items.length - 1].click(); // пункт «Качество» — последний
      await wait(150);
      const opts = [...p.querySelectorAll('.ytp-quality-menu .ytp-menuitem')];
      let target;
      if (height === null) {
        target = opts[opts.length - 1]; // «Автонастройка»
      } else {
        const match = opts.filter((o) => new RegExp('^\\s*' + height + 'p').test(o.textContent));
        target = match.find((o) => !/premium/i.test(o.textContent)) || match[0];
      }
      if (target) {
        target.click();
      } else if (p.querySelector('.ytp-settings-menu')?.offsetParent) {
        btn.click(); // закрыть меню, если нужного пункта нет
      }
    } finally {
      await wait(250);
      p.classList.remove('yq-busy');
    }
  }

  async function choose(code, height) {
    const p = getPlayer();
    if (!p) return;
    if (code === 'auto') {
      autoMode = true;
      await viaMenu(null);
    } else {
      autoMode = false;
      try {
        p.setPlaybackQualityRange(code, code);
        p.setPlaybackQuality(code);
      } catch (e) { /* ignore */ }
      await wait(700);
      if (p.getPlaybackQuality && p.getPlaybackQuality() !== code) {
        await viaMenu(height);
      }
    }
    refresh();
  }

  function ensureBar(p) {
    let bar = p.querySelector('.yq-bar');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.className = 'yq-bar';
    ['mousedown', 'click', 'dblclick'].forEach((ev) =>
      bar.addEventListener(ev, (e) => e.stopPropagation())
    );
    const make = (code, height, label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.dataset.q = code;
      b.addEventListener('click', () => choose(code, height));
      bar.appendChild(b);
    };
    LEVELS.forEach(([code, h, label]) => make(code, h, label));
    make('auto', null, 'Авто');
    p.appendChild(bar);
    return bar;
  }

  function refresh() {
    const p = getPlayer();
    if (!p || !p.getAvailableQualityLevels || location.pathname.startsWith('/shorts')) return;
    const bar = ensureBar(p);
    const avail = p.getAvailableQualityLevels() || [];
    const cur = p.getPlaybackQuality && p.getPlaybackQuality();
    bar.querySelectorAll('button').forEach((b) => {
      const q = b.dataset.q;
      b.style.display = q === 'auto' || avail.includes(q) ? '' : 'none';
      b.classList.toggle('yq-active', q === 'auto' ? autoMode : !autoMode && q === cur);
    });
  }

  window.addEventListener('yt-navigate-start', () => { autoMode = true; });
  setInterval(refresh, 1000);
})();
