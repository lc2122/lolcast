// --- Constants & Config ---
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzpFTaOvQTeHoPIA4YvvYSnMqHEoAxcelZ_FrJnuuzHoFBWHjxzpde7HfixpuLSg_SbYw/exec',
    CUSTOM_CHANNELS_URL: 'https://script.google.com/macros/s/AKfycbwqZiJvKnHDyVc7t10KFWBROCWECpKdgiSKiLnOp8kWnmGonbxe90qF3V9RNelsSA_O/exec',
    CHROME_EXT_ID: 'eakdijdofmnclopcffkkgmndadhbjgka',
    FIREFOX_EXT_ID: 'aa90a88b-5a54-4c13-952c-c278cfafd91b',
    BASEBALL_URL: 'https://global-media.sooplive.com/live/soopbaseball',
    CHZZK_PROXY: 'https://chzzk-api-proxy.hibiya.workers.dev/m3u8-redirect/',
    KEYS: {
        TOGGLE_STATES: 'lolcastToggleStates',
        SIDEBAR_VISIBILITY: 'lolcastSidebarVisibility',
        FAVORITES: 'favorites'
    }
};

// --- State ---
const state = {
    isFirefox: false,
    extensionId: CONFIG.CHROME_EXT_ID,
    playerCount: 1,
    clickIndex: 0,
    toggleStates: {},
    sidebarVisibility: {},
    favorites: JSON.parse(localStorage.getItem(CONFIG.KEYS.FAVORITES)) || [],
    youtubeUrls: {},
    lckSchedule: [],
    customChannels: []
};

// --- DOM Elements ---
const DOM = {};

// --- Channel Data Definition ---
const CHANNELS = {
    SPOTV: { name: 'SPOTV', url: 'https://lolcast.web.app/spotv.html', type: 'iframe', className: 'spotv-btn channel-button is-outlined' },
    LCK: [
        { name: 'L', url: 'https://mul.live/9381e7d6816e6d915a44a13c0195b202', type: 'iframe', tooltip: '치지직1', className: 'lck-channel-btn is-outlined' },
        { name: 'C', url: `${CONFIG.CHZZK_PROXY}9381e7d6816e6d915a44a13c0195b202`, type: 'm3u8', tooltip: '치지직2', className: 'lck-channel-btn is-outlined' },
        { name: 'K', url: '', type: 'iframe', tooltip: '유튜브', className: 'lck-channel-btn is-outlined' }
    ],
    STREAMERS: [
        { name: '붐', url: 'kdjlc17799', type: 'iframe', platform: 'kick', className: 'kick-btn channel-button is-outlined' },
        { name: 'AC', url: 'neiamok', type: 'iframe', platform: 'kick', className: 'kick-btn channel-button is-outlined' },
        { name: '캐린1', url: 'karyn4011', type: 'iframe', platform: 'kick', className: 'kick-btn channel-button is-outlined' },
        { name: '캐린2', url: 'karyn4021', type: 'iframe', platform: 'kick', className: 'kick-btn channel-button is-outlined' },
        { name: '캐린3', url: 'arinarintv', type: 'iframe', platform: 'kick', className: 'kick-btn channel-button is-outlined' }
    ]
};
const baseballChannels = Array.from({ length: 5 }, (_, i) => ({ name: `야${i + 1}`, url: `${CONFIG.BASEBALL_URL}${i + 1}/master.m3u8`, type: 'm3u8', className: 'baseball-btn channel-button is-outlined' }));
const staticSportsChannels = [CHANNELS.SPOTV, ...baseballChannels];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    cacheDOMElements();
    detectBrowser();
    setupEventListeners();
    
    // Apply URL params or default to 1 split
    if (!applyUrlParameters()) {
        setSplitScreen(1);
    }

    // Render Initial UI
    renderCombinedChannels();
    loadToggleStates();
    loadSidebarVisibility();
    
    // Load Async Data
    fetchLckData();
    fetchCustomChannels();
    setInterval(fetchCustomChannels, 60000);
}

