const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '유튜브',
        color: '#FF0000',
        url: (id) => `https://www.youtube.com/embed/live_stream?channel=${id}`,
        fallbackUrl: 'https://insagirl.github.io/syncwatchdemo/syncwatch2.html'
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

const handleFallback = () => {
    videoIframe.addEventListener('error', () => {
        videoIframe.src = CHANNELS.youtube.fallbackUrl;
    });
};

const setButtonColor = (button, color) => {
    button.style.backgroundColor = color;
};

document.getElementById('youtube-btn').addEventListener('click', () => {
    const youtubeUrl = CHANNELS.youtube.url(CHANNELS.youtube.id);
    videoIframe.src = youtubeUrl;
    setButtonColor(document.getElementById('youtube-btn'), CHANNELS.youtube.color);
    handleFallback();
});

document.getElementById('forest-btn').addEventListener('click', () => {
    videoIframe.src = CHANNELS.forest.url();
    setButtonColor(document.getElementById('forest-btn'), CHANNELS.forest.color);
});

document.getElementById('flow-btn').addEventListener('click', () => {
    videoIframe.src = CHANNELS.flow.url();
    setButtonColor(document.getElementById('flow-btn'), CHANNELS.flow.color);
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

// Initial load
window.addEventListener('load', () => {
    videoIframe.src = CHANNELS.flow.url();
    loadTwitchChannel();
});

// Example message to be sent
const message = { type: 'example', data: 'Hello, world!' };

// Ensure the target origin matches the recipient window's origin
const targetOrigin = 'https://insagirl-toto.appspot.com'; 

// Send the message
window.postMessage(message, targetOrigin);
