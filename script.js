const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '유튜브',
        color: '#FF0000',
        url: (id) => `https://www.youtube.com/embed/${id}`
    },
    chzzk: {
        url: 'https://chzzk.naver.com/live/9381e7d6816e6d915a44a13c0195b202'
    }
};

const chatIframe = document.getElementById('chat-iframe');
const youtubeBtn = document.getElementById('youtube-btn');
const chzzkBtn = document.getElementById('chzzk-btn');

// 유튜브 라이브 영상 ID 가져오기
async function fetchLiveVideoId(channelId) {
    const YOUTUBE_LIVE_URL = `https://www.youtube.com/channel/${channelId}/live`;
    return new Promise((resolve, reject) => {
        fetch(YOUTUBE_LIVE_URL)
            .then(response => response.text())
            .then(text => {
                const videoIdMatch = text.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
                const isLiveNow = text.includes('"isLiveNow":true') || text.includes('"isLive":true');

                if (videoIdMatch && videoIdMatch[1] && isLiveNow) {
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
        chatIframe.src = youtubeUrl;
    } catch (error) {
        console.error(error);
        alert('라이브 영상을 찾을 수 없습니다.');
    }
});

// 치지직 버튼 클릭 시
chzzkBtn.addEventListener('click', () => {
    chatIframe.src = CHANNELS.chzzk.url;
});