function cacheDOMElements() {
    const ids = [
        'lck-channels', 'player-container', 'sidebar', 'favorite-modal', 
        'favorite-list', 'firefox-notice', 'chrome-notice', 'lck-schedule', 
        'toggle-btn', 'custom-address-channels', 'combined-channels-content',
        'custom-url-input'
    ];
    ids.forEach(id => DOM[id] = document.getElementById(id));
}

function detectBrowser() {
    const ua = navigator.userAgent.toLowerCase();
    state.isFirefox = ua.includes('firefox');
    state.extensionId = state.isFirefox ? CONFIG.FIREFOX_EXT_ID : CONFIG.CHROME_EXT_ID;

    if (DOM['toggle-btn']) {
        DOM['toggle-btn'].className = `button is-small is-rounded ${state.isFirefox ? 'is-success' : 'is-link'}`;
    }
    if (DOM['firefox-notice']) DOM['firefox-notice'].style.display = state.isFirefox ? 'block' : 'none';
    if (DOM['chrome-notice']) DOM['chrome-notice'].style.display = state.isFirefox ? 'none' : 'block';
}

function setupEventListeners() {
    // Sidebar Toggle
    DOM['toggle-btn']?.addEventListener('click', toggleSidebar);
    
    // Custom URL Input
    DOM['custom-url-input']?.addEventListener('keydown', (e) => { if (e.key === 'Enter') playCustomUrl(); });
    DOM['custom-url-input']?.addEventListener('paste', () => setTimeout(playCustomUrl, 0));

    // Modal Interactions
    const modalBg = DOM['favorite-modal']?.querySelector('.modal-background');
    const closeBtn = DOM['favorite-modal']?.querySelector('.delete');
    const cancelBtns = DOM['favorite-modal']?.querySelectorAll('.modal-card-foot .button:not(.is-success):not(.is-link)');
    
    [modalBg, closeBtn, ...cancelBtns].forEach(el => el?.addEventListener('click', closeModal));
    
    DOM['favorite-list']?.addEventListener('click', (e) => {
        if (e.target.classList.contains('is-delete')) deleteFavorite(e.target.dataset.index);
    });
}

