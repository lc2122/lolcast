const CHANNELS = {
    youtube: {
        id: 'UCw1DsweY9b2AKGjV4kGJP1A',
        buttonLabel: '유튜브',
        color: '#FF0000',
        url: (id) => `https://www.youtube.com/embed/live_stream?channel=${id}`
    },
    forest: {
        buttonLabel: '숲',
        color: '#00aaff',
        url: () => 'https://play.sooplive.co.kr/aflol/embed'
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
const inputBtn = document.getElementById('input-btn');
const goBtn = document.getElementById('go-btn');

youtubeBtn.addEventListener('click', () => {
    const youtubeUrl = CHANNELS.youtube.url(CHANNELS.youtube.id);
    videoIframe.src = youtubeUrl;
    handleFallback();
});

forestBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.forest.url();
});

flowBtn.addEventListener('click', () => {
    videoIframe.src = CHANNELS.flow.url();
});

inputBtn.addEventListener('click', () => {
    document.getElementById('input-modal').style.display = 'block';
});

goBtn.addEventListener('click', () => {
    const urlInput = document.getElementById('url-input');
    const userInput = urlInput.value;
    const transformedUrl = transformUrl(userInput);
    if (transformedUrl) {
        videoIframe.src = transformedUrl;
        urlInput.value = ''; 
        document.getElementById('input-modal').style.display = 'none'; 
    }
});

function transformUrl(url) {
    if (!url) {
        alert('URL을 입력해주세요.');
        return;
    }
    if (!url.startsWith('http')) {
        alert('유효한 URL을 입력해주세요.');
        return;
    }
    
    const patterns = {
        youtube: /^<url id="\w+" type="url" status="failed" title="" wc="0">https:\/\/www\.youtube\.com\/embed\/<\/url>(\w+)/,
        twitch: /^<url id="\w+" type="url" status="failed" title="" wc="0">https:\/\/player\.twitch\.tv\/\?channel=<\/url>(\w+)&parent=lc2122\.github\.io/,
        chzzk: /^<url id="\w+" type="url" status="parsed" title="치지직 CHZZK" wc="299">https:\/\/chzzk\.naver\.com\/live\/<\/url>(\w+)/,
        kick: /^<url id="\w+" type="url" status="failed" title="" wc="0">https:\/\/player\.kick\.com\/<\/url>(\w+)/,
        afreeca: /^<url id="\w+" type="url" status="parsed" title="SOOP" wc="2274">https:\/\/play\.sooplive\.co.kr\/<\/url>(\w+)\/embed/
    };

    for (const platform in patterns) {
        const match = url.match(patterns[platform]);
        if (match) {
            const channelId = match[1];
            switch (platform) {
                case 'youtube':
                    return `https://www.youtube.com/embed/${channelId}`;
                case 'twitch':
                    return `https://player.twitch.tv/?channel=${channelId}&parent=lc2122.github.io`;
                case 'chzzk':
                    return `https://chzzk.naver.com/live/${channelId}`;
                case 'kick':
                    return `https://player.kick.com/${channelId}`;
                case 'afreeca':
                    return `https://play.sooplive.co.kr/${channelId}/embed`;
                default:
                    alert('지원하지 않는 URL 형식입니다.');
            }
        }
    }
}


const inputModal = document.getElementById('input-modal');

function handleModalClick(event) {
    if (event.target === inputModal) {
        inputModal.style.display = 'none';
    }
}

inputModal.addEventListener('click', handleModalClick);

const urlInput = document.getElementById('url-input');
const goButton = document.getElementById('go-btn');

urlInput.addEventListener('click', (event) => {
    event.stopPropagation();
});

goButton.addEventListener('click', (event) => {
    event.stopPropagation();
});

window.addEventListener('load', () => {
    videoIframe.src = CHANNELS.flow.url();
    // loadTwitchChannel();
    // loadYouTubeChannel();
    // loadCHZZKChannel();
    // loadSOOPChannel();
    // loadKickChannel();
});
