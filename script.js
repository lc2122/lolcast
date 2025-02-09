const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '숙제1',
        color: '#FF0000',
        url: (id) => `https://www.youtube.com/embed/live_stream?channel=${id}`
    },
    forest: {
        buttonLabel: '숙제2',
        color: '#00aaff',
        url: () => 'https://play.sooplive.co.kr/aflol/embed'
    },
    flow: {
        buttonLabel: 'flow',
        color: '#00FFA3',
        url: () => 'https://insagirl.github.io/syncwatchdemo/syncwatch2.html'
    }
};

const videoSection = document.getElementById('video-section');
const videoIframe = document.getElementById('video-iframe');
const youtubeBtn = document.getElementById('youtube-btn');
const forestBtn = document.getElementById('forest-btn');
const flowBtn = document.getElementById('flow-btn');
const inputBtn = document.getElementById('input-btn');
const goBtn = document.getElementById('go-btn');
const closeBtn = document.getElementById('close-btn');
const inputModal = document.getElementById('input-modal');
const multiviewCheckbox = document.getElementById('multiview-checkbox');
const singleUrlInputContainer = document.getElementById('single-url-input-container');
const urlInput = document.getElementById('url-input');
const multiviewOptions = document.getElementById('multiview-options');
const multiviewLayoutSelect = document.getElementById('multiview-layout-select');
const multiviewUrlInputs = document.getElementById('multiview-url-inputs');

// 멀티뷰 관련 상태 관리
let currentMultiviewLayout = 1;
let multiviewUrlInputCounter = 0;

// YouTube 버튼 클릭 시
youtubeBtn.addEventListener('click', () => {
    setSingleViewContent(CHANNELS.youtube.url(CHANNELS.youtube.id));
});

// 숲 버튼 클릭 시
forestBtn.addEventListener('click', () => {
    setSingleViewContent(CHANNELS.forest.url());
});

// flow 버튼 클릭 시
flowBtn.addEventListener('click', () => {
    setSingleViewContent(CHANNELS.flow.url());
});

// "Input" 버튼 클릭 시
inputBtn.addEventListener('click', () => {
    inputModal.style.display = 'block';
    // 모달 열 때 단일 뷰 모드로 설정
    multiviewCheckbox.checked = false;
    showSingleInput();
});

// 멀티뷰 체크박스 변경 시
multiviewCheckbox.addEventListener('change', () => {
    if (multiviewCheckbox.checked) {
        showMultiviewOptions();
    } else {
        showSingleInput();
    }
});

// 멀티뷰 레이아웃 선택 변경 시
multiviewLayoutSelect.addEventListener('change', () => {
    currentMultiviewLayout = parseInt(multiviewLayoutSelect.value);
    updateMultiviewUrlInputs();
});

// "멀티뷰 URL 추가" 버튼 클릭 시
addMultiviewUrlBtn.addEventListener('click', () => {
    addMultiviewInput();
});

// "Go" 버튼 클릭 시
goBtn.addEventListener('click', () => {
    if (multiviewCheckbox.checked) {
        startMultiview();
    } else {
        startSingleView();
    }
    inputModal.style.display = 'none';
});

// "X" 버튼 클릭 시 입력창 닫기
closeBtn.addEventListener('click', () => {
    inputModal.style.display = 'none';
});

// 멀티뷰 관련 함수
function showSingleInput() {
    singleUrlInputContainer.style.display = 'block';
    multiviewOptions.style.display = 'none';
    urlInput.value = '';
}

function showMultiviewOptions() {
    singleUrlInputContainer.style.display = 'none';
    multiviewOptions.style.display = 'block';
    // 멀티뷰 옵션 표시될 때 입력 필드 초기화 및 생성
    multiviewUrlInputs.innerHTML = '';
    multiviewUrlInputCounter = 0;
    for (let i = 0; i < currentMultiviewLayout; i++) {
        addMultiviewInput();
    }
}

function updateMultiviewUrlInputs() {
    const currentInputs = multiviewUrlInputs.querySelectorAll('.multiview-input');
    const diff = currentMultiviewLayout - currentInputs.length;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            addMultiviewInput();
        }
    } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) {
            if (multiviewUrlInputs.lastChild) {
                multiviewUrlInputs.removeChild(multiviewUrlInputs.lastChild);
                multiviewUrlInputCounter--;
            }
        }
    }
}

function addMultiviewInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'multiview-input';
    input.placeholder = `URL ${multiviewUrlInputCounter + 1}`;
    multiviewUrlInputs.appendChild(input);
    multiviewUrlInputCounter++;
}

function startSingleView() {
    const url = urlInput.value.trim();
    setSingleViewContent(url);
}

function setSingleViewContent(url) {
    const transformedUrl = transformUrl(url);
    if (transformedUrl) {
        if (transformedUrl.endsWith('.m3u8')) {
            videoIframe.src = getPlayerUrl(transformedUrl);
        } else {
            videoIframe.src = transformedUrl;
        }
    }
}