// --- Logic Core: URL Transformation (Preserved) ---
function transformUrl(url) {
    if (!url) return null;
    if (url.includes('.m3u8')) return url;
    const chzzkIdPattern = /^[0-9a-fA-F]{32}$/;
    if (chzzkIdPattern.test(url)) return `${CONFIG.CHZZK_PROXY}${url}`;
    
    if (url.startsWith('https://lolcast.kr/#/player/')) {
        try {
            const hashPart = url.split('#')[1];
            if (hashPart) {
                const pathSegments = hashPart.split('/').filter(Boolean);
                if (pathSegments.length === 3 && pathSegments[0] === 'player') {
                    const platform = pathSegments[1].toLowerCase();
                    const channelId = pathSegments[2];
                    switch (platform) {
                        case 'youtube': return `https://www.youtube.com/embed/${channelId}`;
                        case 'twitch': return `https://player.twitch.tv/?channel=${channelId}&parent=${window.location.hostname}&parent=lolcast.kr`;
                        case 'chzzk': return chzzkIdPattern.test(channelId) ? `${CONFIG.CHZZK_PROXY}${channelId}` : `https://chzzk.naver.com/live/${channelId}`;
                        case 'kick': return `https://player.kick.cx/${channelId}`;
                        case 'afreeca': return `https://play.sooplive.co.kr/${channelId}/embed`;
                        default: return url;
                    }
                }
            }
        } catch (e) { console.error("[transformUrl] Error:", e); return url; }
    }
    
    const platformChannelPattern = /^(youtube|twitch|chzzk|kick|afreeca)\/([^\/]+)$/;
    const platformMatch = url.match(platformChannelPattern);
    if (platformMatch) {
        const [, platform, channelId] = platformMatch;
        switch (platform) {
            case 'youtube': return `https://www.youtube.com/embed/${channelId}`;
            case 'twitch': return `https://player.twitch.tv/?channel=${channelId}&parent=${window.location.hostname}&parent=lolcast.kr`;
            case 'chzzk': return chzzkIdPattern.test(channelId) ? `${CONFIG.CHZZK_PROXY}${channelId}` : `https://chzzk.naver.com/live/${channelId}`;
            case 'kick': return `https://player.kick.cx/${channelId}`;
            case 'afreeca': return `https://play.sooplive.co.kr/${channelId}/embed`;
            default: return url;
        }
    }
    
    if (url.startsWith('https://www.youtube.com/watch?v=') || url.startsWith('https://youtu.be/')) {
        const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
        if (youtubeMatch && youtubeMatch[1]) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    if (url.startsWith('https://www.youtube.com/embed/')) return url;
    if (url.includes('youtube.com/channel/') || url.includes('youtube.com/@')) return url;
    
    if (url.startsWith('https://twitch.tv/') || url.startsWith('https://www.twitch.tv/')) {
        const channelId = url.split('/').filter(Boolean).pop();
        return `https://player.twitch.tv/?channel=${channelId}&parent=${window.location.hostname}&parent=lolcast.kr`;
    }
    if (url.startsWith('https://player.twitch.tv/')) return url;
    
    if (url.startsWith('https://chzzk.naver.com/live/')) {
        const parts = url.split('/');
        const idx = parts.indexOf('live');
        if (idx !== -1 && parts.length > idx + 1) {
            const id = parts[idx + 1].split('?')[0];
            if (chzzkIdPattern.test(id)) return `${CONFIG.CHZZK_PROXY}${id}`;
        }
        return url;
    }
    if (url.startsWith('https://chzzk.naver.com/')) {
        const parts = url.split('/');
        const potentialId = parts.pop() || parts.pop();
        if (potentialId && chzzkIdPattern.test(potentialId)) return `${CONFIG.CHZZK_PROXY}${potentialId}`;
    }
    
    if (url.startsWith('https://kick.cx/')) {
        const id = url.split('/').filter(Boolean).pop();
        return `https://player.kick.cx/${id}`;
    }
    if (url.startsWith('https://player.kick.cx/')) return url;
    
    if (url.startsWith('https://play.sooplive.co.kr/')) {
        const parts = url.split('/');
        if (parts.length >= 4 && parts[3]) {
            const id = parts[3].split('/')[0];
            return `https://play.sooplive.co.kr/${id}/embed`;
        }
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) return null;
    return url;
}

// --- Player Management ---
function setSplitScreen(count) {
    count = Math.max(1, Math.min(4, count));
    state.playerCount = count;
    state.clickIndex = 0;
    
    if (!DOM['player-container']) return;
    
    // Keep toggle button, clear rest
    DOM['player-container'].innerHTML = '';
    if (DOM['toggle-btn']) DOM['player-container'].appendChild(DOM['toggle-btn']);
    
    for (let i = 0; i < count; i++) {
        const box = document.createElement('div');
        box.className = 'player-box has-background-light';
        box.id = `p-${i}`;
        box.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
        box.addEventListener('drop', createDropHandler(box));
        DOM['player-container'].appendChild(box);
    }
    adjustPlayerLayout();
}

function adjustPlayerLayout() {
    if (!DOM['player-container'] || !DOM['sidebar']) return;
    
    const isCollapsed = DOM['sidebar'].classList.contains('is-collapsed');
    const sidebarWidth = isCollapsed ? 0 : 220;
    
    DOM['player-container'].style.marginLeft = `${sidebarWidth}px`;
    DOM['player-container'].style.width = `calc(100% - ${sidebarWidth}px)`;
    
    if (DOM['toggle-btn']) DOM['toggle-btn'].style.left = `${sidebarWidth + 5}px`;

    // Grid Config
    let cols = 1, rows = 1;
    if (state.playerCount === 2) { cols = 2; }
    else if (state.playerCount >= 3) { cols = 2; rows = 2; }
    
    DOM['player-container'].style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    DOM['player-container'].style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // Specific 3-screen layout
    if (state.playerCount === 3) {
        const boxes = DOM['player-container'].querySelectorAll('.player-box');
        if (boxes[0]) { boxes[0].style.gridColumn = '1 / 2'; boxes[0].style.gridRow = '1 / 2'; }
        if (boxes[1]) { boxes[1].style.gridColumn = '2 / 3'; boxes[1].style.gridRow = '1 / 2'; }
        if (boxes[2]) { boxes[2].style.gridColumn = '1 / 3'; boxes[2].style.gridRow = '2 / 3'; }
    }
}

function loadPlayer(box, url, type) {
    box.dataset.loadUrl = url;
    box.dataset.loadType = type;
    box.innerHTML = ''; // Clear
    box.classList.remove('has-background-light');

    if (!url) {
        box.innerHTML = '<div class="has-text-grey is-size-6">URL 없음</div>';
        box.className = 'player-box has-background-light';
        return;
    }

    // Special Handling: Firefox & Chzzk Proxy -> use direct iframe if possible
    if (state.isFirefox && url.includes(CONFIG.CHZZK_PROXY)) {
        const chId = url.split('/').pop();
        if (chId) {
            const iframe = createIframe(`https://chzzk.naver.com/live/${chId}`);
            box.appendChild(iframe);
            return;
        }
    }

    // M3U8 Handling
    if (url.includes('.m3u8') || type === 'm3u8') {
        if (state.isFirefox) {
            const video = document.createElement('video');
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.dataset.hlsUrl = url;
            box.appendChild(video);
            
            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(console.error));
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.play().catch(console.error);
            }
        } else {
            // Chrome Extension method
            const playerUrl = `chrome-extension://${state.extensionId}/player.html#${encodeURIComponent(url)}`;
            const iframe = createIframe(playerUrl);
            iframe.onerror = () => {
                box.innerHTML = `<div class="has-text-danger">확장 프로그램 필요</div>`;
                box.className = 'player-box has-background-light';
            };
            box.appendChild(iframe);
        }
    } else {
        // General Iframe
        const iframe = createIframe(transformUrl(url) || url);
        iframe.onerror = () => {
            box.innerHTML = `<div class="has-text-danger">로드 실패<br><small>${url}</small></div>`;
            box.className = 'player-box has-background-light';
        };
        box.appendChild(iframe);
    }
}

