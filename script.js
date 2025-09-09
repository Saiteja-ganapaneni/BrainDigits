let targetNumber, minRange, maxRange, guessCount, hints, tooHighLowCount;
const maxGuesses = 5;
let timerInterval, timerTime = 120;
let gameOver = false;
let roomId = "";
let joinedPlayers = [];
let pausedForRules = false;
let currentHints = [];

function startGame() {
    const playerName = document.getElementById("playerName").value.trim();
    const createRoomVal = document.getElementById("createRoomId").value.trim();
    const joinRoomVal = document.getElementById("joinRoomId").value.trim();
    if (!playerName) {
        alert("Please enter your name to start the game.");
        return;
    }
    if (createRoomVal) {
        roomId = createRoomVal;
        joinedPlayers = [playerName];
        showRoomInfo("Created Room ID: <b>" + roomId + "</b><br>Players: " + joinedPlayers.map(n => `<span>${n}</span>`).join(" "));
    } else if (joinRoomVal) {
        roomId = joinRoomVal;
        let rooms = JSON.parse(localStorage.getItem("gameRooms") || "{}");
        if (!rooms[roomId]) { rooms[roomId] = []; }
        if (!rooms[roomId].includes(playerName)) {
            rooms[roomId].push(playerName);
        }
        localStorage.setItem("gameRooms", JSON.stringify(rooms));
        joinedPlayers = rooms[roomId];
        showRoomInfo("Joined Room ID: <b>" + roomId + "</b><br>Players: " + joinedPlayers.map(n => `<span>${n}</span>`).join(" "));
    } else {
        roomId = "";
        joinedPlayers = [playerName];
        showRoomInfo("");
    }
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "flex";
    document.getElementById("roomInfo").style.display = roomId ? "block" : "none";
    resetGame();
    startTimer(timerTime);
    gameOver = false;
    tooHighLowCount = 0;
    document.getElementById("guessInput").value = "";
    document.getElementById("guessInput").disabled = false;
    document.getElementById("guessInput").classList.remove("correct-guess");
    document.getElementById("message").textContent = "";
    document.getElementById("hintBox").innerHTML = "";
    updateLeaderboardDisplay();
}

function showRoomInfo(msg) {
    const infoDiv = document.getElementById("roomInfo");
    if (msg) {
        infoDiv.innerHTML = msg;
        infoDiv.style.display = "block";
    } else {
        infoDiv.innerHTML = "";
        infoDiv.style.display = "none";
    }
}

function resetGame() {
    targetNumber = Math.floor(Math.random() * 400 + 100);
    // Range diff 50–100
    const rangeDiff = Math.floor(Math.random() * 51) + 50;
    let bufferLow = Math.floor(rangeDiff / 2);
    let bufferHigh = rangeDiff - bufferLow;
    minRange = targetNumber - bufferLow;
    maxRange = targetNumber + bufferHigh;

    document.getElementById("range").textContent = `Number is between ${minRange} and ${maxRange}`;
    guessCount = 0;
    tooHighLowCount = 0;
    gameOver = false;
    currentHints = shuffle([
        targetNumber % 2 === 0 ? "It's an even number." : "It's an odd number.",
        `It is ${targetNumber % 3 === 0 ? '' : 'not '}divisible by 3.`,
        isPrime(targetNumber) ? "It is a prime number." : "It is a composite number."
    ]);
    document.getElementById("guessesLeft").textContent = `Guesses left: ${maxGuesses}`;
    document.getElementById("message").textContent = "";
    document.getElementById("hintBox").innerHTML = "";

    // Remove: Do NOT show any hint immediately upon game start
    // showSpecificHint(0);
}

// Show a hint by index (0 = first hint, 1 = second, 2 = third)
function showSpecificHint(idx) {
    const hintBox = document.getElementById("hintBox");
    if (idx < currentHints.length) {
        while (hintBox.childElementCount <= idx) {
            const hintEl = document.createElement("p");
            hintEl.textContent = currentHints[hintBox.childElementCount];
            hintBox.appendChild(hintEl);
        }
    }
}

