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
        GM_xmlhttpRequest({
            method: "GET",
            url: YOUTUBE_LIVE_URL,
            onload: function(response) {
                const videoIdMatch = response.responseText.match(/"videoId":"([\w-]+)"/);
                const isLiveNow = response.responseText.includes('"isLiveNow":true') || response.responseText.includes('"isLive":true');
                const liveBroadcastContentMatch = response.responseText.match(/"liveBroadcastContent":"(\w+)"/);
                const isLiveBroadcast = liveBroadcastContentMatch && liveBroadcastContentMatch[1] === 'live';

                if (videoIdMatch && videoIdMatch[1] && (isLiveNow || isLiveBroadcast)) {
                    resolve(videoIdMatch[1]);
                } else {
                    reject('No live video found.');
                }
            },
            onerror: reject
        });
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

// 초기 로드 시 채팅창 설정
chatIframe.src = 'https://insagirl-toto.appspot.com/chatting/lgic/*';