function createIframe(src) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.src = src;
    return iframe;
}

function createDropHandler(box) {
    return (e) => {
        e.preventDefault();
        const url = e.dataTransfer.getData('text/plain');
        const type = e.dataTransfer.getData('text/type');
        let finalUrl = transformUrl(url) || url;
        let finalType = type || 'iframe';
        
        const chzzkIdPattern = /^[0-9a-fA-F]{32}$/;
        if (finalUrl.includes(CONFIG.CHZZK_PROXY) || finalUrl.endsWith('.m3u8') || chzzkIdPattern.test(url)) {
            finalType = 'm3u8';
        }
        if (finalType === 'm3u8' && chzzkIdPattern.test(finalUrl) && !finalUrl.startsWith(CONFIG.CHZZK_PROXY)) {
            finalUrl = `${CONFIG.CHZZK_PROXY}${finalUrl}`;
        }
        
        if (finalUrl) {
            loadPlayer(box, finalUrl, finalType);
            // Advance click index
            const boxes = Array.from(DOM['player-container'].querySelectorAll('.player-box'));
            state.clickIndex = (boxes.indexOf(box) + 1) % boxes.length;
        }
    };
}

// --- Custom URL Action ---
function playCustomUrl() {
    const input = DOM['custom-url-input'];
    if (!input) return;
    
    const rawVal = input.value.trim();
    if (!rawVal) return;
    
    const urls = rawVal.split(/[,\s\n]+/).filter(u => u.length > 0);
    if (urls.length === 0) return;
    
    // Check if we need to split screen
    if (urls.length > 1) {
        const needed = Math.min(urls.length, 4);
        setSplitScreen(needed);
    }
    
    const boxes = DOM['player-container'].querySelectorAll('.player-box');
    const loopCount = Math.min(urls.length, boxes.length);
    
    for(let i=0; i<loopCount; i++) {
        // If singular URL, use current click index (rotating), else fill from 0
        const targetBox = (urls.length === 1) ? boxes[state.clickIndex % boxes.length] : boxes[i];
        const url = urls[i];
        
        let finalUrl = null;
        let type = 'iframe';
        const chzzkIdPattern = /^[0-9a-fA-F]{32}$/;

        if (chzzkIdPattern.test(url)) {
            finalUrl = `${CONFIG.CHZZK_PROXY}${url}`;
            type = 'm3u8';
        } else {
            finalUrl = transformUrl(url);
            if (finalUrl && (finalUrl.includes(CONFIG.CHZZK_PROXY) || finalUrl.endsWith('.m3u8'))) {
                type = 'm3u8';
            }
        }
        
        if(finalUrl) {
            loadPlayer(targetBox, finalUrl, type);
            if(urls.length === 1) state.clickIndex++; 
        }
    }
    
    input.value = '';
}

