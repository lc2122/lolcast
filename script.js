// --- 환경 설정 및 상수 ---
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpFTaOvQTeHoPIA4YvvYSnMqHEoAxcelZ_FrJnuuzHoFBWHjxzpde7HfixpuLSg_SbYw/exec';
const CUSTOM_CHANNELS_API_URL = 'https://script.google.com/macros/s/AKfycbwqZiJvKnHDyVc7t10KFWBROCWECpKdgiSKiLnOp8kWnmGonbxe90qF3V9RNelsSA_O/exec';
const CHZZK_PROXY_BASE_URL = 'https://chzzk-api-proxy.hibiya.workers.dev/';
const STORAGE_KEYS = {
    HISTORY: 'lolcastMobileRecentHistory',
    LAYOUT: 'lolcastLayoutRatios',
    NAV_CONFIG: 'lolcastMobileNavConfig',
    CHZZK_PLAYER: 'lolcastChzzkPlayerType',
    FAVORITES: 'favorites',
    MODE: 'layoutMode'
};

// --- 전역 상태 관리 ---
const AppState = {
    playerCount: 1,
    clickIndex: 0,
    previousCustomChannels: [],
    newLiveChannelNames: new Set(),
    youtubeUrlsFromSheet: {},
    lckScheduleData: [],
    customChannelsFromSheet: [],
    favorites: JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [],
    isLandscapeMode: JSON.parse(localStorage.getItem(STORAGE_KEYS.MODE)) || false,
    layoutRatios: { portraitVideo: 50, landscapeVideo: 80 },
    chzzkPlayerType: 'm3u8',
    userNavConfig: [],
    activeNavSortable: null,
    availableNavSortable: null,
    isLaunchingExternalPlayer: false
};

// --- 정적 채널 데이터 ---
const staticSportsChannels = [
    { name: 'SPOTV', url: 'spotv.html', type: 'iframe', className: 'spotv-btn channel-button is-outlined' },
    ...Array.from({ length: 5 }, (_, i) => ({ name: `야${i + 1}`, url: `https://global-media.sooplive.com/live/soopbaseball${i + 1}/master.m3u8`, type: 'm3u8', className: 'baseball-btn channel-button is-outlined' }))
];
const streamerChannels = [
    { name: 'Khh', url: 'khh1111', platform: 'kick' }, { name: '붐', url: 'kdjlc17799', platform: 'kick' },
    { name: 'AC', url: 'neiamok', platform: 'kick' }, { name: '캐린1', url: 'karyn4011', platform: 'kick' },
    { name: '캐린2', url: 'karyn4021', platform: 'kick' }, { name: '캐린3', url: 'arinarintv', platform: 'kick' }
].map(c => ({ ...c, type: 'iframe', className: 'kick-btn channel-button is-outlined' }));

// --- 네비게이션 아이템 정의 ---
const allNavItems = [
    { id: 'split1', label: '1분할', iconClass: 'fas fa-square', default: true, action: () => setSplitScreen(1) },
    { id: 'split2', label: '2분할', iconClass: 'fas fa-th-large', default: true, action: () => setSplitScreen(2) },
    { id: 'split4', label: '4분할', iconClass: 'fas fa-th', default: false, action: () => setSplitScreen(4) },
    { id: 'spotv_nav', label: '스포티비', iconClass: 'fas fa-tv', default: false, action: () => playChannelFromNav('spotv.html') },
    { id: 'pung_nav', label: '풍월량', iconClass: 'fas fa-wind', default: false, action: () => playChannelFromNav('7ce8032370ac5121dcabce7bad375ced') },
    { id: 'separator1', isSeparator: true, default: true },
    { id: 'lck_yt', label: 'LCK', iconClass: 'fab fa-youtube', default: true, action: () => playChannelFromNav(getYouTubeLiveOrUpcoming()) },
    { id: 'lck_chzzk', label: 'LCK', iconClass: 'fab fa-cuttlefish', default: true, action: () => playChannelFromNav('9381e7d6816e6d915a44a13c0195b202') },
    { id: 'refresh', label: 'F5', iconClass: 'fas fa-sync-alt', default: true, action: refreshChat },
    { id: 'hrm', label: '흐름', iconClass: 'fas fa-map', default: false, action: () => window.open('https://insagirl-toto.appspot.com/hrm/?where=1', '_blank') },
    { id: 'separator2', isSeparator: true, default: true },
    { id: 'more', label: '더보기', iconClass: 'fas fa-bars', default: true, action: openControlsModal },
    { id: 'hideNav', label: '숨김', iconClass: 'fas fa-eye-slash', default: true, action: hideNavBar }
];

