/* ========================================
   CONFIGURATION
   Change these values to customize
   ======================================== */

// Discord User ID - CHANGE THIS to your Discord User ID
const DISCORD_USER_ID = '277183916186796032';

// EXACTLY 3 Songs - CHANGE THESE to your music files
const MUSIC_PLAYLIST = [
    {
        title: 'Song 1',
        file: 'assets/ask.mp3'
    },
    {
        title: 'Song 2',
        file: 'assets/maybach.mp3'
    },
    {
        title: 'Song 3',
        file: 'assets/hayaletsevgilim.mp3'
    }
];

// Background media - To use GIF instead of video, update HTML file
// Video: <video> tag in index.html
// GIF: <img> tag in index.html (currently commented)

// Profile Links - CHANGE THESE to your social media links
const PROFILE_LINKS = {
    discord: 'https://discord.gg/337',
    steam: 'https://steamcommunity.com/id/bwilal/',
    spotify: 'https://open.spotify.com/user/31tdhycltgfet2nrky3nkbndbo6y?si=64319e90914242dd',
    instagram: 'https://www.instagram.com/ucucyedi/'
};

// Secret Videos Configuration
const SECRET_VIDEOS = [
    'assets/secret.mp4',
    'assets/secret2.mp4',
    'assets/secret3.mp4',
    'assets/secret4.mp4',
    'assets/secret5.mp4'
];

const SECRET_VIDEO_TITLES = ['Soul', 'Tekila', 'Exa', 'Raven', 'Sxco'];

// ========================================
// MUSIC PLAYER (3 Songs)
// ========================================

let currentSongIndex = 0;
let isPlaying = false;
let audioElement = null;

let spotifyTrackUrl = null;
let spotifyProgressInterval = null;
let spotifyTimestamps = null;

const MUSIC_TARGET_VOLUME = 0.3;
const MUSIC_FADE_DURATION = 1500;
let fadeInterval = null;

/**
 * Smooth volume fade-in
 */
function fadeInVolume() {
    if (!audioElement) return;
    audioElement.volume = 0;
    const steps = 30;
    const stepTime = MUSIC_FADE_DURATION / steps;
    const increment = MUSIC_TARGET_VOLUME / steps;
    let current = 0;

    if (fadeInterval) clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
        current += increment;
        if (current >= MUSIC_TARGET_VOLUME) {
            audioElement.volume = MUSIC_TARGET_VOLUME;
            clearInterval(fadeInterval);
            fadeInterval = null;
        } else {
            audioElement.volume = current;
        }
    }, stepTime);
}

/**
 * Initializes music player with 3 songs
 */
function initMusicPlayer() {
    audioElement = document.getElementById('background-music');
    if (!audioElement) return;

    audioElement.volume = 0;

    // Load first song
    loadSong(currentSongIndex);

    // Event listeners
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', playPrevious);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', playNext);
    }

    // Update UI when audio plays/pauses/ends
    audioElement.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseUI(true);
    });

    audioElement.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseUI(false);
    });

    audioElement.addEventListener('ended', () => {
        // Auto-play next song (loops playlist)
        playNext();
    });

    audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });
}

function initSpotifyControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    const openSpotify = () => {
        const url = spotifyTrackUrl || PROFILE_LINKS.spotify;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', openSpotify);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', openSpotify);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', openSpotify);
    }
}

function clearSpotifyProgress() {
    if (spotifyProgressInterval) {
        clearInterval(spotifyProgressInterval);
        spotifyProgressInterval = null;
    }
    spotifyTimestamps = null;
    const progressBar = document.getElementById('track-progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

function startSpotifyProgress(timestamps) {
    clearSpotifyProgress();

    if (!timestamps || !timestamps.start || !timestamps.end) {
        return;
    }

    spotifyTimestamps = {
        start: Number(timestamps.start),
        end: Number(timestamps.end)
    };

    const progressBar = document.getElementById('track-progress-bar');
    if (!progressBar) return;

    const update = () => {
        if (!spotifyTimestamps) return;
        const duration = spotifyTimestamps.end - spotifyTimestamps.start;
        if (!Number.isFinite(duration) || duration <= 0) {
            progressBar.style.width = '0%';
            return;
        }

        const now = Date.now();
        const elapsed = now - spotifyTimestamps.start;
        const ratio = Math.min(1, Math.max(0, elapsed / duration));
        progressBar.style.width = `${(ratio * 100).toFixed(2)}%`;
    };

    update();
    spotifyProgressInterval = setInterval(update, 500);
}

/**
 * Loads a song by index
 */
function loadSong(index) {
    if (index < 0 || index >= MUSIC_PLAYLIST.length) return;
    
    currentSongIndex = index;
    const song = MUSIC_PLAYLIST[index];
    
    if (!audioElement || !song) return;
    
    audioElement.src = song.file;
    audioElement.load();
    
    // Update song title
    const songTitle = document.getElementById('song-title');
    if (songTitle) {
        songTitle.textContent = song.title;
    }
    
    // If was playing, continue playing
    if (isPlaying) {
        audioElement.play().catch(error => {
            console.error('Failed to play audio:', error);
        });
    }
}

/**
 * Toggles play/pause
 */
function togglePlayPause() {
    if (!audioElement) return;
    
    if (isPlaying) {
        audioElement.pause();
    } else {
        audioElement.play().catch(error => {
            console.error('Failed to play audio:', error);
        });
    }
}

/**
 * Plays previous song
 */
function playPrevious() {
    let newIndex = currentSongIndex - 1;
    if (newIndex < 0) {
        newIndex = MUSIC_PLAYLIST.length - 1; // Loop to last song
    }
    loadSong(newIndex);
    if (isPlaying) {
        audioElement.play().catch(error => {
            console.error('Failed to play audio:', error);
        });
    }
}

/**
 * Plays next song
 */
function playNext() {
    let newIndex = currentSongIndex + 1;
    if (newIndex >= MUSIC_PLAYLIST.length) {
        newIndex = 0; // Loop to first song
    }
    loadSong(newIndex);
    if (isPlaying) {
        audioElement.play().catch(error => {
            console.error('Failed to play audio:', error);
        });
    }
}

/**
 * Updates play/pause button UI
 */
function updatePlayPauseUI(playing) {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const playPauseBtn = document.getElementById('play-pause-btn');
    
    if (playing) {
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        if (playPauseBtn) playPauseBtn.classList.add('playing');
    } else {
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
        if (playPauseBtn) playPauseBtn.classList.remove('playing');
    }
}

// ========================================
// DISCORD INTEGRATION (Visual Only)
// ========================================

let lanyardData = null;
let updateInterval = null;

/**
 * Fetches Discord user data from Lanyard REST API
 */
async function fetchDiscordData() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            lanyardData = data.data;
            updateDiscordUI(data.data);
            return data.data;
        } else {
            console.error('Lanyard API error:', data);
            showFallbackUI();
            return null;
        }
    } catch (error) {
        console.error('Failed to fetch Discord data:', error);
        showFallbackUI();
        return null;
    }
}

