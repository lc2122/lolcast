const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '유튜브',
        color: '#FF0000',
        url: (id) => `https://www.youtube.com/embed/live_stream?channel=${id}`,
        fallbackUrl: 'https://insagirl.github.io/syncwatchdemo/syncwatch2.html' // 대체 영상 URL
    },
    forest: {
        buttonLabel: '숲',
        color: '#00aaff',
        url: () => 'https://play.sooplive.co.kr/aflol/280920430/embed'
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

// Function to handle fallback URL
const handleFallback = () => {
    if (videoIframe.contentWindow.document.body.innerHTML.includes('This video is unavailable')) {
        videoIframe.src = CHANNELS.youtube.fallbackUrl;
    }
};
            // "흐름" 버튼 클릭 이벤트 추가
            const hrmBtn = document.getElementById('hrm-btn');
            hrmBtn.addEventListener('click', () => {
                const url = 'https://insagirl-toto.appspot.com/hrm/?where=1';
                window.open(url, '_blank');
            });

// YouTube 버튼 클릭 시
youtubeBtn.addEventListener('click', () => {
    const youtubeUrl = CHANNELS.youtube.url(CHANNELS.youtube.id);
    videoIframe.src = youtubeUrl;
    videoIframe.onload = handleFallback;
});

// 숲 버튼 클릭 시
forestBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.forest.url();
});

// flow 버튼 클릭 시
flowBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.flow.url();
});

// 초기 로드 시 flow 영상 표시
window.addEventListener('load', () => {
    videoIframe.src = CHANNELS.flow.url();
});
