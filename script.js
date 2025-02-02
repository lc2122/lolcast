const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '유튜브',
        color: '#FF0000',
        url: (id) => `https://www.youtube.com/embed/live_stream?channel=${id}`
    },
    forest: {
        buttonLabel: '숲',
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

// "Go" 버튼 클릭 시
goBtn.addEventListener('click', () => {
    const urlInput = document.getElementById('url-input');
    const userInput = urlInput.value;
    const transformedUrl = transformUrl(userInput);
    if (transformedUrl) {
        videoIframe.src = transformedUrl;
        urlInput.value = ''; 
        document.getElementById('input-modal').style.display = 'none'; 
    }
});

function transformUrl(url) {
    if (!url) {
        alert('URL을 입력해주세요.');
        return;
    }
    if (!url.startsWith('http')) {
        alert('유효한 URL을 입력해주세요.');
        return;
    }

    // YouTube
    if (url.startsWith('https://lolcast.kr/#/player/youtube/')) {
        const channelId = url.split('/').pop();
        return `https://www.youtube.com/embed/${channelId}`;
    }
    // Twitch
    else if (url.startsWith('https://lolcast.kr/#/player/twitch/')) {
        const channelId = url.split('/').pop();
        return `https://player.twitch.tv/?channel=${channelId}&parent=lc2122.github.io`;
    }
    // CHZZK
    else if (url.startsWith('https://lolcast.kr/#/player/chzzk/')) {
        const channelId = url.split('/').pop();
        return `https://chzzk.naver.com/live/${channelId}`;
    }
    // Kick
    else if (url.startsWith('https://lolcast.kr/#/player/kick/')) {
        const channelId = url.split('/').pop();
        return `https://player.kick.com/${channelId}`;
    }
    // AfreecaTV
    else if (url.startsWith('https://lolcast.kr/#/player/afreeca/')) {
        const channelId = url.split('/').pop();
        return `https://play.sooplive.co.kr/${channelId}/embed`;
    }
    // 기타 지원하지 않는 URL
    else {
        alert('지원하지 않는 URL 형식입니다.');
    }
}

const inputModal = document.getElementById('input-modal');
const urlInput = document.getElementById('url-input');
const goButton = document.getElementById('go-btn');

// 모달 외부를 클릭하면 모달을 닫는 함수
function handleOutsideClick(event) {
    // 모달 내부(입력창, Go 버튼)를 클릭한 경우는 무시
    if (inputModal.contains(event.target)) {
        return;
    }
    // 모달 외부를 클릭한 경우 모달 닫기
    inputModal.style.display = 'none';
}

// 모달 외부 클릭 이벤트 리스너 추가
document.addEventListener('click', handleOutsideClick);

// 입력창과 Go 버튼 클릭 시 이벤트 전파 막기 (필요 없음, 위에서 처리됨)
urlInput.addEventListener('click', (event) => {
    event.stopPropagation();
});

goButton.addEventListener('click', (event) => {
    event.stopPropagation();
});
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