/**
 * Updates all Discord-related UI elements
 */
function updateDiscordUI(data) {
    updateAvatar(data.discord_user);
    updateUsername(data.discord_user);
    updateStatus(data.discord_status);
    updateDevicePresence(data);
    updateCustomStatus(data.activities);
    updateBadges(data.discord_user);
    updateSpotifyActivity(data.activities);
    updateSpotifyLink(data.activities);
}

/**
 * Updates Discord avatar
 */
function updateAvatar(discordUser) {
    const avatarImg = document.getElementById('discord-avatar');
    if (!discordUser || !avatarImg) return;
    
    let avatarUrl;
    if (discordUser.avatar) {
        const extension = discordUser.avatar.startsWith('a_') ? 'gif' : 'png';
        avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${extension}?size=256`;
    } else {
        const defaultAvatar = parseInt(discordUser.discriminator) % 5;
        avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
    }
    
    avatarImg.src = avatarUrl;
    avatarImg.alt = `${discordUser.username}'s Avatar`;
    
    avatarImg.onerror = () => {
        const defaultAvatar = parseInt(discordUser.discriminator) % 5;
        avatarImg.src = `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
    };
}

/**
 * Updates username and discriminator
 */
function updateUsername(discordUser) {
    const usernameText = document.getElementById('username-text');
    const discriminatorSpan = document.getElementById('discord-discriminator');
    
    if (!discordUser) return;
    
    if (usernameText) {
        usernameText.textContent = discordUser.username || 'Unknown User';
    }
    
    if (discriminatorSpan) {
        if (discordUser.discriminator && discordUser.discriminator !== '0') {
            discriminatorSpan.textContent = `#${discordUser.discriminator}`;
            discriminatorSpan.style.display = 'inline';
        } else {
            discriminatorSpan.style.display = 'none';
        }
    }
}

/**
 * Updates Discord status indicator
 */
function updateStatus(status) {
    const indicator = document.getElementById('avatar-presence');
    const current = ['online', 'idle', 'dnd', 'offline'].includes(status) ? status : 'offline';
    const labels = {online:'Online', idle:'Idle', dnd:'Do Not Disturb', offline:'Offline'};
    if (indicator) {
        indicator.className = 'avatar-presence ' + current;
        indicator.title = labels[current];
        indicator.setAttribute('aria-label', 'Discord: ' + labels[current]);
    }
}

/**
 * Updates custom status text
 */
function updateDevicePresence(data) {
    [['desktop', 'active_on_discord_desktop', 'PC'],
     ['mobile', 'active_on_discord_mobile', 'Mobile'],
     ['web', 'active_on_discord_web', 'Web']].forEach(([id, key, label]) => {
        const element = document.getElementById('device-' + id);
        if (!element) return;
        const active = data?.[key] === true;
        element.classList.toggle('active', active);
        element.title = label + ': ' + (active ? 'Active' : 'Offline');
        element.setAttribute('aria-label', element.title);
    });
}

