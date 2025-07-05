console.log('Welcome to Samify');

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = 0;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${m}:${s}`;
}

async function loadSongs(songList) {
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    songList.forEach(song => {
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Playing in Samify</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    });

    document.querySelectorAll(".songList li").forEach((li, index) => {
        li.addEventListener("click", () => {
            currentIndex = index;
            playMusic(songs[currentIndex]);
        });
    });
}

function playMusic(track, pause = false) {
    currentSong.src = `${currFolder}/${track}`;
    currentIndex = songs.findIndex(song => song === track);

    const currentTrackName = decodeURIComponent(track).replace(".mp3", "").trim().toLowerCase().replace(/\s+/g, ' ');
    document.querySelectorAll(".songList ul li").forEach(li => li.classList.remove("playing"));

    document.querySelectorAll(".songList ul li").forEach(li => {
        const nameInList = li.querySelector(".info div").innerText.replace(".mp3", "").trim().toLowerCase().replace(/\s+/g, ' ');
        if (nameInList === currentTrackName) {
            li.classList.add("playing");
        }
    });

    const songInfoEl = document.querySelector(".songinfo");
    if (songInfoEl) {
        const cleanName = decodeURIComponent(track).replace(/\.mp3$/, '');
        songInfoEl.innerText = cleanName;
    }

    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
}

async function displayAlbums() {
    const res = await fetch("playlists.json");
    const playlists = await res.json();

    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    playlists.forEach(playlist => {
        cardContainer.innerHTML += `
            <div data-folder="${playlist.folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="${playlist.cover}" alt="">
                <h2>${playlist.title}</h2>
                <p>${playlist.description}</p>
            </div>`;
    });

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            const selected = playlists.find(p => p.folder === folder);
            currFolder = `songs/${folder}`;
            songs = selected.songs;
            currentIndex = 0;

            document.querySelector(".playlistTitle").innerText = selected.title;
            await loadSongs(songs);
            playMusic(songs[0]);

            document.querySelectorAll(".card").forEach(c => c.classList.remove("playing"));
            card.classList.add("playing");
        });
    });
}

async function main() {
    const playBtn = document.getElementById("play");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("previous");

    await displayAlbums();

    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerText =
                `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    currentSong.addEventListener("ended", () => {
        if (currentIndex + 1 < songs.length) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        } else {
            currentIndex = 0;
            playMusic(songs[currentIndex]);
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            playMusic(songs[currentIndex]);
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex + 1 < songs.length) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        } else {
            currentIndex = 0;
            playMusic(songs[currentIndex]);
        }
    });

    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        document.querySelector(".volume img").src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    document.querySelector(".volume img").addEventListener("click", (e) => {
        const input = document.querySelector(".range input");
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            input.value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            input.value = 10;
        }
    });
}

main();
