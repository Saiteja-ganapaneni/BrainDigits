let targetNumber, minRange, maxRange, guessCount, hints, tooHighLowCount;
const maxGuesses = 5;
let timerInterval, timerTime = 120;
let gameOver = false;

function startGame() {
  const playerNameInput = document.getElementById("playerName");
  const playerName = playerNameInput.value.trim();

  if (playerName.length === 0) {
    alert("Please enter your name to start the game.");
    return;
  }

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";

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

function resetGame() {
  targetNumber = Math.floor(Math.random() * 400 + 100);
  const buffer = 10 + Math.floor(Math.random() * 30);
  minRange = Math.floor((targetNumber - buffer) / 10) * 10;
  maxRange = Math.ceil((targetNumber + buffer) / 10) * 10;

  document.getElementById("range").textContent = `Number is between ${minRange} and ${maxRange}`;
  guessCount = 0;
  tooHighLowCount = 0;

  hints = shuffle([
    targetNumber % 2 === 0 ? "It's an even number." : "It's an odd number.",
    `It is ${targetNumber % 3 === 0 ? '' : 'not '}divisible by 3.`,
    isPrime(targetNumber) ? "It is a prime number." : "It is a composite number."
  ]);

  document.getElementById("guessesLeft").textContent = `Guesses left: ${maxGuesses}`;
  document.getElementById("message").textContent = "";
  document.getElementById("hintBox").innerHTML = "";
}

function checkGuess() {
  if (gameOver) return;

  const guessInput = document.getElementById("guessInput");
  const guess = parseInt(guessInput.value);
  if (isNaN(guess)) return;

  guessCount++;
  const messageBox = document.getElementById("message");

  if (guess === targetNumber) {
    messageBox.innerHTML = `<span class="congrats">🎉 Congratulations! You guessed it!</span>`;
    guessInput.classList.add("correct-guess");
    guessInput.disabled = true;
    stopTimer();
    gameOver = true;
    startConfetti();

    saveWinner(guessCount);

    setTimeout(() => {
      stopConfetti();
      endRound();
    }, 4000);

  } else {
    if (tooHighLowCount < 2) {
      messageBox.textContent = guess > targetNumber ? "Too high!" : "Too low!";
      tooHighLowCount++;
    } else {
      messageBox.textContent = "Try again!";
    }

    if (guessCount >= maxGuesses) {
      messageBox.textContent = `❌ Out of guesses! The number was ${targetNumber}`;
      guessInput.disabled = true;
      stopTimer();
      gameOver = true;
      setTimeout(endRound, 3000);
    }
  }

  document.getElementById("guessesLeft").textContent = `Guesses left: ${maxGuesses - guessCount}`;
}

function showHint() {
  if (hints.length > 0 && !gameOver) {
    const hint = hints.shift();
    const hintEl = document.createElement("p");
    hintEl.textContent = hint;
    document.getElementById("hintBox").appendChild(hintEl);
  } else if (!gameOver) {
    alert("No more hints available!");
  }
}

function startTimer(duration) {
  let timeRemaining = duration;
  const timerEl = document.getElementById("timer");
  timerEl.textContent = `Time left: ${timeRemaining}s`;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeRemaining--;
    timerEl.textContent = `Time left: ${timeRemaining}s`;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerEl.textContent = "Time's up!";
      if (!gameOver) {
        document.getElementById("guessInput").disabled = true;
        document.getElementById("message").textContent = `⏰ Time's up! The number was ${targetNumber}`;
        gameOver = true;
        setTimeout(endRound, 3000);
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function endRound() {
  document.getElementById("startScreen").style.display = "block";
  document.getElementById("gameScreen").style.display = "none";
  updateLeaderboardDisplay();
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
    container.innerHTML = "<h3>Leaderboard</h3><p>No winners yet</p>";
    return;
  }

  let html = "<h3>Leaderboard</h3><ol>";
  leaderboard.forEach(entry => {
    html += `<li>${entry.name}: least guesses - ${entry.guesses}</li>`;
  });
  html += "</ol>";
  container.innerHTML = html;
}



let confettiInterval;
function startConfetti() {
  const confettiCount = 100;
  const colors = ["#ccff33", "#33ccff", "#ff66cc", "#ffcc33"];
  const canvas = document.createElement("canvas");
  canvas.id = "confettiCanvas";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let confettiPieces = [];

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function ConfettiPiece() {
    this.x = randomRange(0, canvas.width);
    this.y = randomRange(-canvas.height, 0);
    this.size = randomRange(5, 10);
    this.speed = randomRange(2, 5);
    this.angle = randomRange(0, 2 * Math.PI);
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.tilt = randomRange(-10, 10);
  }

  ConfettiPiece.prototype.update = function () {
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.y = randomRange(-canvas.height, 0);
      this.x = randomRange(0, canvas.width);
    }
  };

  ConfettiPiece.prototype.draw = function () {
    ctx.beginPath();
    ctx.lineWidth = this.size / 2;
    ctx.strokeStyle = this.color;
    ctx.moveTo(this.x + this.tilt, this.y);
    ctx.lineTo(this.x, this.y + this.size);
    ctx.stroke();
  };

  for (let i = 0; i < confettiCount; i++) {
    confettiPieces.push(new ConfettiPiece());
  }

  confettiInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach(piece => {
      piece.update();
      piece.draw();
    });
  }, 30);
}

function stopConfetti() {
  clearInterval(confettiInterval);
  const canvas = document.getElementById("confettiCanvas");
  if (canvas) canvas.remove();
}


window.onload = () => {
  document.getElementById("startScreen").style.display = "block";
  document.getElementById("gameScreen").style.display = "none";

 
  document.getElementById("message").textContent = "";
  document.getElementById("hintBox").innerHTML = "";
  document.getElementById("guessesLeft").textContent = "";
  document.getElementById("timer").textContent = "";

  updateLeaderboardDisplay();
};
