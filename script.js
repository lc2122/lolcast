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

const videoIframe = document.getElementById('video-iframe');
const youtubeBtn = document.getElementById('youtube-btn');
const forestBtn = document.getElementById('forest-btn');
const flowBtn = document.getElementById('flow-btn');
const inputBtn = document.getElementById('input-btn');
const goBtn = document.getElementById('go-btn');
const urlInput = document.getElementById('url-input');

// YouTube 버튼 클릭 시
youtubeBtn.addEventListener('click', () => {
    const youtubeUrl = CHANNELS.youtube.url(CHANNELS.youtube.id);
    videoIframe.src = youtubeUrl;
    handleFallback();
});

// 숲 버튼 클릭 시
forestBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.forest.url();
});

// flow 버튼 클릭 시
flowBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.flow.url();
});

// "Input" 버튼 클릭 시
inputBtn.addEventListener('click', () => {
    document.getElementById('input-modal').style.display = 'block';
});

function getPlayerUrl(m3u8Url) {
  const ua = navigator.userAgent;
  console.log("User Agent:", ua);

  // Chrome 브라우저인지 확인 (Whale, Edge 제외)
  if (/Chrome/i.test(ua) && !/Whale/i.test(ua) && !/Edg/i.test(ua)) {
    // 크롬 브라우저인 경우
    return `chrome-extension://eakdijdofmnclopcffkkgmndadhbjgka/player.html#${m3u8Url}`;
  } else {
    // 그 외의 경우 (Whale, Edge, Firefox 등)
    return `https://www.livereacting.com/tools/hls-player-embed?url=${encodeURIComponent(m3u8Url)}`;
  }
}

goBtn.addEventListener('click', () => {
  const userInput = urlInput.value.trim();
  const transformedUrl = transformUrl(userInput);

  if (transformedUrl) {
    if (!transformedUrl.startsWith('http')) {
      alert('유효한 URL을 입력해주세요.');
      return;
    }
    if (transformedUrl.endsWith('.m3u8')) {
      const playerUrl = getPlayerUrl(transformedUrl);
      videoIframe.src = playerUrl;
    } else {
      videoIframe.src = transformedUrl;
    }
    
    localStorage.setItem('lastInputValue', userInput);
    urlInput.value = '';
    document.getElementById('input-modal').style.display = 'none';
  }
});

// "X" 버튼 클릭 시 입력창 닫기
const closeBtn = document.getElementById('close-btn');
closeBtn.addEventListener('click', () => {
    document.getElementById('input-modal').style.display = 'none';
});

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

// 멀티뷰 관련 변수
let multiviewLayout = 1;
let multiviewUrls = [];
let isMultiviewMode = false;

// 멀티뷰 모드 토글 함수
function toggleMultiview() {
    isMultiviewMode = !isMultiviewMode;
    const videoSection = document.querySelector('.video-section');
    
    if(isMultiviewMode) {
        videoSection.innerHTML = `
            <div class="multiview-container" id="multiview-container">
                ${Array(multiviewLayout).fill('<div class="multiview-item"><iframe></iframe></div>').join('')}
            </div>
        `;
        updateMultiviewLayout();
        loadMultiviewContents();
    } else {
        videoSection.innerHTML = '<iframe id="video-iframe" src="" frameborder="0" allowfullscreen></iframe>';
    }
}

// 멀티뷰 레이아웃 업데이트 함수
function updateMultiviewLayout() {
    const container = document.getElementById('multiview-container');
    if(!container) return;

    switch(multiviewLayout) {
        case 1:
            container.style.gridTemplate = '1fr';
            break;
        case 2:
            container.style.gridTemplateColumns = '1fr 1fr';
            break;
        case 3:
            container.style.gridTemplate = 'repeat(2, 1fr) / repeat(2, 1fr)';
            break;
        case 4:
            container.style.gridTemplate = 'repeat(2, 1fr) / repeat(2, 1fr)';
            break;
    }
}

// 멀티뷰 컨텐츠 로드 함수
function loadMultiviewContents() {
    const items = document.querySelectorAll('.multiview-item');
    items.forEach((item, index) => {
        const url = multiviewUrls[index] || '';
        item.querySelector('iframe').src = transformUrl(url) || '';
    });
}

// 멀티뷰 모달 관련 이벤트 리스너
document.querySelectorAll('.multiview-layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        multiviewLayout = parseInt(btn.dataset.layout);
        document.querySelectorAll('.multiview-layout-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateUrlInputs();
    });
});

function updateUrlInputs() {
    const container = document.getElementById('multiview-url-inputs');
    container.innerHTML = '';
    for(let i = 0; i < multiviewLayout; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'multiview-url-input';
        input.placeholder = `URL ${i + 1}`;
        input.value = multiviewUrls[i] || '';
        container.appendChild(input);
    }
}

document.getElementById('start-multiview-btn').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.multiview-url-input');
    multiviewUrls = Array.from(inputs).map(input => input.value.trim());
    document.getElementById('multiview-modal').style.display = 'none';
    if(isMultiviewMode) toggleMultiview();
    toggleMultiview();
});

document.getElementById('close-multiview-btn').addEventListener('click', () => {
    document.getElementById('multiview-modal').style.display = 'none';
});

// 즐겨찾기 모달 수정 (멀티뷰 체크박스 추가)
document.getElementById('favorite-modal').innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center;">
    <h3>즐겨찾기 목록</h3>
    <div style="margin-bottom: 10px;">
      <label>
        <input type="checkbox" id="multiview-checkbox"> 멀티뷰 모드
      </label>
    </div>
    <input
      type="text"
      id="favorite-name-input"
      placeholder="이름 입력"
      class="favorite-input"
      style="flex: 1;"
    />
    <div class="input-row">
      <input
        type="text"
        id="favorite-url-input"
        placeholder="주소 입력"
        class="favorite-input"
      />
    </div>
    <button id="add-favorite-btn" class="menu-button">추가</button>
    <ul id="favorite-list" style="list-style-type: none; padding: 0; width: 100%;"></ul>
    <div class="button-container">
      <button id="close-favorite-modal" class="menu-button" style="background-color: #dc3545; color: white;">닫기</button>
    </div>
  </div>
`;

// 즐겨찾기 클릭 이벤트 수정
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
            if(document.getElementById('multiview-checkbox').checked) {
                multiviewUrls = [favorite.url];
                document.getElementById('multiview-modal').style.display = 'block';
                updateUrlInputs();
            } else {
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

// 멀티뷰 모드 토글 버튼 추가 (기존 메뉴 섹션에)
document.getElementById('menu-section').innerHTML += `
    <button id="multiview-btn" class="menu-button">멀티뷰</button>
`;

document.getElementById('multiview-btn').addEventListener('click', () => {
    document.getElementById('multiview-modal').style.display = 'block';
    updateUrlInputs();
});

// URL 변환 함수
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