// --- 초기화 ---
window.onload = initialize;

async function initialize() {
    console.log("[initialize] Start");
    loadSettings();
    cacheDOMElements();
    renderBottomNav();
    setupEventListeners();
    
    setSplitScreen(1);
    updateLayout();
    
    // 데이터 로드
    fetchLckDataFromSheet();
    fetchCustomChannelsFromSheet();
    setInterval(fetchCustomChannelsFromSheet, 60000);
    
    // 네비게이션 에디터 초기화
    initNavEditor();
}

function loadSettings() {
    try {
        const savedRatios = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAYOUT));
        if (savedRatios) AppState.layoutRatios = savedRatios;
        
        const savedType = localStorage.getItem(STORAGE_KEYS.CHZZK_PLAYER);
        if (savedType) AppState.chzzkPlayerType = savedType;

        const savedNav = JSON.parse(localStorage.getItem(STORAGE_KEYS.NAV_CONFIG));
        AppState.userNavConfig = savedNav || allNavItems.filter(item => item.default).map(item => item.id);
        
        // UI 반영
        document.querySelectorAll('input[name="chzzkPlayerType"]').forEach(r => {
            if (r.value === AppState.chzzkPlayerType) r.checked = true;
        });
        
        // 슬라이더 값 반영
        const pSlider = document.getElementById('portrait-ratio-slider');
        const lSlider = document.getElementById('landscape-ratio-slider');
        if(pSlider) {
            pSlider.value = AppState.layoutRatios.portraitVideo;
            document.getElementById('portrait-ratio-value').textContent = AppState.layoutRatios.portraitVideo;
        }
        if(lSlider) {
            lSlider.value = AppState.layoutRatios.landscapeVideo;
            document.getElementById('landscape-ratio-value').textContent = AppState.layoutRatios.landscapeVideo;
        }
        
    } catch (e) { console.error("Settings load failed", e); }
}

function setupEventListeners() {
    // 슬라이더 이벤트
    setupSlider('portrait-ratio');
    setupSlider('landscape-ratio');
    
    // 치지직 플레이어 타입 변경
    document.querySelectorAll('input[name="chzzkPlayerType"]').forEach(r => {
        r.addEventListener('change', (e) => {
            AppState.chzzkPlayerType = e.target.value;
            localStorage.setItem(STORAGE_KEYS.CHZZK_PLAYER, e.target.value);
            showToast('설정이 저장되었습니다.');
        });
    });
    
    // Nav Show 버튼
    document.getElementById('nav-show-btn').addEventListener('click', () => {
        document.getElementById('bottom-nav').classList.remove('is-hidden');
        document.getElementById('nav-show-btn').classList.add('is-hidden');
        updateLayout();
    });
    
    // Input Clear 버튼
    const urlInput = document.getElementById('custom-url-input-modal');
    const clearBtn = document.getElementById('clear-custom-url-btn');
    urlInput.addEventListener('input', () => {
        clearBtn.style.display = urlInput.value ? 'inline-flex' : 'none';
    });
    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        urlInput.focus();
        clearBtn.style.display = 'none';
    });
    
    // 리사이즈 이벤트
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateLayout, 100);
    });
}

function setupSlider(prefix) {
    const slider = document.getElementById(`${prefix}-slider`);
    const minus = document.getElementById(`${prefix}-minus`);
    const plus = document.getElementById(`${prefix}-plus`);
    const display = document.getElementById(`${prefix}-value`);
    
    if(!slider || !minus || !plus) return;
    
    slider.addEventListener('input', () => display.textContent = slider.value);
    minus.addEventListener('click', () => {
        slider.value = Math.max(parseInt(slider.min), parseInt(slider.value) - 1);
        display.textContent = slider.value;
    });
    plus.addEventListener('click', () => {
        slider.value = Math.min(parseInt(slider.max), parseInt(slider.value) + 1);
        display.textContent = slider.value;
    });
}

