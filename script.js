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
const forestBtn = document.getElementById('flow-btn');

// YouTube 버튼 클릭 시
youtubeBtn.addEventListener('click', async () => {
    const youtubeUrl = CHANNELS.youtube.url(CHANNELS.youtube.id);
    videoIframe.src = youtubeUrl; // 상단 iframe에 유튜브 라이브 영상 로드

    // 라이브 영상이 없는 경우 대체 영상 로드
    videoIframe.onerror = () => {
        videoIframe.src = CHANNELS.youtube.fallbackUrl;
    };
});

// 숲 버튼 클릭 시
forestBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.forest.url(); // 상단 iframe에 숲 영상 로드
});
// flow

flowBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.flow.url(); // 상단 iframe에 flow 영상 로드
});

// 초기 로드 시 유튜브 라이브 영상 표시
window.addEventListener('load', () => {
    const youtubeUrl = CHANNELS.youtube.url(CHANNELS.youtube.id);
    videoIframe.src = youtubeUrl;

    // 라이브 영상이 없는 경우 대체 영상 로드
    videoIframe.onerror = () => {
        videoIframe.src = CHANNELS.youtube.fallbackUrl;
    };
});
