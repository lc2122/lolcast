const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '유튜브',
        color: '#FF0000',
        url: (id) => `/#/player/youtube/${id}`
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

// Function to display CORS permission prompt
function displayCorsPrompt() {
    const corsPrompt = document.createElement('div');
    corsPrompt.style.position = 'fixed';
    corsPrompt.style.top = '0';
    corsPrompt.style.left = '0';
    corsPrompt.style.width = '100%';
    corsPrompt.style.height = '100%';
    corsPrompt.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    corsPrompt.style.display = 'flex';
    corsPrompt.style.justifyContent = 'center';
    corsPrompt.style.alignItems = 'center';
    corsPrompt.style.zIndex = '1000';

    const corsMessage = document.createElement('div');
    corsMessage.style.backgroundColor = 'white';
    corsMessage.style.padding = '20px';
    corsMessage.style.borderRadius = '10px';
    corsMessage.style.textAlign = 'center';

    const messageText = document.createElement('p');
    messageText.textContent = '이 사이트는 Cross-Origin 리소스 공유를 허용해야 합니다. 계속하시려면 "허용"을 클릭하세요.';
    messageText.style.marginBottom = '10px';

    const allowButton = document.createElement('button');
    allowButton.textContent = '허용';
    allowButton.style.padding = '10px 20px';
    allowButton.style.fontSize = '16px';
    allowButton.style.cursor = 'pointer';
    allowButton.style.border = 'none';
    allowButton.style.borderRadius = '5px';
    allowButton.style.backgroundColor = '#00aaff';
    allowButton.style.color = 'white';

    allowButton.onclick = () => {
        corsPrompt.remove();
        // You can add additional logic here if needed
    };

    corsMessage.appendChild(messageText);
    corsMessage.appendChild(allowButton);
    corsPrompt.appendChild(corsMessage);
    document.body.appendChild(corsPrompt);
}

// Function to fetch YouTube live video ID
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

// Display CORS prompt when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayCorsPrompt();
});