// --- 핵심 로직: URL 처리 및 플레이어 전략 ---
function resolveMediaSource(inputUrl, explicitType = '') {
    if (!inputUrl) return null;
    let url = inputUrl.trim();
    let type = explicitType || 'iframe'; // 기본값

    // 0. Lolcast 공유 URL 파싱
    if (url.includes('/player/')) {
        const parts = url.split('/player/')[1].split('/');
        if (parts.length >= 2) {
            const platform = parts[0].toLowerCase();
            const id = parts[1].split('?')[0];

            if (platform === 'chzzk') url = `https://chzzk.naver.com/live/${id}`;
            else if (platform === 'afreeca') url = `https://play.sooplive.co.kr/${id}`;
            else if (platform === 'kick') url = `https://kick.com/${id}`;
            else if (platform === 'twitch') url = `https://twitch.tv/${id}`;
            else if (platform === 'youtube') url = `https://youtube.com/watch?v=${id}`;
        }
    }

    // 1. SOOP (숲/아프리카) 처리
    if (url.includes('.sooplive.co') || url.includes('afreeca')) {
        if (isMobileDevice()) {
            return { action: 'external', url: url };
        }
        if (url.includes('.m3u8')) {
            return { action: 'embed', type: 'iframe', url: `chrome-extension://eakdijdofmnclopcffkkgmndadhbjgka/player.html#${url}` }; 
        }
        if (!url.includes('/embed')) {
             const parts = url.split('/');
             const channelId = parts.pop() || parts.pop(); 
             return { action: 'embed', type: 'iframe', url: `https://play.sooplive.co.kr/${channelId}/embed` };
        }
        return { action: 'embed', type: 'iframe', url: url };
    }

    // 2. 치지직 ID 감지 및 설정 적용
    const chzzkIdMatch = url.match(/\/live\/([a-fA-F0-9]{32})/) || url.match(/^([a-fA-F0-9]{32})$/);
    if (chzzkIdMatch) {
        const chzzkId = chzzkIdMatch[1] || chzzkIdMatch[0];
        if (AppState.chzzkPlayerType === 'iframe') {
            return { action: 'embed', type: 'iframe', url: `https://mul.live/${chzzkId}` };
        } else {
            return { action: 'embed', type: 'm3u8', url: chzzkId };
        }
    }

    // 3. M3U8 직접 재생
    if (url.endsWith('.m3u8') || url.includes('chzzk-api-proxy') || explicitType === 'm3u8') {
         return { action: 'embed', type: 'm3u8', url: url };
    }

    // 4. 기타 플랫폼 변환
    const transformed = transformUrl(url);
    return { action: 'embed', type: 'iframe', url: transformed || url };
}

function transformUrl(url) {
    // [중요 수정] 구버전과 동일하게 URL 파라미터 제거 (Error 153 방지)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const vId = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
        // origin, playsinline 파라미터 모두 제거하고 순수 embed URL만 반환
        return vId ? `https://www.youtube.com/embed/${vId[1]}` : url;
    }
    if (url.includes('twitch.tv')) {
        const ch = url.split('/').pop();
        return `https://player.twitch.tv/?channel=${ch}&parent=${window.location.hostname}&parent=lolcast.kr`;
    }
    if (url.includes('kick.com') || url.includes('kick.cx')) {
        const ch = url.split('/').pop();
        return `https://player.kick.cx/${ch}`;
    }
    return url; 
}

async function loadPlayer(box, url, type) {
    while (box.firstChild) box.removeChild(box.firstChild);
    
    if (!url) {
        box.innerHTML = '<div class="has-text-grey is-size-7 p-2">URL 없음</div>';
        return;
    }

    const iframe = document.createElement('iframe');
    // [중요 수정] 구버전의 allow 속성으로 롤백
    iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', ''); // allowfullscreen 속성 유지
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    try {
        if (type === 'm3u8') {
            let finalM3u8 = url;
            if (/^[0-9a-fA-F]{32}$/.test(url)) {
                finalM3u8 = await fetchChzzkM3u8(url);
            }
            iframe.src = `hls_player.html#${encodeURIComponent(finalM3u8)}`;
        } else {
            iframe.src = url;
        }
        box.appendChild(iframe);
    } catch (e) {
        console.error(e);
        box.innerHTML = `<div class="has-text-danger is-size-7 p-2">로드 실패<br>${e.message}</div>`;
    }
}

