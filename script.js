console.log('Shourya Singh Here!');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        // List of copyright-free songs with lyrics
        songs = [
            'I Want You Close To Me.mp3',
            'Come On.mp3',
            'Alive.mp3',
            'Summer Days.mp3',
            'Better Days.mp3',
            'Sunshine Melody.mp3',
            'City Lights.mp3',
            'Morning Coffee.mp3'
        ];
        
        // Map of song filenames to their metadata including artist and source
        window.songMetadata = {
            'I Want You Close To Me.mp3': 'JARA',
            'Come On.mp3': 'Doc Hartley',
            'Alive.mp3': 'Song Writerz',
            'Summer Days.mp3': 'Midnight North',
            'Better Days.mp3': 'The 126ers',
            'Sunshine Melody.mp3': 'Riot',
            'City Lights.mp3': 'Silent Partner',
            'Morning Coffee.mp3': 'The Green Orbs'
        };
        
        // Show all songs, including remote ones
        console.log('All available songs:', songs);
        
        console.log('Loaded songs:', songs);
        
        updateSongList();
    } catch (error) {
        console.error('Error in getSongs:', error);
        // Fallback to full list in case of error
        songs = [
            'I Want You Close To Me.mp3',
            'Come On.mp3',
            'Alive.mp3',
            'Summer Days.mp3',
            'Better Days.mp3',
            'Sunshine Melody.mp3',
            'City Lights.mp3',
            'Morning Coffee.mp3'
        ];
        updateSongList();
    }
}

function getArtistForSong(song) {
    const metadata = {
        'I Want You Close To Me.mp3': 'JARA',
        'Come On.mp3': 'Doc Hartley',
        'Alive.mp3': 'Song Writerz',
        'Summer Days.mp3': 'Midnight North',
        'Better Days.mp3': 'The 126ers',
        'Sunshine Melody.mp3': 'Riot',
        'City Lights.mp3': 'Silent Partner',
        'Morning Coffee.mp3': 'The Green Orbs'
    };
    return metadata[song] || song.split('.mp3')[0]; // Return song name without .mp3 if artist not found
}

function updateSongList() {
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        const artist = getArtistForSong(song); 
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="music.svg" alt="">
                <div class="info">
                    <div>${decodeURI(song).replace(/%20/g, " ")}</div>
                    <div>${artist}</div> <!-- Displaying the artist name here -->
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    }
    attachSongListeners();
}

function attachSongListeners() {
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    try {
        // Handle both full path and just the filename
        const trackName = track.includes('/') ? track.split('/').pop() : track;
        const songNameWithoutExt = trackName.replace(/\.mp3$/, '');
        
        // Check if the song is available locally
        const localPath = `${currFolder}/${trackName.replace(/ /g, '%20')}`;
        const remoteBaseUrl = 'https://www.soundhelix.com/examples/mp3';
        
        // Map of song names to their remote URLs (using SoundHelix as a source for demo)
        const remoteSongs = {
            'Summer Days': `${remoteBaseUrl}/SoundHelix-Song-1.mp3`,
            'Better Days': `${remoteBaseUrl}/SoundHelix-Song-2.mp3`,
            'Sunshine Melody': `${remoteBaseUrl}/SoundHelix-Song-3.mp3`,
            'City Lights': `${remoteBaseUrl}/SoundHelix-Song-4.mp3`,
            'Morning Coffee': `${remoteBaseUrl}/SoundHelix-Song-5.mp3`
        };
        
        // Update the song info display
        const songNameElement = document.querySelector(".songinfo");
        const artistName = getArtistForSong(trackName); 
        songNameElement.innerHTML = `
            ${songNameWithoutExt} 
            <br> <span class="artist-info">${artistName}</span>
        `;
        
        // Reset song time display
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
        
        // Set the source - try local first, then remote
        if (songs.includes(trackName)) {
            currentSong.src = localPath;
            console.log('Playing local song:', localPath);
        } else if (remoteSongs[songNameWithoutExt]) {
            currentSong.src = remoteSongs[songNameWithoutExt];
            console.log('Playing remote song:', remoteSongs[songNameWithoutExt]);
        }
        
        if (!pause) {
            const playPromise = currentSong.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Playback started successfully');
                    const playButton = document.querySelector("#play");
                    if (playButton) {
                        playButton.src = "pause.svg";
                    }
                }).catch(error => {
                    console.error('Error playing song:', error);
                    // Try with a different path format if the first attempt fails
                    const altPath = `songs/${trackName.replace(/ /g, '%20')}`;
                    console.log('Trying alternative path:', altPath);
                    currentSong.src = altPath;
                    return currentSong.play();
                }).then(() => {
                    const playButton = document.querySelector("#play");
                    if (playButton) {
                        playButton.src = "pause.svg";
                    }
                }).catch(e => {
                    console.error('All playback attempts failed:', e);
                });
            }
        }
    } catch (error) {
        console.error('Error in playMusic:', error);
    }
};



