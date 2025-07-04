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
        // Always use the static list of songs that we know exist in the songs directory
        songs = [
            'I Want You Close To Me.mp3',
            'Come On.mp3',
            'Alive.mp3'
        ];
        
        // Try to verify which songs actually exist
        const verifiedSongs = [];
        for (const song of songs) {
            try {
                const response = await fetch(`${folder}/${song.replace(/ /g, '%20')}`, { method: 'HEAD' });
                if (response.ok) {
                    verifiedSongs.push(song);
                }
            } catch (e) {
                console.log(`Could not find ${song}, skipping...`);
            }
        }
        
        // If we found any songs, use them, otherwise keep the original list
        if (verifiedSongs.length > 0) {
            songs = verifiedSongs;
        }
        
        console.log('Loaded songs:', songs);
        
        updateSongList();
    } catch (error) {
        console.error('Error in getSongs:', error);
        // Fallback to static list in case of error
        songs = [
            'I Want You Close To Me.mp3',
            'Come On.mp3',
            'Alive.mp3'
        ];
        updateSongList();
    }
}

function getArtistForSong(song) {
    return songMetadata[song] || "Unknown Artist"; 
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
        
        // Create proper URL for the audio file
        const audioPath = `${currFolder}/${trackName.replace(/ /g, '%20')}`;
        console.log('Attempting to play:', audioPath);
        
        // Update the song info display
        const songNameElement = document.querySelector(".songinfo");
        const artistName = getArtistForSong(trackName); 
        songNameElement.innerHTML = `
            ${trackName.replace(/%20/g, " ")} 
            <br> <span class="artist-info">${artistName}</span>
        `;
        
        // Reset song time display
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
        
        // Set the source and handle playback
        currentSong.src = audioPath;
        
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
                    folder: 'cs1',
                    title: 'Chill Mix',
                    description: 'Relaxing beats',
                    cover: 'songs/cs1/cover.jpg'
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

function attachAlbumListeners() {
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getSongs(`songs/${e.dataset.folder}`);
            playMusic(songs[0]);
        });
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
