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

// Function to fetch YouTube live video ID using CORS Anywhere proxy
async function fetchLiveVideoId(channelId) {
    const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
    const YOUTUBE_LIVE_URL = `https://www.youtube.com/channel/${channelId}/live`;
    const response = await fetch(`${PROXY_URL}${YOUTUBE_LIVE_URL}`);
    const text = await response.text();
    const videoIdMatch = text.match(/"videoId":"([\w-]+)"/);
    const isLiveNow = text.includes('"isLiveNow":true') || text.includes('"isLive":true');

    if (videoIdMatch && videoIdMatch[1] && isLiveNow) {
        return videoIdMatch[1];
    } else {
        throw new Error('No live video found.');
    }
}

// YouTube button click event
youtubeBtn.addEventListener('click', async () => {
    try {
        const videoId = await fetchLiveVideoId(CHANNELS.youtube.id);
        const youtubeUrl = CHANNELS.youtube.url(videoId);
        videoIframe.src = youtubeUrl; // Load YouTube video in the top iframe
    } catch (error) {
        console.error(error);
        alert('라이브 영상을 찾을 수 없습니다.');
    }
});

// Forest button click event
forestBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.forest.url(); // Load Forest video in the top iframe
});