async function fetchChzzkM3u8(channelId) {
    const res = await fetch(`${CHZZK_PROXY_BASE_URL}live-detail/${channelId}`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    if (!data.content || !data.content.livePlaybackJson) throw new Error('방송 정보 없음');
    const playback = JSON.parse(data.content.livePlaybackJson);
    const media = playback.media.find(m => m.path.includes('master.m3u8'));
    if (!media) throw new Error('Stream Not Found');
    return media.path;
}

// --- 사용자 액션 처리 ---
async function playCustomUrl(inputUrl) {
    if (!inputUrl) return;
    addUrlToHistory(inputUrl);
    
    const source = resolveMediaSource(inputUrl);
    if (!source) return showToast('잘못된 URL입니다.');

    if (source.action === 'external') {
        launchExternalPlayer(source.url);
    } else {
        const boxes = document.querySelectorAll('.player-box');
        if(boxes.length === 0) return;
        const target = boxes[AppState.clickIndex % boxes.length];
        await loadPlayer(target, source.url, source.type);
        AppState.clickIndex++;
        closeControlsModal();
        showToast('채널을 재생합니다.');
    }
}

function playChannelFromNav(url) {
    if (!url) return showToast('재생할 URL이 없습니다.');
    playCustomUrl(url);
}

function launchExternalPlayer(url) {
    if (AppState.isLaunchingExternalPlayer) return;
    AppState.isLaunchingExternalPlayer = true;
    
    try {
        if (/Android/i.test(navigator.userAgent)) {
            const intent = `intent:${url}#Intent;action=android.intent.action.VIEW;type=application/vnd.apple.mpegurl;package=org.videolan.vlc;end`;
            location.href = intent;
        } else {
            location.href = `vlc://${url}`;
        }
        showToast('외부 플레이어를 실행합니다.');
    } catch(e) {
        showToast('외부 앱 실행 실패');
    } finally {
        setTimeout(() => AppState.isLaunchingExternalPlayer = false, 3000);
    }
}

// --- UI 렌더링 ---
function renderChannelList(container, channels, defaultClass, options = {}) {
    if (!container) return;
    container.innerHTML = '';
    const { nameKey = 'name', urlKey = 'url', typeKey = 'type' } = options;

    channels.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = `button is-small ${ch.className || defaultClass}`;
        btn.textContent = ch[nameKey];
        btn.draggable = true;
        
        // 클릭 시 resolveMediaSource를 통해 재생 전략 결정
        btn.onclick = () => {
            const url = ch[urlKey];
            // 시트에서 type이 비어있을 수 있으므로, resolveMediaSource에 위임
            playCustomUrl(url); 
        };
        
        // 드래그 앤 드롭 지원
        btn.ondragstart = (e) => {
            const source = resolveMediaSource(ch[urlKey], ch[typeKey]);
            if (source && source.action === 'embed') {
                e.dataTransfer.setData('text/plain', source.url);
                e.dataTransfer.setData('text/type', source.type);
            }
        };
        container.appendChild(btn);
    });
}

function renderControlsModalLists() {
    renderChannelList(document.getElementById('live-channels-modal'), 
        AppState.customChannelsFromSheet.map(c => ({...c, className: 'button is-small is-link is-outlined'})), 
        ''
    );
    
    const fixedList = [...streamerChannels, ...staticSportsChannels, ...AppState.favorites];
    renderChannelList(document.getElementById('fixed-channels-modal'), fixedList, 'button is-small is-outlined');
    
    renderRecentUrlHistory();
    renderLckSchedule();
    initNavEditor(); // 에디터 갱신
}

