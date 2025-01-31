const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '유튜브',
        color: '#FF0000',
        url: (id) => `https://www.youtube.com/embed/${id}`
    },
    forest: {
        buttonLabel: '숲',
        color: '#00aaff',
        url: () => 'https://play.sooplive.co.kr/aflol/280920430/embed'
    }
};

const videoIframe = document.getElementById('video-iframe');
const chatIframe = document.getElementById('chat-iframe');
const youtubeBtn = document.getElementById('youtube-btn');
const forestBtn = document.getElementById('forest-btn');

// 유튜브 라이브 영상 ID 가져오기
async function fetchLiveVideoId(channelId) {
    const YOUTUBE_LIVE_URL = `https://www.youtube.com/channel/${channelId}/live`;
    return new Promise((resolve, reject) => {
        fetch(YOUTUBE_LIVE_URL)
            .then(response => response.text())
            .then(text => {
                const videoIdMatch = text.match(/"videoId":"([\w-]+)"/);
                const isLiveNow = text.includes('"isLiveNow":true') || text.includes('"isLive":true');
                const liveBroadcastContentMatch = text.match(/"liveBroadcastContent":"(\w+)"/);
                const isLiveBroadcast = liveBroadcastContentMatch && liveBroadcastContentMatch[1] === 'live';

                if (videoIdMatch && videoIdMatch[1] && (isLiveNow || isLiveBroadcast)) {
                    resolve(videoIdMatch[1]);
                } else {
                    reject('No live video found.');
                }
            })
            .catch(error => reject(error));
    });
}

// 유튜브 버튼 클릭 시
youtubeBtn.addEventListener('click', async () => {
    try {
        const videoId = await fetchLiveVideoId(CHANNELS.youtube.id);
        const youtubeUrl = CHANNELS.youtube.url(videoId);
        videoIframe.src = youtubeUrl; // 상단 iframe에 유튜브 영상 로드
    } catch (error) {
        console.error(error);
        alert('라이브 영상을 찾을 수 없습니다.');
    }
});

// 숲 버튼 클릭 시
forestBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.forest.url(); // 상단 iframe에 숲 영상 로드
});

// 페이지 로드 시 유튜브 라이브 영상 자동 로드
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const videoId = await fetchLiveVideoId(CHANNELS.youtube.id);
        const youtubeUrl = CHANNELS.youtube.url(videoId);
        videoIframe.src = youtubeUrl; // 상단 iframe에 유튜브 영상 로드
    } catch (error) {
        console.error(error);
        alert('라이브 영상을 찾을 수 없습니다.');
    }
});
