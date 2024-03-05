let fet = await fetch('../song.json');
let songData = await fet.json()
// .then(response => response.json())
// .then(data =>
// {
//     songData = data
//     console.log(data);
// })
// .catch(error => console.error('Error fetching JSON:', error));

import { getCookie, setCookie } from './CookieManager.js';
let guesses = []

let heardleInputBar = document.getElementById('heardle-search-bar')
let heardleButtonBar = document.getElementById('heardle-butons-bar')
let playerBar = document.getElementById('heardle-player')
let gameOverButton = document.getElementById('game-over-button')
let gameOverContainer = document.getElementById('game-over-container')
heardleButtonBar.style.width = heardleInputBar.offsetWidth + "px"
playerBar.style.width = heardleInputBar.offsetWidth + "px"
let progressBar = document.getElementById('heardle-progress-bar')
let percentages = ["6.25%", "12.5%", "25%", "43.75%", "68.75%", "100%"]
let secondsArray = [1, 2, 4, 7, 11, 16]
var songChunkIndex = 0
let gameOver = false

for (let index in percentages)
{
    let percentage = percentages[index]
    let chunk = document.createElement('div')

    chunk.className = "progress-marker"
    chunk.style.left = percentage
    chunk.style.zIndex = index
    if (index == percentages.length - 1)
    {
        chunk.style.borderRight = "none"
    }

    progressBar.appendChild(chunk)
}

let playButton = document.getElementById('play-button');
let chunk = document.getElementById('progress-slice')
chunk.style.width = percentages[songChunkIndex]

gameOverButton.addEventListener('click', function ()
{
    gameOverContainer.style.display = 'none'
})
let audioPlayer = null

playButton.addEventListener('click', async function ()
{
    // let audioPlayer = document.getElementById('audio-player');
    audioPlayer = new Audio(songData['previewLink'])

    let isPlaying = false;

    // On video playing toggle values
    audioPlayer.onplaying = function ()
    {
        isPlaying = true;
    };

    // On video pause toggle values
    audioPlayer.onpause = function ()
    {
        isPlaying = false;
    };

    // Play video function
    async function playVid()
    {
        if (audioPlayer.paused && !isPlaying)
        {
            return audioPlayer.play();
        }
    }

    // Pause video function
    function pauseVid()
    {
        if (!audioPlayer.paused && isPlaying)
        {
            audioPlayer.pause();
        }
    }
    // audioPlayer.src = songData['previewLink']

    let timeStart = document.getElementById('time-start');
    audioPlayer.addEventListener('timeupdate', function ()
    {
        let minutes = Math.floor(audioPlayer.currentTime / 60);
        let seconds = Math.floor(audioPlayer.currentTime % 60);
        timeStart.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    });

    if (audioPlayer.paused)
    {
        await playVid()

        setTimeout(function ()
        {
            pauseVid()
            audioPlayer.currentTime = 0;

            chunk.style.transition = null
            chunk.style.backgroundPosition = null
        }, (secondsArray[songChunkIndex] * 1000) + 200);

        chunk.style.transition = secondsArray[songChunkIndex] + "s ease-out"
        chunk.style.backgroundPosition = "left"
    } else
    {
        pauseVid()
        audioPlayer.currentTime = 0;

        chunk.style.transition = null
        chunk.style.backgroundPosition = null
    }
});



let autofill = document.getElementById('search-bar-autofill')
autofill.style.width = heardleInputBar.offsetWidth + "px"

let delayTimer;

heardleInputBar.addEventListener('input', function ()
{
    if (gameOver)
    {
        return
    }
    clearTimeout(delayTimer);

    delayTimer = setTimeout(function ()
    {
        let input = heardleInputBar.value
        updateAutoFill(input)
    }, 1000);
});

heardleInputBar.addEventListener('blur', function ()
{
    if (gameOver)
    {
        return
    }
    clearTimeout(delayTimer);
});

async function updateAutoFill(input)
{
    autofill.innerHTML = ""
    let url = "https://phgd7dazflz4fxmttuflmt5m2i0sbwuu.lambda-url.us-west-1.on.aws?q=" + input
    let resp = await fetch(url)
    let resultObjects = await resp.json()
    let texts = []
    console.log(resultObjects)
    if (resultObjects.length > 0)
    {
        for (let song of resultObjects)
        {
            texts.push(song.songName + " - " + song.artistName)
        }

        for (let text of texts)
        {
            let autoentry = document.createElement('div')
            autoentry.className = "autofill-option"
            autoentry.innerHTML = text

            autoentry.addEventListener('click', function ()
            {
                heardleInputBar.value = autoentry.innerHTML
                autofill.style.display = 'none';
            })

            autofill.appendChild(autoentry)
        }
        autofill.style.display = "flex"
    }
}

function checkGuess(guess)
{
    let name = songData.songName
    let artist = songData.artistName

    if (guess == (name + ' - ' + artist))
    {
        return true
    }
    return false
}

function endGame(success)
{
    gameOver = true
    if (success)
    {
        gameOverButton.innerHTML = "Yippie!!"
        console.log('game won')
    }
    else
    {
        gameOverButton.innerHTML = "Better luck next time!"
        let gameOver = document.getElementById('game-over-window')
        gameOver.innerHTML = "Song name was: " + songData.songName + " by " + songData.artistName
        console.log('game lost')
    }
    gameOverContainer.style.display = "flex"
}

function makeGuess(guess)
{
    guesses.push(guess)
    let cookieData = { "guesses": guesses }
    setCookie('guesses', cookieData)

    let isCorrect = checkGuess(guess)
    let currentGuess = document.getElementById('heardle-guesses').children[songChunkIndex]

    currentGuess.innerHTML = guess
    currentGuess.classList.add(isCorrect ? "correct-guess" : "incorrect-guess")

    if (isCorrect)
    {
        endGame(isCorrect)
    }
    else
    {
        if (songChunkIndex == percentages.length - 1)
        {
            endGame(isCorrect)
        }
        else
        {
            songChunkIndex += 1
            chunk.style.width = percentages[songChunkIndex]
        }
    }
}

let skipButton = document.getElementById('skip-button')
let submitButton = document.getElementById('submit-button')

skipButton.addEventListener('click', function ()
{
    if (gameOver)
    {
        return
    }
    makeGuess("Skipped")
})

submitButton.addEventListener('click', function ()
{
    if (gameOver)
    {
        return
    }
    if (heardleInputBar.value != "")
    {
        makeGuess(heardleInputBar.value)
    }
})

document.addEventListener('click', function (event)
{
    if (!autofill.contains(event.target) && event.target !== autofill)
    {
        autofill.style.display = 'none';
    }
});

if (getCookie('guesses') != null)
{
    for (let guess of getCookie('guesses')['guesses'])
    {
        makeGuess(guess)
    }
}