// --- UI & Data Fetching ---
function renderChannelList(container, channels, defaultClass, options = {}) {
    if (!container) return;
    channels.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = `button is-small ${ch.className || defaultClass}`.trim();
        btn.textContent = ch[options.nameKey || 'name'];
        btn.draggable = true;
        
        let rawUrl = ch.url;
        if(ch.platform && ch.url) rawUrl = `${ch.platform}/${ch.url}`;
        else if(ch.id) rawUrl = ch.id;
        
        const finalUrl = transformUrl(rawUrl);
        let type = ch.type || 'iframe';
        if (finalUrl && (finalUrl.includes(CONFIG.CHZZK_PROXY) || finalUrl.endsWith('.m3u8'))) type = 'm3u8';

        if(finalUrl) {
            btn.dataset.url = finalUrl;
            btn.dataset.type = type;
            if(ch[options.tooltipKey || 'tooltip']) btn.title = ch.tooltip;
        } else {
            btn.classList.add('is-disabled');
            btn.draggable = false;
        }

        btn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', btn.dataset.url);
            e.dataTransfer.setData('text/type', btn.dataset.type);
        });
        btn.addEventListener('click', () => {
            const boxes = DOM['player-container']?.querySelectorAll('.player-box');
            if (boxes?.length) {
                loadPlayer(boxes[state.clickIndex % boxes.length], btn.dataset.url, btn.dataset.type);
                state.clickIndex++;
            }
        });
        container.appendChild(btn);
    });
}

async function fetchLckData() {
    if (!DOM['lck-schedule']) return;
    try {
        const r = await fetch(`${CONFIG.APPS_SCRIPT_URL}?v=${Date.now()}`);
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        state.youtubeUrls = d.youtubeUrls || {};
        state.lckSchedule = d.lckSchedule || [];
        
        // Update 'K' button URL
        const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
        const ytUrl = state.youtubeUrls[today]?.url || '';
        const kBtn = CHANNELS.LCK.find(c => c.name === 'K');
        if(kBtn) kBtn.url = ytUrl;
        
        renderLckChannels();
        renderLckSchedule();
    } catch (e) {
        console.error("LCK Fetch Error", e);
        DOM['lck-schedule'].innerHTML = '<p class="has-text-warning has-text-centered">데이터 로드 실패</p>';
        renderLckChannels(); // Render basic buttons anyway
    }
}

