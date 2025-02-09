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
const addMultiviewUrlBtn = document.getElementById('add-multiview-url-btn');

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

// 즐겨찾기 기능
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
const favoriteBtn = document.getElementById('favorite-btn');
const favoriteModal = document.getElementById('favorite-modal');
const closeFavoriteModal = document.getElementById('close-favorite-modal');
const favoriteList = document.getElementById('favorite-list');
const favoriteMultiviewCheckbox = document.getElementById('favorite-multiview-checkbox');
const favoriteSingleUrlInputContainer = document.getElementById('favorite-single-url-input-container');
const favoriteUrlInput = document.getElementById('favorite-url-input');
const favoriteMultiviewOptions = document.getElementById('favorite-multiview-options');
const favoriteMultiviewLayoutSelect = document.getElementById('favorite-multiview-layout-select');
const favoriteMultiviewUrlInputs = document.getElementById('favorite-multiview-url-inputs');
const addFavoriteBtn = document.getElementById('add-favorite-btn');
const addFavoriteMultiviewUrlBtn = document.getElementById('add-favorite-multiview-url-btn');
const favoriteNameInput = document.getElementById('favorite-name-input');

let currentFavoriteMultiviewLayout = 1;
let favoriteMultiviewUrlCounter = 0;

favoriteBtn.addEventListener('click', () => {
    renderFavorites();
    favoriteModal.style.display = 'block';
    // 모달 열 때 단일 뷰 모드로 설정
    favoriteMultiviewCheckbox.checked = false;
    showFavoriteSingleInput();
});

closeFavoriteModal.addEventListener('click', () => {
    favoriteModal.style.display = 'none';
});

favoriteMultiviewCheckbox.addEventListener('change', () => {
    if (favoriteMultiviewCheckbox.checked) {
        showFavoriteMultiviewOptions();
    } else {
        showFavoriteSingleInput();
    }
});

favoriteMultiviewLayoutSelect.addEventListener('change', () => {
    currentFavoriteMultiviewLayout = parseInt(favoriteMultiviewLayoutSelect.value);
    updateFavoriteMultiviewUrlInputs();
});

addFavoriteMultiviewUrlBtn.addEventListener('click', () => {
    addFavoriteMultiviewInput();
});

addFavoriteBtn.addEventListener('click', () => {
    const name = favoriteNameInput.value.trim();
    if (favoriteMultiviewCheckbox.checked) {
        const urls = Array.from(favoriteMultiviewUrlInputs.querySelectorAll('.favorite-multiview-url-input')).map(input => input.value.trim()).filter(url => url !== '');
        addFavorite({ name: name, urls: urls, isMultiview: true, layout: currentFavoriteMultiviewLayout });
    } else {
        const url = favoriteUrlInput.value.trim();
        addFavorite({ name: name, url: url, isMultiview: false });
    }
});

function showFavoriteSingleInput() {
    favoriteSingleUrlInputContainer.style.display = 'block';
    favoriteMultiviewOptions.style.display = 'none';
    favoriteUrlInput.value = '';
}

function showFavoriteMultiviewOptions() {
    favoriteSingleUrlInputContainer.style.display = 'none';
    favoriteMultiviewOptions.style.display = 'block';
    favoriteMultiviewUrlInputs.innerHTML = '';
    favoriteMultiviewUrlCounter = 0;
    for (let i = 0; i < currentFavoriteMultiviewLayout; i++) {
        addFavoriteMultiviewInput();
    }
}

function updateFavoriteMultiviewUrlInputs() {
    const currentInputs = favoriteMultiviewUrlInputs.querySelectorAll('.favorite-multiview-url-input');
    const diff = currentFavoriteMultiviewLayout - currentInputs.length;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            addFavoriteMultiviewInput();
        }
    } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) {
            if (favoriteMultiviewUrlInputs.lastChild) {
                favoriteMultiviewUrlInputs.removeChild(favoriteMultiviewUrlInputs.lastChild);
                favoriteMultiviewUrlCounter--;
            }
        }
    }
}

function addFavoriteMultiviewInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'favorite-multiview-url-input';
    input.placeholder = `URL ${favoriteMultiviewUrlCounter + 1}`;
    favoriteMultiviewUrlInputs.appendChild(input);
    favoriteMultiviewUrlCounter++;
}

