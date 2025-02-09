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

// 숙제1 버튼 클릭 시
youtubeBtn.addEventListener('click', () => {
    setSingleViewContent(CHANNELS.youtube.url(CHANNELS.youtube.id));
    multiviewCheckbox.checked = false; // Switch to single view mode
});

// 숲 버튼 클릭 시
forestBtn.addEventListener('click', () => {
    setSingleViewContent(CHANNELS.forest.url());
    multiviewCheckbox.checked = false; // Switch to single view mode
});

// flow 버튼 클릭 시
flowBtn.addEventListener('click', () => {
    setSingleViewContent(CHANNELS.flow.url());
    multiviewCheckbox.checked = false; // Switch to single view mode
});

// '입력' 버튼 클릭 시
inputBtn.addEventListener('click', () => {
    inputModal.style.display = 'block';
    multiviewCheckbox.checked = false; // Switch to single view mode
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

// "Go" 버튼 클릭 시
goBtn.addEventListener('click', () => {
    if (!multiviewCheckbox.checked) { // If '멀티뷰 사용' is not checked
        startSingleView();
    } else {
        startMultiview();
    }
    inputModal.style.display = 'none'; // 입력 모달 닫기
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

// 멀티뷰 시작 함수
function startMultiview() {
    const inputs = multiviewUrlInputs.querySelectorAll('.multiview-input');
    const urls = Array.from(inputs).map(input => input.value.trim()).filter(Boolean); // 빈 URL 제외
    if (urls.length === 0) {
        alert('하나 이상의 URL을 입력해주세요.');
        return;
    }

    // 멀티뷰 그리드 레이아웃 생성
    videoSection.innerHTML = `
        <div class="multiview-container" style="display: grid; grid-template-columns: repeat(${getMultiviewColumns(currentMultiviewLayout)}, 1fr); gap: 10px;">
            ${urls
                .map(url => `<div class="multiview-item"><iframe src="${transformUrl(url)}" frameborder="0" allowfullscreen></iframe></div>`)
                .join('')}
        </div>
    `;
}

// 단일 뷰 시작 함수
function startSingleView() {
    const url = urlInput.value.trim();
    if (url) {
        setSingleViewContent(url);
    } else {
        alert('URL을 입력해주세요.');
    }
}

// 단일 뷰 설정 함수
function setSingleViewContent(url) {
    const transformedUrl = transformUrl(url);
    if (transformedUrl) {
        if (transformedUrl.endsWith('.m3u8')) {
            // HLS 스트림 URL 처리
            videoIframe.src = getPlayerUrl(transformedUrl);
        } else {
            // 일반 URL 처리
            videoIframe.src = transformedUrl;
        }
    } else {
        alert('유효한 URL을 입력해주세요.');
    }
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
    if (url.startsWith('https://lolcast.kr/#/player/twitch/')) return `https://player.twitch.tv/?channel=${url.split('/').pop()}&parent=lc2122.github.io`;
    if (url.startsWith('https://lolcast.kr/#/player/chzzk/')) return `https://chzzk.naver.com/live/${url.split('/').pop()}`;
    if (url.startsWith('https://lolcast.kr/#/player/kick/')) return `https://player.kick.com/${url.split('/').pop()}`;
    if (url.startsWith('https://lolcast.kr/#/player/afreeca/')) return `https://play.sooplive.co.kr/${url.split('/').pop()}/embed`;
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
});