async function fetchCustomChannels() {
    try {
        const r = await fetch(`${CONFIG.CUSTOM_CHANNELS_URL}?v=${Date.now()}`);
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        state.customChannels = d.data || [];
    } catch (e) {
        state.customChannels = [];
    }
    if (DOM['custom-address-channels']) {
        DOM['custom-address-channels'].innerHTML = '';
        const dynamic = state.customChannels.map(c => ({ ...c, className: 'custom-btn channel-button is-outlined is-link' }));
        renderChannelList(DOM['custom-address-channels'], dynamic, '');
    }
}

function renderLckChannels() {
    if (DOM['lck-channels']) {
        DOM['lck-channels'].innerHTML = '';
        renderChannelList(DOM['lck-channels'], CHANNELS.LCK, '', { tooltipKey: 'tooltip' });
    }
}

function renderCombinedChannels() {
    if (DOM['combined-channels-content']) {
        DOM['combined-channels-content'].innerHTML = '';
        renderChannelList(DOM['combined-channels-content'], CHANNELS.STREAMERS, 'chzzk-btn channel-button is-outlined');
        
        const favs = state.favorites.map(f => ({ ...f, className: 'favorite-btn-channel channel-button is-outlined' }));
        renderChannelList(DOM['combined-channels-content'], favs, '');
        renderChannelList(DOM['combined-channels-content'], staticSportsChannels, '');
    }
}

function renderLckSchedule() {
    const container = DOM['lck-schedule'];
    if (!container) return;
    container.innerHTML = '';
    
    if (!state.lckSchedule.length) {
        container.innerHTML = '<p class="has-text-grey has-text-centered py-2">경기 정보 없음</p>';
        return;
    }

    state.lckSchedule.forEach(match => {
        const div = document.createElement('div');
        div.className = 'is-flex is-align-items-center is-justify-content-center py-1 schedule-item';
        // Simplified HTML construction for brevity
        div.innerHTML = `
            <span class="team-display is-flex is-align-items-center">
                <figure class="image is-24x24 mr-1"><img src="/img/${match.team1}.png" onerror="this.src='/img/default.png'"></figure>
                ${match.team1}
            </span>
            <span class="vs-separator mx-1 is-size-7 has-text-grey">vs</span>
            <span class="team-display is-flex is-align-items-center">
                ${match.team2}
                <figure class="image is-24x24 ml-1"><img src="/img/${match.team2}.png" onerror="this.src='/img/default.png'"></figure>
            </span>
        `;
        container.appendChild(div);
    });
}

// --- Toggles & Sidebar ---
function toggleSidebar() {
    DOM['sidebar']?.classList.toggle('is-collapsed');
    adjustPlayerLayout();
}

function toggleSection(header, contentId) {
    const content = document.getElementById(contentId);
    if (!content) return;
    const active = content.classList.toggle('active');
    header.classList.toggle('collapsed', !active);
    
    state.toggleStates[contentId] = active;
    localStorage.setItem(CONFIG.KEYS.TOGGLE_STATES, JSON.stringify(state.toggleStates));
}

function loadToggleStates() {
    state.toggleStates = JSON.parse(localStorage.getItem(CONFIG.KEYS.TOGGLE_STATES)) || { 'combined-channels-content': true };
    for (const id in state.toggleStates) {
        const el = document.getElementById(id);
        if (el && state.toggleStates[id]) {
            el.classList.add('active');
            el.previousElementSibling?.classList.remove('collapsed');
        } else if (el) {
            el.classList.remove('active');
            el.previousElementSibling?.classList.add('collapsed');
        }
    }
}