function startMultiview() {
    const inputs = multiviewUrlInputs.querySelectorAll('.multiview-input');
    const urls = Array.from(inputs).map(input => input.value.trim());
    videoSection.innerHTML = `<div class="multiview-container" style="grid-template-columns: repeat(${getMultiviewColumns(currentMultiviewLayout)}, 1fr);">${urls.map(url => `<div class="multiview-item"><iframe src="${transformUrl(url) || ''}" frameborder="0" allowfullscreen></iframe></div>`).join('')}</div>`;
}

function getMultiviewColumns(layout) {
    return layout > 2 ? 2 : layout;
}

function getPlayerUrl(m3u8Url) {
    const ua = navigator.userAgent;
    if (/Chrome/i.test(ua) && !/Whale/i.test(ua) && !/Edg/i.test(ua)) {
        return `chrome-extension://eakdijdofmnclopcffkkgmndadhbjgka/player.html#${m3u8Url}`;
    } else {
        return `https://www.livereacting.com/tools/hls-player-embed?url=${encodeURIComponent(m3u8Url)}`;
    }
}

// 즐겨찾기 목록을 저장할 배열
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// 즐겨찾기 목록 표시 함수
function renderFavorites() {
    const favoriteModal = document.getElementById('favorite-modal');
    const favoriteList = document.getElementById('favorite-list');

    // 기존 목록 초기화
    favoriteList.innerHTML = '';

    // 즐겨찾기 목록을 동적으로 추가
    favorites.forEach((favorite, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${favorite.name}</span>
            <button onclick="deleteFavorite(${index})">삭제</button>
        `;
        li.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                const transformedUrl = transformUrl(favorite.url);
                if (transformedUrl) {
                    videoIframe.src = transformedUrl;
                    favoriteModal.style.display = 'none'; // 모달 닫기
                }
            }
        });
        favoriteList.appendChild(li);
    });

    // 모달 표시
    favoriteModal.style.display = 'block';
}

// '즐찾' 버튼 클릭 시 즐겨찾기 목록 표시
const favoriteBtn = document.getElementById('favorite-btn');
favoriteBtn.addEventListener('click', () => {
    renderFavorites();
});

// '닫기' 버튼 클릭 시 모달 닫기
const closeFavoriteModal = document.getElementById('close-favorite-modal');
closeFavoriteModal.addEventListener('click', () => {
    document.getElementById('favorite-modal').style.display = 'none';
});

// 즐겨찾기 추가 함수
function addFavorite(url, name) {
    if (!url || !name) {
        alert('URL과 이름을 입력해주세요.');
        return;
    }

    // 중복 체크
    if (favorites.some(fav => fav.url === url)) {
        alert('이미 등록된 URL입니다.');
        return;
    }

    // 즐겨찾기에 추가
    favorites.push({ url, name });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('즐겨찾기에 추가되었습니다.');

    // 목록 새로고침
    renderFavorites();

    // 입력 필드 초기화
    document.getElementById('favorite-name-input').value = '';
    document.getElementById('favorite-url-input').value = '';
}

// 즐겨찾기 삭제 함수
function deleteFavorite(index) {
    if (confirm('정말로 삭제하시겠습니까?')) {
        favorites.splice(index, 1); // 해당 항목 삭제
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites(); // 목록 새로고침
    }
}

// '추가' 버튼 클릭 시 즐겨찾기 추가
const addFavoriteBtn = document.getElementById('add-favorite-btn');
addFavoriteBtn.addEventListener('click', () => {
    const url = document.getElementById('favorite-url-input').value.trim();
    const name = document.getElementById('favorite-name-input').value.trim();
    addFavorite(url, name);
});

function transformUrl(url) {
    if (!url) {
        alert('URL을 입력해주세요.');
        return;
    }

    // 축약된 형식인지 확인 (예: youtube/id, twitch/id)
    const isShortForm = /^(youtube|twitch|chzzk|kick|afreeca)\/[^\/]+$/.test(url);

    if (isShortForm) {
        const [platform, channelId] = url.split('/');
        switch (platform) {
            case 'youtube':
                return `https://www.youtube.com/embed/${channelId}`;
            case 'twitch':
                return `https://player.twitch.tv/?channel=${channelId}&parent=lc2122.github.io`;
            case 'chzzk':
                return `https://chzzk.naver.com/live/${channelId}`;
            case 'kick':
                return `https://player.kick.com/${channelId}`;
            case 'afreeca':
                return `https://play.sooplive.co.kr/${channelId}/embed`;
            default:
                alert('지원하지 않는 플랫폼입니다.');
                return;
        }
    }

    // 기존의 전체 URL 처리 로직
    if (!url.startsWith('http')) {
        alert('유효한 URL을 입력해주세요.');
        return;
    }
    if (url.endsWith('.m3u8')) {
        return url;
    }
    // YouTube
    if (url.startsWith('https://lolcast.kr/#/player/youtube/')) {
        const channelId = url.split('/').pop();
        return `https://www.youtube.com/embed/${channelId}`;
    }


    // 추가된 로직: 유튜브 주소 형식 처리 (기존 로직 유지)
    if (url.includes('youtu.be') || url.includes('youtube.com/watch?v=')) {
        const videoIdMatch1 = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        const videoIdMatch2 = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        const videoId = (videoIdMatch1 && videoIdMatch1[1]) || (videoIdMatch2 && videoIdMatch2[1]);
        if (videoId) { // videoId가 null 또는 undefined가 아닐 때만 반환
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }

    // 추가된 로직: 직접 플랫폼 주소 처리
    if (url.startsWith('https://twitch.tv/')) {
        const channelId = url.split('/').pop();
        return `https://player.twitch.tv/?channel=${channelId}&parent=lc2122.github.io`;
    }
    else if (url.startsWith('https://chzzk.naver.com/live/')) {
        const channelId = url.split('/').pop();
        return `https://chzzk.naver.com/live/${channelId}`;
    }
    // 추가된 CHZZK 로직: https://chzzk.naver.com/id 처리
    else if (url.startsWith('https://chzzk.naver.com/')) {
        const channelId = url.split('/').pop();
        return `https://chzzk.naver.com/live/${channelId}`;
    }
    else if (url.startsWith('https://kick.com/')) {
        const channelId = url.split('/').pop();
        return `https://player.kick.com/${channelId}`;
    }
    else if (url.startsWith('https://play.sooplive.co.kr/')) {
        const channelId = url.split('/').pop();
        return `https://play.sooplive.co.kr/${channelId}/embed`;
    }

    // Twitch (lolcast.kr) - 기존 로직 유지
    else if (url.startsWith('https://lolcast.kr/#/player/twitch/')) {
        const channelId = url.split('/').pop();
        return `https://player.twitch.tv/?channel=${channelId}&parent=lc2122.github.io`;
    }
    // CHZZK (lolcast.kr) - 기존 로직 유지
    else if (url.startsWith('https://lolcast.kr/#/player/chzzk/')) {
        const channelId = url.split('/').pop();
        return `https://chzzk.naver.com/live/${channelId}`;
    }
    // Kick (lolcast.kr) - 기존 로직 유지
    else if (url.startsWith('https://lolcast.kr/#/player/kick/')) {
        const channelId = url.split('/').pop();
        return `https://player.kick.com/${channelId}`;
    }
    // AfreecaTV (lolcast.kr) - 기존 로직 유지
    else if (url.startsWith('https://lolcast.kr/#/player/afreeca/')) {
        const channelId = url.split('/').pop();
        return `https://play.sooplive.co.kr/${channelId}/embed`;
    }
    // 일반 HTTPS 링크 처리 추가
    else if (url.startsWith('https://')) {
        // 유효한 HTTPS 링크라면 그대로 반환
        return url;
    }
    // 기타 지원하지 않는 URL - 기존 로직 유지
    else {
        alert('지원하지 않는 URL 형식입니다.');
    }
}

// Load Twitch channel
function loadTwitchChannel() {
    const hash = window.location.hash;
    if (hash.startsWith('#/twitch/')) {
        const channelId = hash.split('/')[2];
        const twitchUrl = `https://player.twitch.tv/?channel=${channelId}&parent=lc2122.github.io`;
        videoIframe.src = twitchUrl;
    }
}

// Load YouTube channel
function loadYouTubeChannel() {
    const hash = window.location.hash;
    if (hash.startsWith('#/youtube/')) {
        const channelId = hash.split('/')[2];
        const youtubeUrl = `https://www.youtube.com/embed/${channelId}`;
        videoIframe.src = youtubeUrl;
    }
}

// Load CHZZK channel
function loadCHZZKChannel() {
    const hash = window.location.hash;
    if (hash.startsWith('#/chzzk/')) {
        const channelId = hash.split('/')[2];
        const chzzkUrl = `https://chzzk.naver.com/live/${channelId}`;
        videoIframe.src = chzzkUrl;
    }
}

// Load SOOP channel
function loadSOOPChannel() {
    const hash = window.location.hash;
    if (hash.startsWith('#/soop/')) {
        const channelId = hash.split('/')[2];
        const soopUrl = `https://play.sooplive.co.kr/${channelId}/embed`;
        videoIframe.src = soopUrl;
    }
}

// Load Kick channel
function loadKickChannel() {
    const hash = window.location.hash;
    if (hash.startsWith('#/kick/')) {
        const channelId = hash.split('/')[2];
        const kickUrl = `https://player.kick.com/${channelId}`;
        videoIframe.src = kickUrl;
    }
}

// Initial load
window.addEventListener('load', () => {
    videoIframe.src = CHANNELS.flow.url();
    loadTwitchChannel();
    loadYouTubeChannel();
    loadCHZZKChannel();
    loadSOOPChannel();
    loadKickChannel();
});

