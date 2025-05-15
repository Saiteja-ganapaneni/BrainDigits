let targetNumber, minRange, maxRange, guessCount, hints, tooHighLowCount = 0;
const maxGuesses = 5;
let timerInterval, timerTime = 120;

function startGame() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  resetGame();
  startTimer(timerTime);
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

  document.getElementById("message").textContent = "";
  document.getElementById("hintBox").innerHTML = "";
  document.getElementById("guessesLeft").textContent = `Guesses left: ${maxGuesses}`;
  document.getElementById("guessInput").value = "";
}

function checkGuess() {
  const guess = parseInt(document.getElementById("guessInput").value);
  if (isNaN(guess)) return;
  guessCount++;
  const messageBox = document.getElementById("message");

  if (guess === targetNumber) {
    messageBox.innerHTML = `<span class="congrats">🎉 Congratulations! You guessed it!</span>`;
    stopTimer();
    setTimeout(endRound, 3000);
  } else {
    if (tooHighLowCount < 2) {
      messageBox.textContent = guess > targetNumber ? "Too high!" : "Too low!";
      tooHighLowCount++;
    } else {
      messageBox.textContent = "Try again!";
    }
    if (guessCount >= maxGuesses) {
      messageBox.textContent = `❌ Out of guesses! The number was ${targetNumber}`;
      stopTimer();
      setTimeout(endRound, 3000);
    }
  }

  document.getElementById("guessesLeft").textContent = `Guesses left: ${maxGuesses - guessCount}`;
}

function showHint() {
  if (hints.length > 0) {
    const hint = hints.shift();
    const hintEl = document.createElement("p");
    hintEl.textContent = hint;
    document.getElementById("hintBox").appendChild(hintEl);
  }
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++)
    if (num % i === 0) return false;
  return true;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  let timeLeft = seconds;
  updateTimerDisplay(timeLeft);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("message").innerHTML = `⏰ Time's up! The number was ${targetNumber}`;
      setTimeout(endRound, 3000);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  document.getElementById("timer").textContent = `⏱️ ${min}:${sec < 10 ? '0' + sec : sec}`;
}

function endRound() {
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "block";
}