// --- Favorites & Modal ---
function openModal() {
    renderFavoritesList();
    // Load Checkboxes
    document.querySelectorAll('#menu-settings-list input[type="checkbox"]').forEach(cb => {
        cb.checked = state.sidebarVisibility[cb.dataset.sectionId] !== false;
    });
    DOM['favorite-modal']?.classList.add('is-active');
}
function closeModal() { DOM['favorite-modal']?.classList.remove('is-active'); }

function addFavorite() {
    const name = document.getElementById('favorite-name-input')?.value.trim();
    const url = document.getElementById('favorite-url-input')?.value.trim();
    if (!name || !url) return alert('이름과 URL을 입력하세요.');
    
    if (state.favorites.some(f => f.name === name || f.url === url)) return alert('중복된 즐겨찾기입니다.');
    
    state.favorites.push({ name, url });
    localStorage.setItem(CONFIG.KEYS.FAVORITES, JSON.stringify(state.favorites));
    
    document.getElementById('favorite-name-input').value = '';
    document.getElementById('favorite-url-input').value = '';
    renderFavoritesList();
    renderCombinedChannels();
}

function deleteFavorite(index) {
    state.favorites.splice(index, 1);
    localStorage.setItem(CONFIG.KEYS.FAVORITES, JSON.stringify(state.favorites));
    renderFavoritesList();
    renderCombinedChannels();
}

function renderFavoritesList() {
    const list = DOM['favorite-list'];
    if (!list) return;
    list.innerHTML = '';
    state.favorites.forEach((fav, i) => {
        const div = document.createElement('div');
        div.className = 'level is-mobile mb-1';
        div.innerHTML = `
            <div class="level-left"><div class="level-item"><span class="is-size-7">${fav.name}: ${fav.url}</span></div></div>
            <div class="level-right"><button class="button is-danger is-small is-delete" data-index="${i}">삭제</button></div>
        `;
        list.appendChild(div);
    });
}

function saveSidebarVisibility() {
    const checkboxes = document.querySelectorAll('#menu-settings-list input[type="checkbox"]');
    checkboxes.forEach(cb => state.sidebarVisibility[cb.dataset.sectionId] = cb.checked);
    localStorage.setItem(CONFIG.KEYS.SIDEBAR_VISIBILITY, JSON.stringify(state.sidebarVisibility));
    loadSidebarVisibility();
    alert('저장되었습니다.');
}

function loadSidebarVisibility() {
    state.sidebarVisibility = JSON.parse(localStorage.getItem(CONFIG.KEYS.SIDEBAR_VISIBILITY)) || {};
    const defaults = { 
        'section-group-competition': true, 'section-group-channels': true, 
        'section-group-layout': true, 'custom-url-container': true, 'section-group-guides': true 
    };
    const settings = { ...defaults, ...state.sidebarVisibility };
    for (const id in settings) {
        const el = document.getElementById(id);
        if (el) el.style.display = settings[id] ? '' : 'none';
    }
}

function applyUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const layout = parseInt(params.get('layout'), 10);
    const channels = [];
    for(let i=1; i<=4; i++) {
        if (params.has(`ch${i}`)) channels.push({ index: i-1, url: params.get(`ch${i}`) });
    }
    
    if (channels.length > 0) {
        setSplitScreen( (!isNaN(layout) && layout>=1 && layout<=4) ? layout : 1 );
        const boxes = DOM['player-container']?.querySelectorAll('.player-box');
        channels.forEach(ch => {
            if (boxes[ch.index]) {
                let url = ch.url, type = 'iframe', finalUrl = transformUrl(url);
                if (url.match(/^[0-9a-fA-F]{32}$/)) { finalUrl=`${CONFIG.CHZZK_PROXY}${url}`; type='m3u8'; }
                else if (finalUrl && (finalUrl.includes(CONFIG.CHZZK_PROXY)||finalUrl.endsWith('.m3u8'))) type='m3u8';
                
                if(finalUrl) loadPlayer(boxes[ch.index], finalUrl, type);
            }
        });
        return true;
    }
    return false;
}