function checkGuess() {
    if (gameOver) return;
    const guessInput = document.getElementById("guessInput");
    const guess = parseInt(guessInput.value);
    if (isNaN(guess)) return;

    guessCount++;

    // Show hints only after each guess (max 3 hints)
    if (guessCount <= 3) showSpecificHint(guessCount - 1);

    const messageBox = document.getElementById("message");
    if (guess === targetNumber) {
        messageBox.innerHTML = `🎉 Congratulations! You guessed it!`;
        guessInput.classList.add("correct-guess");
        guessInput.disabled = true;
        stopTimer();
        gameOver = true;
        showWinnerAnimation();
        startConfetti();
        saveWinner(guessCount);
        setTimeout(() => {
            stopWinnerAnimation();
            stopConfetti();
            endRound();
        }, 3200);
    } else {
        if (tooHighLowCount < 3) {
            messageBox.textContent = guess > targetNumber ? "Too high!" : "Too low!";
            tooHighLowCount++;
        } else {
            messageBox.textContent = "Try again!";
        }
        if (guessCount >= maxGuesses) {
            guessInput.disabled = true;
            stopTimer();
            gameOver = true;
            messageBox.innerHTML = `<div class="reveal-ans">❌ Out of guesses!<br>The number was <span>${targetNumber}</span></div>`;
            setTimeout(endRound, 3000);
        }
    }
    document.getElementById("guessesLeft").textContent = `Guesses left: ${maxGuesses - guessCount}`;
}

// Winner animation
function showWinnerAnimation() {
    const anim = document.getElementById('winnerAnim');
    anim.style.display = "flex";
}
function stopWinnerAnimation() {
    const anim = document.getElementById('winnerAnim');
    anim.style.display = "none";
}

let timerPaused = false;
let timerRemaining = 0;

function startTimer(duration) {
    timerRemaining = duration;
    const timerEl = document.getElementById("timer");
    timerEl.textContent = `Time left: ${timerRemaining}s`;
    clearInterval(timerInterval);
    timerPaused = false;
    timerInterval = setInterval(() => {
        if (timerPaused) return;
        timerRemaining--;
        timerEl.textContent = `Time left: ${timerRemaining}s`;
        if (timerRemaining <= 0) {
            clearInterval(timerInterval);
            timerEl.textContent = "Time's up!";
            if (!gameOver) {
                document.getElementById("guessInput").disabled = true;
                document.getElementById("message").textContent = `⏰ Time's up! The number was ${targetNumber}`;
                gameOver = true;
                setTimeout(endRound, 2200);
            }
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetFullGame() {
    resetGame();
    startTimer(timerTime);
    gameOver = false;
    tooHighLowCount = 0;
    document.getElementById("guessInput").value = "";
    document.getElementById("guessInput").disabled = false;
    document.getElementById("guessInput").classList.remove("correct-guess");
    document.getElementById("message").textContent = "";
    document.getElementById("hintBox").innerHTML = "";
    updateLeaderboardDisplay();
}

function goBack() {
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "flex";
    showRoomInfo("");
    stopTimer();
}

function endRound() {
    document.getElementById("startScreen").style.display = "flex";
    document.getElementById("gameScreen").style.display = "none";
    updateLeaderboardDisplay();
    stopTimer();
}

function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function saveWinner(guesses) {
    const playerName = document.getElementById("playerName").value.trim();
    if (playerName === "") return;
    let leaderboard = JSON.parse(localStorage.getItem("numberNexusLeaderboard") || "[]");
    const existing = leaderboard.findIndex(entry => entry.name === playerName);
    if (existing !== -1) {
        if (guesses < leaderboard[existing].guesses) {
            leaderboard[existing].guesses = guesses;
        }
    } else {
        leaderboard.push({ name: playerName, guesses: guesses });
    }
    leaderboard.sort((a, b) => a.guesses - b.guesses);
    leaderboard = leaderboard.slice(0, 3);
    localStorage.setItem("numberNexusLeaderboard", JSON.stringify(leaderboard));
}

function updateLeaderboardDisplay() {
    const container = document.getElementById("leaderboardContainer");
    let leaderboard = JSON.parse(localStorage.getItem("numberNexusLeaderboard") || "[]");
    if (leaderboard.length === 0) {
        container.innerHTML = "<b>No winners yet</b>";
        return;
    }
    let html = "<h3>Leaderboard</h3><ol>";
    leaderboard.forEach(entry => {
        html += `<li>${entry.name}: ${entry.guesses} guesses</li>`;
    });
    html += "</ol>";
    container.innerHTML = html;
}

// Rules modal logic
function openRules() {
    document.getElementById("rulesSection").style.display = "flex";
    timerPaused = true;
}
function closeRules() {
    document.getElementById("rulesSection").style.display = "none";
    timerPaused = false;
}

function startConfetti() {}
function stopConfetti() {}