async function displayAlbums() {
    try {
        // Try to fetch albums dynamically first
        let response = await fetch(`/songs/`);
        if (response.ok) {
            let text = await response.text();
            let div = document.createElement("div");
            div.innerHTML = text;
            let anchors = div.getElementsByTagName("a");
            let cardContainer = document.querySelector(".cardContainer");
            
            for (let e of anchors) {
                if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                    let folder = e.href.split("/").slice(-2)[0];
                    let metadataResponse = await fetch(`songs/${folder}/info.json`);
                    if (metadataResponse.ok) {
                        let metadata = await metadataResponse.json();
                        cardContainer.innerHTML += `
                            <div data-folder="${folder}" class="card">
                                <div class="play">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <img src="songs/${folder}/cover.jpg" alt="${metadata.title}">
                                <h2>${metadata.title}</h2>
                                <p>${metadata.description}</p>
                            </div>`;
                    }
                }
            }
        } else {
            // Fallback to static cards if dynamic loading fails
            const albums = [
                {
                    folder: 'ncs',
                    title: 'NCS Releases',
                    description: 'Best of NoCopyrightSounds',
                    cover: 'songs/ncs/cover.jpg'
                },
                {
                    folder: 'cs2',
                    title: 'Workout Mix',
                    description: 'High energy tracks',
                    cover: 'songs/cs2/cover.jpg'
                },
                {
                    folder: 'cs3',
                    title: 'Focus Mix',
                    description: 'Concentration booster',
                    cover: 'songs/cs3/cover.jpg'
                },
                {
                    folder: 'cs4',
                    title: 'Party Mix',
                    description: 'Dance the night away',
                    cover: 'songs/cs4/cover.jpg'
                }
            ];

            let cardContainer = document.querySelector(".cardContainer");
            for (let album of albums) {
                cardContainer.innerHTML += `
                    <div data-folder="${album.folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="${album.cover}" alt="${album.title}">
                        <h2>${album.title}</h2>
                        <p>${album.description}</p>
                    </div>`;
            }
        }
        
        attachAlbumListeners();
    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}

