let secretNumber;
let possibleNumbers = [];
let guessCount = 0;
let hintList = [];
let shownHints = [];
let highLowHintCount = 0;
let minRange = 1;
let maxRange = 100;
const maxGuesses = 5;
const maxHighLowHints = 3;

function generateNumber() {
  possibleNumbers = [];
  guessCount = 0;
  highLowHintCount = 0;
  shownHints = [];

  minRange = Math.floor(Math.random() * 100) + 101;
  maxRange = minRange + 100 + Math.floor(Math.random() * 50);

  const isEven = Math.random() > 0.5;
  const divisibleBy3 = Math.random() > 0.5;
  const primeHint = Math.random() > 0.5;

  for (let i = minRange; i <= maxRange; i++) {
    const evenCheck = isEven ? i % 2 === 0 : i % 2 !== 0;
    const div3Check = divisibleBy3 ? i % 3 === 0 : i % 3 !== 0;
    const primeCheck = primeHint ? isPrime(i) : !isPrime(i);

    if (evenCheck && div3Check && primeCheck) {
      possibleNumbers.push(i);
    }
  }

  while (possibleNumbers.length > 5) {
    possibleNumbers.splice(Math.floor(Math.random() * possibleNumbers.length), 1);
  }

  if (possibleNumbers.length === 0) {
    generateNumber();
    return;
  }

  secretNumber = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
  hintList = generateHints(secretNumber);

  document.getElementById("range").textContent = `Guess the number between ${minRange} and ${maxRange}`;
  document.getElementById("message").textContent = "";
  document.getElementById("hintBox").textContent = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("guessesLeft").textContent = `🧠 Guesses left: ${maxGuesses - guessCount}`;
}

function checkGuess() {
  const input = document.getElementById("guessInput");
  const guess = Number(input.value);
  const messageEl = document.getElementById("message");

  if (!guess || guess < minRange || guess > maxRange) {
    messageEl.textContent = `❗ Please enter a valid number between ${minRange} and ${maxRange}.`;
    return;
  }

  guessCount++;
  document.getElementById("guessesLeft").textContent = `🧠 Guesses left: ${maxGuesses - guessCount}`;

  if (guess === secretNumber) {
    messageEl.textContent = `🎉 Correct! The number was ${secretNumber}. Starting new game...`;
    setTimeout(generateNumber, 3000);
  } else {
    if (highLowHintCount < maxHighLowHints) {
      messageEl.textContent = guess > secretNumber ? "🔽 Too high!" : "🔼 Too low!";
      highLowHintCount++;
    } else {
      messageEl.textContent = "❌ Try again!";
    }

    if (guessCount >= maxGuesses) {
      messageEl.textContent = `❌ You used all ${maxGuesses} guesses! The correct number was ${secretNumber}. Starting new game...`;
      setTimeout(generateNumber, 3000);
    }
  }
}

function showHint() {
  const hintBox = document.getElementById("hintBox");
  if (hintList.length > 0) {
    const nextHint = hintList.shift();
    shownHints.push(nextHint);
  }
  hintBox.innerHTML = shownHints.map(h => `💡 Hint: ${h}`).join("<br>");
}

function generateHints(number) {
  const hints = [];

  const hintOptions = [
    () => number % 2 === 0 ? "Even number" : "Odd number",
    () => number % 3 === 0 ? "Divisible by 3" : "Not divisible by 3",
    () => isPrime(number) ? "Prime number" : "Composite number"
  ];

  const shuffled = [];
  while (hintOptions.length > 0) {
    const i = Math.floor(Math.random() * hintOptions.length);
    shuffled.push(hintOptions.splice(i, 1)[0]());
  }

  return shuffled;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

generateNumber();