function updateCustomStatus(activities) {
    const customStatusText = document.getElementById('custom-status-text');
    const customStatusCard = document.getElementById('custom-status-card');
    
    if (!customStatusText || !customStatusCard) return;
    
    const customStatus = activities?.find(activity => activity.type === 4);
    
    if (customStatus && customStatus.state) {
        customStatusText.textContent = customStatus.state;
        customStatusCard.classList.remove('hidden');
        customStatusCard.setAttribute('aria-hidden', 'false');
    } else {
        customStatusCard.classList.add('hidden');
        customStatusCard.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Updates badges with custom images from assets
 */
function updateBadges(discordUser) {
    const badgesContainer = document.getElementById('badges-container');
    if (badgesContainer) badgesContainer.innerHTML = '';
}

/**
 * Updates Spotify Rich Presence display
 */
function updateSpotifyActivity(activities) {
    const spotify = activities?.find(activity => activity.name === 'Spotify');
    const albumCover = document.getElementById('album-cover');
    const albumPlaceholder = document.querySelector('.album-placeholder');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const spotifyPlayer = document.querySelector('.spotify-music-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    
    if (spotify && spotify.assets && spotify.details && spotify.state) {
        spotifyTrackUrl = spotify.sync_id ? `https://open.spotify.com/track/${spotify.sync_id}` : PROFILE_LINKS.spotify;

        // Show album cover
        if (spotify.assets.large_image) {
            // Spotify image key format: spotify:xxxxxx
            // Need to extract the image ID
            let imageId = spotify.assets.large_image;
            if (imageId.startsWith('spotify:')) {
                imageId = imageId.replace('spotify:', '');
            }
            
            // Spotify CDN URL: https://i.scdn.co/image/{image_id}
            const albumCoverUrl = `https://i.scdn.co/image/${imageId}`;
            
            if (albumCover) {
                albumCover.src = albumCoverUrl;
                albumCover.onload = () => {
                    albumCover.classList.remove('hidden');
                    if (albumPlaceholder) {
                        albumPlaceholder.style.display = 'none';
                    }
                };
                albumCover.onerror = () => {
                    albumCover.classList.add('hidden');
                    if (albumPlaceholder) {
                        albumPlaceholder.style.display = 'flex';
                    }
                };
            }
        } else {
            if (albumCover) albumCover.classList.add('hidden');
            if (albumPlaceholder) albumPlaceholder.style.display = 'flex';
        }
        
        // Update song title
        if (songTitle) {
            songTitle.textContent = spotify.details;
        }
        
        // Update artist name
        if (songArtist) {
            songArtist.textContent = spotify.state;
        }
        
        // Show player if hidden
        if (spotifyPlayer) {
            spotifyPlayer.style.display = 'flex';
            spotifyPlayer.classList.remove('inactive');
        }

        startSpotifyProgress(spotify.timestamps);
        updatePlayPauseUI(true);
        if (playPauseBtn) {
            playPauseBtn.setAttribute('aria-label', 'Open in Spotify');
        }
    } else {
        spotifyTrackUrl = null;

        // Hide or show placeholder when not playing
        if (albumCover) albumCover.classList.add('hidden');
        if (albumPlaceholder) albumPlaceholder.style.display = 'flex';
        if (songTitle) songTitle.textContent = 'Not playing';
        if (songArtist) songArtist.textContent = 'Spotify';
        if (spotifyPlayer) {
            spotifyPlayer.classList.add('inactive');
        }
        clearSpotifyProgress();
        updatePlayPauseUI(false);
    }
}

/**
 * Updates Spotify link
 */
function updateSpotifyLink(activities) {
    const spotifyLink = document.getElementById('spotify-link');
    if (!spotifyLink) return;
    
    // Always go to Spotify profile
    spotifyLink.href = PROFILE_LINKS.spotify;
}

/**
 * Shows fallback UI when Discord data fails
 */
function showFallbackUI() {
    const usernameText = document.getElementById('username-text');
    if (usernameText) {
        usernameText.textContent = 'Unknown User';
    }
    
    updateStatus('offline');
    updateDevicePresence(null);
}

// ========================================
// PROFILE LINKS
// ========================================

/**
 * Initializes profile links
 */
function initProfileLinks() {
    const discordLink = document.getElementById('discord-link');
    const steamLink = document.getElementById('steam-link');
    const spotifyLink = document.getElementById('spotify-link');
    const instagramLink = document.getElementById('instagram-link');
    const discordLinkText = document.querySelector('.discord-link-text');
    
    if (discordLink) discordLink.href = PROFILE_LINKS.discord;
    if (steamLink) steamLink.href = PROFILE_LINKS.steam;
    if (spotifyLink) spotifyLink.href = PROFILE_LINKS.spotify;
    if (instagramLink) instagramLink.href = PROFILE_LINKS.instagram;

    // Prevent discord link text click from triggering other events
    if (discordLinkText) {
        discordLinkText.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// ========================================
// SECRET VIDEO MENU SYSTEM
// ========================================

let secretMenuOverlay = null;
let secretVideoPlayer = null;
let currentSecretIndex = 0;
let isSecretMenuOpen = false;
let musicWasPlaying = false;
let musicSavedPosition = 0;

function initSecretMenu() {
    secretMenuOverlay = document.getElementById('secret-menu-overlay');
    secretVideoPlayer = document.getElementById('secret-video-player');
    const avatarTrigger = document.getElementById('avatar-trigger');
    const navLeft = document.getElementById('secret-nav-left');
    const navRight = document.getElementById('secret-nav-right');

    if (!secretMenuOverlay || !secretVideoPlayer) return;

    // Avatar click opens menu
    if (avatarTrigger) {
        avatarTrigger.addEventListener('click', () => {
            openSecretMenu();
        });
    }

    // Navigation buttons
    if (navLeft) {
        navLeft.addEventListener('click', () => {
            closeSecretMenu();
        });
    }

    if (navRight) {
        navRight.addEventListener('click', () => {
            nextSecretVideo();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!isSecretMenuOpen) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            closeSecretMenu();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSecretVideo();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeSecretMenu();
        }
    });
}

function openSecretMenu() {
    if (!secretMenuOverlay || !secretVideoPlayer) return;
    if (isSecretMenuOpen) return;

    isSecretMenuOpen = true;

    // Save music state and pause
    if (audioElement) {
        musicWasPlaying = isPlaying;
        musicSavedPosition = audioElement.currentTime;
        if (isPlaying) {
            audioElement.pause();
        }
    }

    // Show overlay with animation
    secretMenuOverlay.classList.add('active');
    secretMenuOverlay.setAttribute('aria-hidden', 'false');

    // Load and play video
    currentSecretIndex = 0;
    playSecretVideo(currentSecretIndex);
}

function closeSecretMenu() {
    if (!secretMenuOverlay || !secretVideoPlayer) return;
    if (!isSecretMenuOpen) return;

    isSecretMenuOpen = false;

    // Stop video
    secretVideoPlayer.pause();
    secretVideoPlayer.src = '';

    // Hide overlay
    secretMenuOverlay.classList.remove('active');
    secretMenuOverlay.setAttribute('aria-hidden', 'true');

    // Resume music from saved position with fade-in
    if (audioElement && musicWasPlaying) {
        audioElement.currentTime = musicSavedPosition;
        audioElement.volume = 0;
        audioElement.play().then(() => {
            fadeInVolume();
        }).catch(err => console.log('Resume play prevented:', err));
    }
}

function nextSecretVideo() {
    if (!isSecretMenuOpen || !secretVideoPlayer) return;

    // Fade transition
    secretVideoPlayer.style.opacity = '0';
    secretVideoPlayer.style.transform = 'scale(0.95) translateX(30px)';

    setTimeout(() => {
        currentSecretIndex = (currentSecretIndex + 1) % SECRET_VIDEOS.length;
        playSecretVideo(currentSecretIndex);
        secretVideoPlayer.style.transform = 'scale(1) translateX(0)';
        secretVideoPlayer.style.opacity = '1';
    }, 300);
}

function playSecretVideo(index) {
    if (!secretVideoPlayer || index < 0 || index >= SECRET_VIDEOS.length) return;
    secretVideoPlayer.src = SECRET_VIDEOS[index];
    secretVideoPlayer.load();
    secretVideoPlayer.play().catch(err => console.log('Video play prevented:', err));

    // Update title
    const titleEl = document.getElementById('secret-video-title');
    if (titleEl) {
        titleEl.textContent = SECRET_VIDEO_TITLES[index] || '';
    }
}

// ========================================
// CUSTOM CURSOR GLOW & TRAIL
// ========================================

let cursorGlowEl = null;
let cursorTrailContainer = null;
let trailDots = [];
let cursorHue = 0;
let cursorRafId = null;
let lastMouseX = 0;
let lastMouseY = 0;

function initCursorGlow() {
    // Disable on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    cursorGlowEl = document.getElementById('cursor-glow');
    if (!cursorGlowEl) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorGlowEl) cursorGlowEl.classList.add('active');

        // Detect if hovering over a clickable element
        const target = e.target;
        const isClickable = target.closest('a, button, [role="button"], .profile-link, .avatar-wrapper, .music-btn, .secret-nav-btn, .intro-overlay');
        if (isClickable) {
            cursorGlowEl.classList.add('hovering');
        } else {
            cursorGlowEl.classList.remove('hovering');
        }
    });

    document.addEventListener('mouseleave', () => {
        if (cursorGlowEl) {
            cursorGlowEl.classList.remove('active');
            cursorGlowEl.classList.remove('hovering');
        }
    });

    function animate() {
        glowX += (mouseX - glowX) * 0.18;
        glowY += (mouseY - glowY) * 0.18;

        if (cursorGlowEl) {
            cursorGlowEl.style.left = `${glowX}px`;
            cursorGlowEl.style.top = `${glowY}px`;
        }

        cursorRafId = requestAnimationFrame(animate);
    }

    cursorRafId = requestAnimationFrame(animate);
}

// ========================================
// INTRO MUSIC PLAYER
// ========================================

let introAudioElement = null;
let introIsPlaying = false;
let introAudioDuration = 0;
let introProgressAnimId = null;

function initIntroMusicPlayer() {
    introAudioElement = document.getElementById('startscreenAudio');
    const startBtn = document.getElementById('intro-start-btn');
    const stopBtn = document.getElementById('intro-stop-btn');
    const progressTrack = document.querySelector('.intro-progress-track');
    const progressFill = document.getElementById('intro-progress-fill');
    const progressDot = document.getElementById('intro-progress-dot');

    if (!introAudioElement) return;

    // Get duration when metadata loads
    introAudioElement.addEventListener('loadedmetadata', () => {
        introAudioDuration = introAudioElement.duration;
    });

    // START button - play or resume audio from saved position
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (introAudioElement.paused) {
                introAudioElement.play();
                introIsPlaying = true;
                updateIntroProgress();
            }
        });
    }

    // STOP button - pause and reset audio to beginning
    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            introAudioElement.pause();
            introAudioElement.currentTime = 0;
            introIsPlaying = false;
            if (introProgressAnimId) cancelAnimationFrame(introProgressAnimId);
            if (progressFill) progressFill.style.width = '0%';
            if (progressDot) progressDot.style.left = '0%';
        });
    }

    // Progress bar click to seek
    if (progressTrack) {
        progressTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (introAudioDuration > 0) {
                const rect = progressTrack.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                introAudioElement.currentTime = percentage * introAudioDuration;
                updateIntroProgress();
            }
        });
    }

    // Audio ended
    introAudioElement.addEventListener('ended', () => {
        introIsPlaying = false;
        if (introProgressAnimId) cancelAnimationFrame(introProgressAnimId);
        // Fill to 100% then reset
        if (progressFill) progressFill.style.width = '100%';
        setTimeout(() => {
            introAudioElement.currentTime = 0;
            if (progressFill) progressFill.style.width = '0%';
            if (progressDot) progressDot.style.left = '0%';
        }, 500);
    });

    function updateIntroProgress() {
        if (!introIsPlaying) return;

        const currentTime = introAudioElement.currentTime;
        const duration = introAudioDuration;

        if (duration > 0) {
            const percentage = (currentTime / duration) * 100;
            if (progressFill) progressFill.style.width = percentage + '%';
            if (progressDot) progressDot.style.left = percentage + '%';
        }

        introProgressAnimId = requestAnimationFrame(updateIntroProgress);
    }
}