function addFavorite(fav) {
    if (!fav.name || (!fav.isMultiview && !fav.url) || (fav.isMultiview && fav.urls.length === 0)) {
        alert('이름과 URL을 모두 입력해주세요.');
        return;
    }
    favorites.push(fav);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
    favoriteNameInput.value = '';
    if (!fav.isMultiview) favoriteUrlInput.value = ''; else favoriteMultiviewUrlInputs.innerHTML = '';
}

function deleteFavorite(index) {
    if (confirm('정말로 삭제하시겠습니까?')) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }
}

function renderFavorites() {
    favoriteList.innerHTML = '';
    favorites.forEach((fav, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${fav.name}</span><button onclick="deleteFavorite(${index})">삭제</button>`;
        li.addEventListener('click', () => {
            favoriteModal.style.display = 'none';
            if (fav.isMultiview) {
                videoSection.innerHTML = `<div class="multiview-container" style="grid-template-columns: repeat(${getMultiviewColumns(fav.layout)}, 1fr);">${fav.urls.map(url => `<div class="multiview-item"><iframe src="${transformUrl(url) || ''}" frameborder="0" allowfullscreen></iframe></div>`).join('')}</div>`;
            } else {
                setSingleViewContent(fav.url);
            }
        });
        favoriteList.appendChild(li);
    });
}

// URL 변환 함수 (기존과 동일)
function transformUrl(url) {
    if (!url) return null;
    const isShortForm = /^(youtube|twitch|chzzk|kick|afreeca)\/[^\/]+$/.test(url);
    if (isShortForm) {
        const [platform, channelId] = url.split('/');
        switch (platform) {
            case 'youtube': return `https://www.youtube.com/embed/${channelId}`;
            case 'twitch': return `https://player.twitch.tv/?channel=${channelId}&parent=lc2122.github.io`;
            case 'chzzk': return `https://chzzk.naver.com/live/${channelId}`;
            case 'kick': return `https://player.kick.com/${channelId}`;
            case 'afreeca': return `https://play.sooplive.co.kr/${channelId}/embed`;
            default: alert('지원하지 않는 플랫폼입니다.'); return null;
        }
    }
    if (!url.startsWith('http')) { alert('유효한 URL을 입력해주세요.'); return null; }
    if (url.endsWith('.m3u8')) return url;
    if (url.startsWith('https://lolcast.kr/#/player/youtube/')) return `https://www.youtube.com/embed/${url.split('/').pop()}`;
    if (url.includes('youtu.be') || url.includes('youtube.com/watch?v=')) { const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/); if (match) return `https://www.youtube.com/embed/${match[1]}`; }
    if (url.startsWith('https://twitch.tv/')) return `https://player.twitch.tv/?channel=${url.split('/').pop()}&parent=lc2122.github.io`;
    if (url.startsWith('https://chzzk.naver.com/live/') || url.startsWith('https://chzzk.naver.com/')) return `https://chzzk.naver.com/live/${url.split('/').pop()}`;
    if (url.startsWith('https://kick.com/')) return `https://player.kick.com/${url.split('/').pop()}`;
    if (url.startsWith('https://play.sooplive.co.kr/')) return `https://play.sooplive.co.kr/${url.split('/').pop()}/embed`;
    if (url.startsWith('https://')) return url;
    alert('지원하지 않는 URL 형식입니다.'); return null;
}

// 초기 로드 및 해시 처리 (기존과 거의 동일)
window.addEventListener('load', () => {
    videoIframe.src = CHANNELS.flow.url();
    const hash = window.location.hash;
    if (hash.startsWith('#/twitch/')) setSingleViewContent(`https://player.twitch.tv/?channel=${hash.split('/')[2]}&parent=lc2122.github.io`);
    else if (hash.startsWith('#/youtube/')) setSingleViewContent(`https://www.youtube.com/embed/${hash.split('/')[2]}`);
    else if (hash.startsWith('#/chzzk/')) setSingleViewContent(`https://chzzk.naver.com/live/${hash.split('/')[2]}`);
    else if (hash.startsWith('#/soop/')) setSingleViewContent(`https://play.sooplive.co.kr/${hash.split('/')[2]}/embed`);
    else if (hash.startsWith('#/kick/')) setSingleViewContent(`https://player.kick.com/${hash.split('/')[2]}`);
    renderFavorites();
});