function renderLckSchedule() {
    const container = document.getElementById('lck-schedule-modal');
    if(!container) return;
    
    if(!AppState.lckScheduleData.length) {
        container.innerHTML = '<p class="has-text-grey has-text-centered is-size-7">오늘 경기 정보 없음</p>';
        return;
    }
    container.innerHTML = '';
    AppState.lckScheduleData.forEach(match => {
        const div = document.createElement('div');
        div.className = 'is-flex is-justify-content-center py-1';
        div.style.borderBottom = '1px dashed #444';
        // 스타일을 조금 더 예쁘게
        div.innerHTML = `
            <span class="is-size-7 has-text-grey-light mr-2">[${match.time}]</span>
            <span class="is-size-7 has-text-weight-bold">${match.team1}</span>
            <span class="is-size-7 mx-2">vs</span>
            <span class="is-size-7 has-text-weight-bold">${match.team2}</span>
        `;
        container.appendChild(div);
    });
}

// --- 레이아웃 및 기타 ---
function setSplitScreen(count) {
    const area = document.getElementById('video-area');
    area.innerHTML = '';
    AppState.playerCount = count;
    AppState.clickIndex = 0;

    for (let i = 0; i < count; i++) {
        const box = document.createElement('div');
        box.className = 'player-box';
        box.id = `p-${i}`;
        
        // 드롭 핸들러
        box.ondragover = e => e.preventDefault();
        box.ondrop = async e => {
            e.preventDefault();
            const url = e.dataTransfer.getData('text/plain');
            const type = e.dataTransfer.getData('text/type');
            await loadPlayer(box, url, type);
        };
        area.appendChild(box);
    }
    
    // 그리드 스타일 조정
    area.style.gridTemplateColumns = count >= 3 ? '1fr 1fr' : '1fr';
    area.style.gridTemplateRows = count === 2 || count >= 3 ? '1fr 1fr' : '1fr';
    showToast(`${count}분할 모드`);
}

function updateLayout() {
    const main = document.getElementById('main-content');
    const video = document.getElementById('video-area');
    const chat = document.getElementById('chat-area');
    const nav = document.getElementById('bottom-nav');
    
    const navHeight = nav.classList.contains('is-hidden') ? 0 : nav.offsetHeight;
    main.style.height = `${window.innerHeight - navHeight}px`;

    if (AppState.isLandscapeMode) {
        main.style.flexDirection = 'row';
        video.style.width = `${AppState.layoutRatios.landscapeVideo}%`;
        video.style.height = '100%';
        chat.style.width = `${100 - AppState.layoutRatios.landscapeVideo}%`;
        chat.style.height = '100%';
        chat.style.borderLeft = '1px solid #333';
        chat.style.borderTop = 'none';
    } else {
        main.style.flexDirection = 'column';
        video.style.width = '100%';
        video.style.height = `${AppState.layoutRatios.portraitVideo}%`;
        chat.style.width = '100%';
        chat.style.height = `${100 - AppState.layoutRatios.portraitVideo}%`;
        chat.style.borderLeft = 'none';
        chat.style.borderTop = '1px solid #333';
    }
}

function toggleLayoutMode() {
    AppState.isLandscapeMode = !AppState.isLandscapeMode;
    localStorage.setItem(STORAGE_KEYS.MODE, JSON.stringify(AppState.isLandscapeMode));
    document.getElementById('mode-toggle-btn').textContent = AppState.isLandscapeMode ? '세로 모드' : '가로 모드';
    updateLayout();
}

// --- 유틸리티 ---
function isMobileDevice() { return /Mobi|Android/i.test(navigator.userAgent); }

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    
    // 애니메이션
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if(toast.parentNode === container) container.removeChild(toast);
        }, 300);
    }, 2000);
}

function cacheDOMElements() {
    // 필요한 경우 구현
}

function refreshChat() {
    const iframe = document.getElementById('chat-iframe');
    if(iframe) {
        // 캐시 무효화를 위해 쿼리 스트링 추가/갱신
        const src = new URL(iframe.src);
        src.searchParams.set('t', Date.now());
        iframe.src = src.toString();
        showToast('채팅 새로고침');
    }
}