// ========================================
// VIDEO PLAYER SYSTEM
// ========================================

const MUSICAL_VIDEOS = [
    'assets/musical1.mp4',
    'assets/musical2.mp4',
    'assets/musical3.mp4',
    'assets/musical4.mp4',
    'assets/musical5.mp4'
];

let currentVideoIndex = 0;
let isVideoPlaying = false;
let videoWasPausedByUser = false;
let musicWasPlayingBeforeVideo = false;
let musicPositionBeforeVideo = 0;

function initVideoPlayer() {
    const videoEl = document.getElementById('musical-video');
    const playerBg = document.getElementById('video-player-bg');
    const playBtn = document.getElementById('video-play-btn');
    const pauseBtn = document.getElementById('video-pause-btn');
    const nextBtn = document.getElementById('video-next-btn');
    const prevBtn = document.getElementById('video-prev-btn');
    const stopBtn = document.getElementById('video-stop-btn');
    const currentCounter = document.getElementById('video-current');

    if (!videoEl || !playerBg) return;

    // Play button
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (!isVideoPlaying) {
                playVideo();
            }
        });
    }

    // Pause button
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (isVideoPlaying) {
                pauseVideo();
            }
        });
    }

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentVideoIndex = (currentVideoIndex + 1) % MUSICAL_VIDEOS.length;
            updateVideoCounter();
            if (isVideoPlaying) {
                playVideo();
            }
        });
    }

    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentVideoIndex = (currentVideoIndex - 1 + MUSICAL_VIDEOS.length) % MUSICAL_VIDEOS.length;
            updateVideoCounter();
            if (isVideoPlaying) {
                playVideo();
            }
        });
    }

    // Stop button
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            stopVideo();
        });
    }

    // Video ended - play next automatically
    videoEl.addEventListener('ended', () => {
        currentVideoIndex = (currentVideoIndex + 1) % MUSICAL_VIDEOS.length;
        updateVideoCounter();
        playVideo();
    });

    // Error handling
    videoEl.addEventListener('error', () => {
        console.error('Video failed to load:', MUSICAL_VIDEOS[currentVideoIndex]);
        // Skip to next video
        currentVideoIndex = (currentVideoIndex + 1) % MUSICAL_VIDEOS.length;
        updateVideoCounter();
        if (isVideoPlaying) {
            playVideo();
        }
    });

    function playVideo() {
        if (!videoEl) return;

        // Save music state if not already saved
        if (!isVideoPlaying && audioElement) {
            musicWasPlayingBeforeVideo = isPlaying;
            musicPositionBeforeVideo = audioElement.currentTime;
            if (isPlaying) {
                audioElement.pause();
            }
        }

        // Load and play video
        videoEl.src = MUSICAL_VIDEOS[currentVideoIndex];
        videoEl.load();
        
        videoEl.play().then(() => {
            isVideoPlaying = true;
            videoWasPausedByUser = false;
            playerBg.classList.add('active');
            updatePlayPauseUI();
        }).catch(err => {
            console.error('Video play error:', err);
        });
    }

    function pauseVideo() {
        if (!videoEl) return;
        videoEl.pause();
        isVideoPlaying = false;
        videoWasPausedByUser = true;
        updatePlayPauseUI();
    }

    function stopVideo() {
        if (!videoEl) return;
        videoEl.pause();
        videoEl.currentTime = 0;
        videoEl.src = '';
        isVideoPlaying = false;
        videoWasPausedByUser = false;
        currentVideoIndex = 0;
        updateVideoCounter();
        updatePlayPauseUI();

        // Fade out video background
        playerBg.classList.remove('active');

        // Resume background music
        if (audioElement && musicWasPlayingBeforeVideo) {
            audioElement.currentTime = musicPositionBeforeVideo;
            audioElement.play().catch(err => console.log('Resume play prevented:', err));
        }
    }

    function updateVideoCounter() {
        if (currentCounter) {
            currentCounter.textContent = String(currentVideoIndex + 1).padStart(2, '0');
        }
    }

    function updatePlayPauseUI() {
        if (isVideoPlaying) {
            playBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
        } else {
            playBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
        }
    }
}