// Function to show flash message
function showFlashMessage(message, type = 'info') {
    // Debug: Check current theme
    const isDark = document.body.classList.contains('dark');
    console.log('Current theme:', isDark ? 'dark' : 'light');
    
    // Create message element if it doesn't exist
    let messageEl = document.querySelector('.flash-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'flash-message';
        document.body.appendChild(messageEl);
        
        // Add CSS for the flash message
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translate(-50%, -20px); opacity: 0; }
                to { transform: translate(-50%, 24px); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { transform: translate(-50%, 24px); opacity: 1; }
                to { transform: translate(-50%, 0); opacity: 0; }
            }
            
            .flash-message {
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 1000;
                opacity: 0;
                transition: all 0.3s ease-out;
                pointer-events: none;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 90%;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            
            .flash-message.visible {
                animation: slideIn 0.3s forwards;
            }
            
            .flash-message.hidden {
                animation: fadeOut 0.3s forwards;
            }
            
            .flash-message::before {
                content: '♪';
                font-size: 16px;
                opacity: 0.9;
            }
            
            /* Light theme */
            body:not(.dark) .flash-message {
                background: rgba(255, 255, 255, 0.96);
                color: #2d3748;
                border: 1px solid rgba(0, 0, 0, 0.08);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            /* Dark theme */
            body.dark .flash-message {
                background: rgba(26, 32, 44, 0.96);
                color: #f7fafc;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            /* Responsive adjustments */
            @media (max-width: 480px) {
                .flash-message {
                    width: auto;
                    max-width: 90%;
                    padding: 10px 20px;
                    font-size: 13px;
                    border-radius: 6px;
                }
                
                .flash-message::before {
                    font-size: 14px;
                }
            }`;
        document.head.appendChild(style);
    }
    
    // Set message and show
    messageEl.textContent = message;
    messageEl.className = 'flash-message';
    messageEl.classList.add('visible');
    
    // Auto-hide after 3 seconds
    clearTimeout(window.flashMessageTimeout);
    window.flashMessageTimeout = setTimeout(() => {
        messageEl.classList.remove('visible');
        messageEl.classList.add('hidden');
    }, 3000);
}

// Add event listeners for album cards
function attachAlbumListeners() {
    document.querySelectorAll('.card').forEach((card, index) => {
        card.addEventListener('click', async (e) => {
            // Don't navigate if play button was clicked
            if (e.target.closest('.play')) {
                return;
            }
            
            // Get album title
            const albumTitle = card.querySelector('h2')?.textContent || 'this album';
            
            // Get exactly 6 random songs from the main songs list
            const randomSongs = [...songs]
                .sort(() => 0.5 - Math.random())
                .slice(0, 6); // Exactly 6 random songs
            
            // Create a temporary playlist for the album
            const tempSongs = [...randomSongs];
            const currentSongs = [...songs]; // Store current songs
            
            // Show flash message
            showFlashMessage(`Now showing songs from ${albumTitle}`);
            
            // Update the UI with the album's songs
            songs = tempSongs;
            updateSongList();
            
            // Scroll to songs section
            document.querySelector('.songs').scrollIntoView({ behavior: 'smooth' });
            
            // Restore the original songs after a short delay to allow for smooth transition
            setTimeout(() => {
                songs = currentSongs;
            }, 100);
        });
        
        // Add play button functionality
        const playButton = card.querySelector('.play');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.stopPropagation();
                // Play a random song from the album
                const randomSongs = [...songs].sort(() => 0.5 - Math.random());
                if (randomSongs.length > 0) {
                    playMusic(randomSongs[0]);
                }
            });
        }
    });
}

async function main() {
    try {
        // Initialize with the songs directory
        await getSongs("songs");
        if (songs.length > 0) {
            playMusic(songs[0], true);
        } else {
            console.error('No songs found in the songs directory');
        }
        await displayAlbums();

        const playButton = document.querySelector("#play");

        if (!playButton) {
            console.error("Play button not found");
            return;
        }

        playButton.addEventListener("click", () => {
            if (currentSong.paused) {
                if (!currentSong.src || currentSong.src === "") {
                    playMusic(songs[0]);
                } else {
                    currentSong.play();
                }
                playButton.src = "pause.svg";
            } else {
                currentSong.pause();
                playButton.src = "play.svg";
            }
        });

        currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        });

        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        });
  
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0"; // Slide in the left menu
        });
        
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-100%"; // Slide out the left menu
        });
        
  
        document.querySelector("#previous").addEventListener("click", () => {
            currentSong.pause();
            let currentTrack = decodeURI(currentSong.src.split("/").pop()); 
            let index = songs.indexOf(currentTrack); 
            if (index > 0) {
                playMusic(songs[index - 1]); 
            } else {
                playMusic(songs[songs.length - 1]); 
            }
        });
        
        document.querySelector("#next").addEventListener("click", () => {
            currentSong.pause();
            let currentTrack = decodeURI(currentSong.src.split("/").pop()); 
            let index = songs.indexOf(currentTrack); 
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]); 
            } else {
                playMusic(songs[0]); 
            }
        });
        
  
  

        document.querySelector(".range input").addEventListener("change", e => {
            currentSong.volume = parseInt(e.target.value) / 100;
            let volumeIcon = document.querySelector(".volume > img");
            volumeIcon.src = currentSong.volume > 0 ? volumeIcon.src.replace("mute.svg", "volume.svg") : volumeIcon.src.replace("volume.svg", "mute.svg");
        });

        document.querySelector(".volume > img").addEventListener("click", e => {
            let volumeIcon = e.target;
            if (volumeIcon.src.includes("volume.svg")) {
                volumeIcon.src = volumeIcon.src.replace("volume.svg", "mute.svg");
                currentSong.volume = 0;
                document.querySelector(".range input").value = 0;
            } else {
                volumeIcon.src = volumeIcon.src.replace("mute.svg", "volume.svg");
                currentSong.volume = 0.1;
                document.querySelector(".range input").value = 10;
            }
        });

    } catch (error) {
        console.error('Error initializing the application:', error);
    }
}

function toggleButton() {
    const body = document.body;
    const toggleCircle = document.querySelector('.toggle-circle');

    
    body.classList.toggle('dark-theme');
    body.classList.toggle('light-theme'); 

    
    if (body.classList.contains('dark-theme')) {
        toggleCircle.style.transform = 'translateX(26px)';
        console.log('Dark theme applied');
    } else {
        toggleCircle.style.transform = 'translateX(0)';
        console.log('Light theme applied');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const toggleButton = document.querySelector('.toggle-button');

    
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`${currentTheme}-theme`);
    console.log(`Current theme: ${currentTheme}`);

    
    

    
    toggleButton.addEventListener('click', () => {
        toggleButton();
        saveThemePreference();
    });
});

function saveThemePreference() {
    
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

const songMetadata = {
    "I Want You Close To Me.mp3": "JARA",
    "Come On.mp3": "Doc Hartley",
    "Alive.mp3": "Song Writerz"
};

main();