// --- API Fetching ---
async function fetchCustomChannelsFromSheet() {
    try {
        const res = await fetch(`${CUSTOM_CHANNELS_API_URL}?v=${Date.now()}`);
        if(!res.ok) throw new Error();
        const json = await res.json();
        AppState.customChannelsFromSheet = json.data || [];
        
        // 핫 조인 (새로운 채널 감지) 로직
        const newChannels = AppState.customChannelsFromSheet.filter(c => !AppState.previousCustomChannels.some(p => p.name === c.name));
        
        if (newChannels.length > 0) {
            newChannels.forEach(c => AppState.newLiveChannelNames.add(c.name));
            renderBottomNav(); // 버튼 업데이트
            showToast('새로운 라이브 채널이 감지되었습니다!');
        }
        
        AppState.previousCustomChannels = [...AppState.customChannelsFromSheet];
        
        // 모달이 열려있다면 목록 갱신
        if(document.getElementById('controls-modal').classList.contains('is-active')) {
             renderChannelList(document.getElementById('live-channels-modal'), 
                AppState.customChannelsFromSheet.map(c => ({...c, className: 'button is-small is-link is-outlined'})), 
                ''
            );
        }
    } catch(e) { console.warn('Channel fetch failed'); }
}

async function fetchLckDataFromSheet() {
    try {
        const res = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?v=${Date.now()}`);
        const data = await res.json();
        AppState.lckScheduleData = data.lckSchedule || [];
        AppState.youtubeUrlsFromSheet = data.youtubeUrls || {};
    } catch(e) {}
}

// --- 즐겨찾기 및 히스토리 ---
function addFavorite() {
    const name = document.getElementById('favorite-name-input').value.trim();
    const url = document.getElementById('favorite-url-input').value.trim();
    if(name && url) {
        AppState.favorites.push({name, url});
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(AppState.favorites));
        renderControlsModalLists();
        document.getElementById('favorite-name-input').value = '';
        document.getElementById('favorite-url-input').value = '';
        showToast('즐겨찾기 추가됨');
    }
}

function addUrlToHistory(url) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
    history = [url, ...history.filter(u => u !== url)].slice(0, 5);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    renderRecentUrlHistory();
}

function renderRecentUrlHistory() {
    const container = document.getElementById('recent-urls-container');
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
    if(!history.length) { document.getElementById('recent-urls-section').style.display = 'none'; return; }
    
    document.getElementById('recent-urls-section').style.display = 'block';
    container.innerHTML = '';
    history.forEach(url => {
        // URL 길이 제한 (CSS 깨짐 방지)
        const displayUrl = url.length > 40 ? url.substring(0, 37) + '...' : url;

        const div = document.createElement('div');
        div.className = 'field is-grouped mb-1';
        div.innerHTML = `
            <p class="control is-expanded"><button class="button is-small is-light is-fullwidth" title="${url}" style="justify-content:flex-start;">${displayUrl}</button></p>
            <p class="control"><button class="button is-small is-danger is-outlined"><i class="fas fa-times"></i></button></p>
        `;
        div.querySelector('.is-light').onclick = () => playCustomUrl(url);
        div.querySelector('.is-danger').onclick = () => {
            const newHistory = history.filter(u => u !== url);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
            renderRecentUrlHistory();
        };
        container.appendChild(div);
    });
}

// --- 네비게이션 관리 ---
function saveNavConfig() {
    const active = document.getElementById('active-nav-items');
    AppState.userNavConfig = Array.from(active.children).map(el => el.dataset.id);
    localStorage.setItem(STORAGE_KEYS.NAV_CONFIG, JSON.stringify(AppState.userNavConfig));
    renderBottomNav();
    showToast('네비게이션 저장됨');
}

function restoreDefaultNavConfig() {
    AppState.userNavConfig = allNavItems.filter(item => item.default).map(item => item.id);
    localStorage.setItem(STORAGE_KEYS.NAV_CONFIG, JSON.stringify(AppState.userNavConfig));
    renderBottomNav();
    initNavEditor();
    showToast('기본값으로 복원됨');
}

function renderBottomNav() {
    const container = document.querySelector('#bottom-nav .navbar-brand');
    container.innerHTML = '';
    
    let itemsToRender = [...AppState.userNavConfig];
    if (AppState.newLiveChannelNames.size > 0) {
        itemsToRender.unshift('hot-join');
    }

    itemsToRender.forEach(id => {
        if (id === 'hot-join') {
             const btn = document.createElement('a');
             btn.className = 'navbar-item nav-item-live-new';
             btn.innerHTML = '<span class="icon has-text-danger"><i class="fas fa-broadcast-tower"></i></span><span class="is-size-7">LIVE!</span>';
             btn.onclick = () => {
                 const chName = AppState.newLiveChannelNames.values().next().value;
                 const ch = AppState.customChannelsFromSheet.find(c => c.name === chName);
                 if(ch) playCustomUrl(ch.url);
                 AppState.newLiveChannelNames.delete(chName);
                 renderBottomNav();
             };
             container.appendChild(btn);
             return;
        }

        const item = allNavItems.find(i => i.id === id);
        if (!item) return;
        
        if (item.isSeparator) {
            const span = document.createElement('span');
            span.className = 'navbar-item is-flex-shrink-0 has-text-grey-light px-1';
            span.textContent = '|';
            container.appendChild(span);
        } else {
            const a = document.createElement('a');
            a.className = 'navbar-item is-flex-shrink-1 px-2';
            a.innerHTML = `<span class="icon"><i class="${item.iconClass}"></i></span><span class="is-size-7">${item.label}</span>`;
            a.onclick = item.action;
            container.appendChild(a);
        }
    });
}

function initNavEditor() {
    const activeContainer = document.getElementById('active-nav-items');
    const availableContainer = document.getElementById('available-nav-items');
    if (!activeContainer || !availableContainer) return;
    
    activeContainer.innerHTML = '';
    availableContainer.innerHTML = '';

    const activeIds = new Set(AppState.userNavConfig);
    
    allNavItems.forEach(item => {
        if(item.isSeparator) return;
        
        const div = document.createElement('div');
        div.className = 'nav-item-editor';
        div.dataset.id = item.id;
        const isActive = activeIds.has(item.id);
        
        div.innerHTML = `
            <span class="nav-item-label"><i class="${item.iconClass}"></i> ${item.label}</span>
            <span class="action-button ${isActive ? 'remove' : 'add'}">
                <i class="fas ${isActive ? 'fa-minus-circle' : 'fa-plus-circle'}"></i>
            </span>
        `;
        
        if(isActive) activeContainer.appendChild(div);
        else availableContainer.appendChild(div);
    });

    // SortableJS 재초기화
    if(AppState.activeNavSortable) AppState.activeNavSortable.destroy();
    if(AppState.availableNavSortable) AppState.availableNavSortable.destroy();

    const opts = { group: 'nav', animation: 150, ghostClass: 'sortable-ghost' };
    AppState.activeNavSortable = new Sortable(activeContainer, opts);
    AppState.availableNavSortable = new Sortable(availableContainer, opts);
}

// --- 기타 UI 헬퍼 ---
function openControlsModal() { document.getElementById('controls-modal').classList.add('is-active'); renderControlsModalLists(); }
function closeControlsModal() { document.getElementById('controls-modal').classList.remove('is-active'); }
function hideNavBar() { document.getElementById('bottom-nav').classList.add('is-hidden'); document.getElementById('nav-show-btn').classList.remove('is-hidden'); updateLayout(); }

function switchTab(e, tabId) {
    document.querySelectorAll('.tabs li').forEach(li => li.classList.remove('is-active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
    e.currentTarget.parentElement.classList.add('is-active');
    document.getElementById(tabId).style.display = 'block';
}

function toggleSection(header, sectionId) {
    const section = document.getElementById(sectionId);
    const isClosed = section.style.display === 'none';
    
    // 아코디언 효과 (하나만 열기) - 원치 않으면 이 부분 제거
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.toggle-header').forEach(h => h.classList.add('collapsed'));
    
    if(isClosed) {
        section.style.display = 'block';
        header.classList.remove('collapsed');
    }
}

function saveLayoutRatios() {
    const pSlider = document.getElementById('portrait-ratio-slider');
    const lSlider = document.getElementById('landscape-ratio-slider');
    AppState.layoutRatios = {
        portraitVideo: parseInt(pSlider.value),
        landscapeVideo: parseInt(lSlider.value)
    };
    localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(AppState.layoutRatios));
    updateLayout();
    showToast('비율이 저장되었습니다.');
}

function getYouTubeLiveOrUpcoming() {
    const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Seoul'});
    return AppState.youtubeUrlsFromSheet[today]?.url || null;
}

function playCustomUrlModal() { 
    playCustomUrl(document.getElementById('custom-url-input-modal').value); 
}