// ========================================
// LOADING INTRO SCREEN
// ========================================

function initLoadingIntro() {
    const loadingScreen = document.getElementById('loading-intro');
    const loadingBar = document.getElementById('loading-bar-fill');
    const introOverlay = document.getElementById('intro-overlay');

    if (!loadingScreen || !loadingBar) {
        // No loading screen, just show intro
        if (introOverlay) introOverlay.style.opacity = '1';
        return;
    }

    // Hide intro overlay until loading completes
    if (introOverlay) {
        introOverlay.style.opacity = '0';
        introOverlay.style.pointerEvents = 'none';
    }

    // Animate loading bar from 0 to 100% over 5 seconds
    const duration = 5000;
    const startTime = performance.now();

    function updateBar(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        loadingBar.style.width = `${progress * 100}%`;

        if (progress < 1) {
            requestAnimationFrame(updateBar);
        } else {
            // Loading complete - fade in intro overlay immediately (no intermediate screen)
            if (introOverlay) {
                introOverlay.style.transition = 'opacity 0.6s ease-in-out';
                introOverlay.style.opacity = '1';
                introOverlay.style.pointerEvents = 'auto';
            }

            // Fade out loading screen simultaneously
            loadingScreen.classList.add('fade-out');

            setTimeout(() => {
                loadingScreen.remove();
            }, 600);
        }
    }

    requestAnimationFrame(updateBar);
}

