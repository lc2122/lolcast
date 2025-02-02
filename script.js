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
    // 입력창이 열릴 때 localStorage에서 저장된 URL을 불러옴
    const lastInputValue = localStorage.getItem('lastInputValue');
    if (lastInputValue) {
        urlInput.value = lastInputValue;
    }
});

// "Go" 버튼 클릭 시
goBtn.addEventListener('click', () => {
    const userInput = urlInput.value;
    const transformedUrl = transformUrl(userInput);
    if (transformedUrl) {
        videoIframe.src = transformedUrl;
        // 입력된 URL을 localStorage에 저장
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

function playHlsStream(url) {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoIframe);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            videoIframe.play();
        });
    } else if (videoIframe.canPlayType('application/vnd.apple.mpegurl')) {
        videoIframe.src = url;
        videoIframe.addEventListener('loadedmetadata', () => {
            videoIframe.play();
        });
    } else {
        alert('HLS is not supported on this browser.');
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
