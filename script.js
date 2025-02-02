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
const youtubeBtn = document.getElementById('youtube-btn');
const forestBtn = document.getElementById('forest-btn');
const flowBtn = document.getElementById('flow-btn');

// Function to handle fallback URL
const handleFallback = () => {
    if (videoIframe.contentWindow.document.body.innerHTML.includes('This video is unavailable')) {
        videoIframe.src = CHANNELS.youtube.fallbackUrl;
    }
};

function handleVideoRedirect(url) {
    const videoIframe = document.getElementById('video-iframe');

    // YouTube
    if (url.includes('https://lc2122.github.io/lolcast/youtube/')) {
        const videoId = url.split('/').pop();
        videoIframe.src = `https://www.youtube.com/embed/${videoId}`;
        videoIframe.onload = handleFallback;
    }
    // 치지직 (Chzzk)
    else if (url.includes('https://lc2122.github.io/lolcast/chzzk/')) {
        const channelId = url.split('/').pop();
        videoIframe.src = `https://chzzk.naver.com/live/${channelId}`;
    }
    // 아프리카TV (Afreeca)
    else if (url.includes('https://lc2122.github.io/lolcast/soop/')) {
        const channelId = url.split('/').pop();
        videoIframe.src = `https://play.sooplive.co.kr/${channelId}/280495766/embed`;
    }
    // Twitch
    else if (url.includes('https://lc2122.github.io/lolcast/twitch/')) {
        const channelId = url.split('/').pop();
        videoIframe.src = `https://player.twitch.tv/?channel=${channelId}&parent=https://lc2122.github.io/lolcast/`;
    }
    // Kick
    else if (url.includes('https://lc2122.github.io/lolcast/kick/')) {
        const channelId = url.split('/').pop();
        videoIframe.src = `https://player.kick.com/${channelId}`;
    }
    // m3u8 (HLS)
    else if (url.includes('https://lc2122.github.io/lolcast/m3u8/')) {
        const m3u8Url = url.split('/').pop();
        playHlsVideo(m3u8Url);
    }
    // CHANNELS 
    else if (url.includes('forest')) {
        videoIframe.src = CHANNELS.forest.url();
    }
    else if (url.includes('flow')) {
        videoIframe.src = CHANNELS.flow.url();
    }
}

// YouTube
youtubeBtn.addEventListener('click', () => {
    const youtubeUrl = CHANNELS.youtube.url(CHANNELS.youtube.id);
    videoIframe.src = youtubeUrl;
    videoIframe.onload = handleFallback;
});

// Forest 
forestBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.forest.url();
});

// Flow 
flowBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.flow.url();
});

//
window.addEventListener('load', () => {
    videoIframe.src = CHANNELS.flow.url();
});