// ========================================
// BACK BUTTON
// ========================================

function initBackButton() {
    const backBtn = document.getElementById('back-to-intro-btn');
    const introOverlay = document.getElementById('intro-overlay');
    const page = document.querySelector('.page');
    const backgroundContainer = document.querySelector('.background-container');

    if (!backBtn || !introOverlay) return;

    let transitioning = false;

    backBtn.addEventListener('click', () => {
        if (transitioning) return;
        transitioning = true;

        // Animate page out with cinematic exit
        if (page) {
            page.classList.remove('visible');
            page.classList.add('exit');
        }

        // Remove background reveal animation
        if (backgroundContainer) {
            backgroundContainer.classList.remove('reveal');
        }

        // Stop any playing video (but NOT background music)
        const videoEl = document.getElementById('musical-video');
        if (videoEl && isVideoPlaying) {
            videoEl.pause();
            videoEl.currentTime = 0;
            videoEl.src = '';
            isVideoPlaying = false;
            currentVideoIndex = 0;
            const playerBg = document.getElementById('video-player-bg');
            if (playerBg) playerBg.classList.remove('active');
        }

        // Wait for page exit animation to complete (600ms to ensure full fade), then reveal overlay
        setTimeout(() => {
            // Remove page exit animation classes
            if (page) {
                page.classList.remove('exit');
            }

            // Reveal overlay with cinematic fade-in
            introOverlay.classList.remove('fade-out');
            introOverlay.classList.add('reveal');
            introOverlay.style.pointerEvents = 'auto';
            introOverlay.setAttribute('aria-hidden', 'false');
            
            // Reset transitioning state so overlay can be dismissed again
            introOverlay.dataset.transitioning = 'false';

            // Reset transitioning flag after animation completes
            setTimeout(() => {
                transitioning = false;
            }, 450);
        }, 600);
    });
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initializes the application
 */
async function init() {
    initLoadingIntro();
    initIntroOverlay();
    initBackButton();
    initIntroMusicPlayer();
    initFloatingNames();
    initVideoPlayer();
    initSpotifyControls();
    initProfileLinks();
    initVisitorLocation();
    initSecretMenu();
    initCursorGlow();
    await fetchDiscordData();
    
    // Update Discord data every 10 seconds
    updateInterval = setInterval(() => {
        fetchDiscordData();
    }, 10000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

let visitorLocationLoaded = false;

/**
 * Loads visitor's approximate IP-based location and displays it.
 * Masks the IP address for privacy. Runs once per session.
 */
async function loadVisitorLocation() {
    const locationEl = document.getElementById('visitor-location');
    if (!locationEl || visitorLocationLoaded) return;
    visitorLocationLoaded = true;

    // Check if running on file:// protocol
    if (window.location.protocol === 'file:') {
        console.warn('IP location feature requires HTTPS. Please test through localhost or deployed site.');
        locationEl.textContent = 'LOCATION UNAVAILABLE';
        locationEl.classList.add('location-loaded');
        return;
    }

    function maskIP(ip) {
        if (!ip || typeof ip !== 'string') return '';

        // IPv4: mask the final section
        if (ip.includes('.') && !ip.includes(':')) {
            const parts = ip.split('.');
            if (parts.length >= 2) {
                return parts.slice(0, parts.length - 1).join('.') + '.xxx';
            }
            return ip;
        }

        // IPv6: show first 3 sections, mask the rest
        if (ip.includes(':')) {
            const parts = ip.split(':');
            if (parts.length >= 3) {
                return parts.slice(0, 3).join(':') + ':xxxx:xxxx';
            }
            return ip;
        }

        return ip;
    }

    function sanitize(value) {
        if (!value || typeof value !== 'string') return '';
        return value.trim().replace(/[<>"']/g, '');
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        // Try ipify first (most reliable CORS support)
        let response = await fetch('https://ipapi.io/api/ip?format=json', {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format');
        }

        const ip = maskIP(sanitize(data.ip));
        const country = sanitize(data.country_name || data.country || data.country_code);
        const city = sanitize(data.city);

        let displayText = '';
        if (ip && country && city) {
            displayText = `${ip} • ${country}, ${city}`;
        } else if (ip && country) {
            displayText = `${ip} • ${country}`;
        } else if (ip) {
            displayText = ip;
        } else {
            displayText = 'LOCATION UNAVAILABLE';
        }

        locationEl.textContent = displayText;
    } catch (error) {
        console.error('Location lookup failed:', error.message);
        locationEl.textContent = 'LOCATION UNAVAILABLE';
    }

    locationEl.classList.add('location-loaded');
}

function initVisitorLocation() {
    loadVisitorLocation();
}

function initIntroOverlay() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    const page = document.querySelector('.page');

    const dismiss = () => {
        // Prevent multiple clicks during transition
        if (overlay.dataset.transitioning === 'true') return;
        overlay.dataset.transitioning = 'true';
        
        // Pause landing screen audio BEFORE fade-out animation begins
        // Preserve currentTime position, do not reset to 0
        if (introAudioElement && !introAudioElement.paused) {
            introAudioElement.pause();
            introIsPlaying = false;
            if (introProgressAnimId) cancelAnimationFrame(introProgressAnimId);
        }
        
        // Prevent pointer events during transition
        overlay.style.pointerEvents = 'none';
        
        // Remove reveal class if present (from going back)
        overlay.classList.remove('reveal');
        
        // Start cinematic transition
        overlay.classList.add('fade-out');
        overlay.setAttribute('aria-hidden', 'true');

        // Fade in the main page with cinematic animations (simultaneous)
        if (page) {
            page.classList.remove('exit');
            page.classList.add('visible');
        }

        // Animate background zoom and blur removal
        const bgContainer = document.querySelector('.background-container');
        if (bgContainer) bgContainer.classList.add('reveal');

        // Start main music player when entering profile page
        initMusicPlayer();
        if (audioElement) {
            audioElement.play().catch(err => console.log('Autoplay prevented:', err));
        }

        // Keep overlay in DOM but hidden (for reverse transition)
        // The overlay stays in the DOM with opacity: 0 from the fade-out class
    };

    overlay.addEventListener('click', dismiss);
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dismiss();
        }
    });
}

// Floating Names System for HUD intro screen
// Maintains 6-7 visible names with independent staggered lifecycles
function initFloatingNames() {
    const container = document.getElementById('floating-names');
    const overlay = document.getElementById('intro-overlay');
    if (!container) return;

    const names = ['🦋', '🦋', '♡', '✧', '🦋'];

    const TARGET_COUNT = 9;
    const MIN_COUNT = 7;
    const MAX_ATTEMPTS = 80;
    const CENTER_DISTANCE = 45;
    const MIN_NAME_DISTANCE = 95;
    const MARGIN = 30;
    const MAX_PER_ZONE = 2;

    let activeNames = [];
    let timers = [];
    let isActive = true;
    let recentNames = [];
    let lastZoneIndex = -1;

    function clearTimers() {
        timers.forEach(timer => clearTimeout(timer));
        timers = [];
    }

    function clearContainer() {
        clearTimers();
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        activeNames = [];
        recentNames = [];
        lastZoneIndex = -1;
    }

    function getZones() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cols = 3;
        const rows = 3;
        const zoneW = width / cols;
        const zoneH = height / rows;
        const zones = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip center zone to protect the UI
                if (row === 1 && col === 1) continue;
                zones.push({
                    x: col * zoneW,
                    y: row * zoneH,
                    w: zoneW,
                    h: zoneH,
                    index: zones.length
                });
            }
        }
        return zones;
    }

    function getZoneNameCount(zoneIndex) {
        return activeNames.filter(item => item.zoneIndex === zoneIndex).length;
    }

    function pickZone() {
        const zones = getZones();
        // Prefer zones with fewer names, avoid same zone twice if possible
        let candidates = zones.filter(z => getZoneNameCount(z.index) < MAX_PER_ZONE && z.index !== lastZoneIndex);
        if (candidates.length === 0) {
            candidates = zones.filter(z => getZoneNameCount(z.index) < MAX_PER_ZONE);
        }
        if (candidates.length === 0) {
            candidates = zones;
        }
        const zone = candidates[Math.floor(Math.random() * candidates.length)];
        lastZoneIndex = zone.index;
        return zone;
    }

    function isInCenterArea(x, y, width, height) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const halfW = Math.max(window.innerWidth * 0.22, 180);
        const halfH = Math.max(window.innerHeight * 0.32, 240);
        return (
            x < centerX + halfW + CENTER_DISTANCE &&
            x + width > centerX - halfW - CENTER_DISTANCE &&
            y < centerY + halfH + CENTER_DISTANCE &&
            y + height > centerY - halfH - CENTER_DISTANCE
        );
    }

    function isTooClose(x, y, width, height) {
        return activeNames.some(item => {
            const rect = item.el.getBoundingClientRect();
            const centerAX = x + width / 2;
            const centerAY = y + height / 2;
            const centerBX = rect.left + rect.width / 2;
            const centerBY = rect.top + rect.height / 2;
            const distance = Math.hypot(centerAX - centerBX, centerAY - centerBY);
            return distance < MIN_NAME_DISTANCE;
        });
    }

    function pickName() {
        // Avoid names used in the last 5 spawns
        const available = names.filter(name => !recentNames.includes(name));
        const pool = available.length > 0 ? available : names;
        const name = pool[Math.floor(Math.random() * pool.length)];

        recentNames.push(name);
        if (recentNames.length > 5) recentNames.shift();

        return name;
    }

    function findPosition(name) {
        const zone = pickZone();
        const testEl = document.createElement('span');
        testEl.className = 'floating-name';
        testEl.style.visibility = 'hidden';
        testEl.style.position = 'absolute';
        testEl.style.fontSize = `${Math.random() * 8 + 16}px`;
        testEl.textContent = name;
        container.appendChild(testEl);

        let x, y, attempt = 0;
        do {
            x = zone.x + Math.random() * (zone.w - testEl.offsetWidth - MARGIN * 2) + MARGIN;
            y = zone.y + Math.random() * (zone.h - testEl.offsetHeight - MARGIN * 2) + MARGIN;
            attempt++;
        } while ((isInCenterArea(x, y, testEl.offsetWidth, testEl.offsetHeight) ||
                  isTooClose(x, y, testEl.offsetWidth, testEl.offsetHeight)) && attempt < MAX_ATTEMPTS);

        const rect = { width: testEl.offsetWidth, height: testEl.offsetHeight };
        testEl.remove();
        return { x, y, zoneIndex: zone.index, rect };
    }

    function spawnName() {
        if (!isActive || activeNames.length >= TARGET_COUNT) return;

        const name = pickName();
        const position = findPosition(name);
        const opacity = Math.random() * 0.3 + 0.45;
        const size = Math.random() * 8 + 16;
        const driftX = (Math.random() - 0.5) * 20;
        const driftY = (Math.random() - 0.5) * 20;
        const fadeInDuration = Math.random() * 400 + 600;

        const el = document.createElement('span');
        el.className = 'floating-name';
        el.textContent = name;
        el.style.fontSize = `${size}px`;
        el.style.left = `${position.x}px`;
        el.style.top = `${position.y}px`;
        el.style.transitionDuration = `${fadeInDuration}ms`;
        el.style.setProperty('--name-opacity', opacity);
        el.style.setProperty('--drift-x', `${driftX}px`);
        el.style.setProperty('--drift-y', `${driftY}px`);
        container.appendChild(el);

        const item = { el, zoneIndex: position.zoneIndex };
        activeNames.push(item);

        // Force reflow then fade in
        void el.offsetWidth;
        el.classList.add('visible');

        const visibleDuration = Math.random() * 3000 + 3000;
        const fadeOutDuration = Math.random() * 400 + 600;

        const fadeOutTimer = setTimeout(() => {
            el.style.transitionDuration = `${fadeOutDuration}ms`;
            el.classList.remove('visible');
            el.classList.add('hiding');

            const removeTimer = setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
                const index = activeNames.indexOf(item);
                if (index > -1) activeNames.splice(index, 1);
                scheduleSpawn();
            }, fadeOutDuration + 100);
            timers.push(removeTimer);
        }, visibleDuration + fadeInDuration);
        timers.push(fadeOutTimer);
    }

    function scheduleSpawn() {
        if (!isActive || activeNames.length >= TARGET_COUNT) return;
        const delay = Math.random() * 500 + 400;
        const timer = setTimeout(() => {
            spawnName();
            if (activeNames.length < MIN_COUNT) scheduleSpawn();
        }, delay);
        timers.push(timer);
    }

    function start() {
        if (!isActive) return;
        // Gradually spawn names up to target count
        for (let i = 0; i < TARGET_COUNT; i++) {
            const delay = Math.random() * 900 * i + 400;
            const timer = setTimeout(spawnName, delay);
            timers.push(timer);
        }
    }

    function stop() {
        isActive = false;
        clearContainer();
    }

    // Start the effect
    start();

    // Handle overlay visibility changes
    const observer = new MutationObserver(() => {
        if (!document.getElementById('floating-names')) {
            stop();
            observer.disconnect();
            return;
        }
        if (!overlay) return;

        const isVisible = overlay.classList.contains('reveal') || !overlay.classList.contains('fade-out');
        if (isVisible && !isActive) {
            isActive = true;
            start();
        } else if (!isVisible && isActive) {
            stop();
        }
    });

    if (overlay) {
        observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
}

// Subtle floating particles for HUD intro screen
function initIntroParticles() {
    const canvas = document.getElementById('intro-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let particles = [];
    let animId = null;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Create very subtle particles
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1 + 0.3,
            speedX: (Math.random() - 0.5) * 0.1,
            speedY: (Math.random() - 0.5) * 0.1 - 0.05,
            opacity: Math.random() * 0.15 + 0.05,
            maxOpacity: Math.random() * 0.15 + 0.05
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Subtle fade in/out
            p.opacity += (Math.random() - 0.5) * 0.02;
            p.opacity = Math.max(0, Math.min(p.maxOpacity, p.opacity));

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
        });

        animId = requestAnimationFrame(animate);
    }

    animate();

    // Stop when overlay is removed
    const observer = new MutationObserver(() => {
        if (!document.getElementById('intro-particles')) {
            cancelAnimationFrame(animId);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    if (spotifyProgressInterval) {
        clearInterval(spotifyProgressInterval);
    }
    if (cursorRafId) {
        cancelAnimationFrame(cursorRafId);
    }
    if (audioElement) {
        audioElement.pause();
    }
});
