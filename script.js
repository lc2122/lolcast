const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '유튜브',
        color: '#FF0000',
        url: (id) => `https://www.youtube.com/embed/live_stream?channel=${id}`,
        fallbackUrl: 'https://insagirl.github.io/syncwatchdemo/syncwatch2.html'  // 备用视频 URL
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

const videoSection = document.querySelector('.video-section');
const youtubeBtn = document.getElementById('youtube-btn');
const forestBtn = document.getElementById('forest-btn');
const flowBtn = document.getElementById('flow-btn');

// Function to handle fallback URL
const handleFallback = (iframe) => {
    iframe.onload = () => {
        if (iframe.contentWindow.document.body.innerHTML.includes('This video is unavailable')) {
            iframe.src = CHANNELS.youtube.fallbackUrl;
        }
    };
};

// 动态创建并插入 iframe
function createIframe(src) {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.frameborder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowfullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    return iframe;
}

// 处理视频加载
function handleVideoRedirect(url) {
    // 清空当前视频区域
    while (videoSection.firstChild) {
        videoSection.removeChild(videoSection.firstChild);
    }

    // YouTube
    if (url.includes('https://lc2122.github.io/lolcast/youtube/')) {
        const videoId = url.split('/').pop();
        const iframe = createIframe(`https://www.youtube.com/embed/${videoId}`);
        handleFallback(iframe);
        videoSection.appendChild(iframe);
    }
    // 치지직 (Chzzk)
    else if (url.includes('https://lc2122.github.io/lolcast/chzzk/')) {
        const channelId = url.split('/').pop();
        const iframe = createIframe(`https://chzzk.naver.com/live/${channelId}`);
        videoSection.appendChild(iframe);
    }
    // 아프리카TV (Afreeca)
    else if (url.includes('https://lc2122.github.io/lolcast/soop/')) {
        const channelId = url.split('/').pop();
        const iframe = createIframe(`https://play.sooplive.co.kr/${channelId}/280495766/embed`);
        videoSection.appendChild(iframe);
    }
    // Twitch
    else if (url.includes('https://lc2122.github.io/lolcast/twitch/')) {
        const channelId = url.split('/').pop();
        const iframe = createIframe(`https://player.twitch.tv/?channel=${channelId}&parent=https://lc2122.github.io/lolcast/`);
        videoSection.appendChild(iframe);
    }
    // Kick
    else if (url.includes('https://lc2122.github.io/lolcast/kick/')) {
        const channelId = url.split('/').pop();
        const iframe = createIframe(`https://player.kick.com/${channelId}`);
        videoSection.appendChild(iframe);
    }
    // m3u8 (HLS)
    else if (url.includes('https://lc2122.github.io/lolcast/m3u8/')) {
        const m3u8Url = url.split('/').pop();
        const iframe = createIframe(m3u8Url);
        videoSection.appendChild(iframe);
    }
    // CHANNELS 中的固定视频源
    else if (url.includes('forest')) {
        const iframe = createIframe(CHANNELS.forest.url());
        videoSection.appendChild(iframe);
    }
    else if (url.includes('flow')) {
        const iframe = createIframe(CHANNELS.flow.url());
        videoSection.appendChild(iframe);
    }
}

// YouTube 按钮点击时
youtubeBtn.addEventListener('click', () => {
    const youtubeUrl = CHANNELS.youtube.url(CHANNELS.youtube.id);
    handleVideoRedirect(youtubeUrl);
});

// Forest 按钮点击时
forestBtn.addEventListener('click', () => {
    handleVideoRedirect('forest');
});

// Flow 按钮点击时
flowBtn.addEventListener('click', () => {
    handleVideoRedirect('flow');
});

// 页面加载时，默认加载 Flow 频道的视频
window.addEventListener('load', () => {
    handleVideoRedirect('flow');
});
