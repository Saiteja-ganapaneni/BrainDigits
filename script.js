let number, min, max;
let guesses = 0;
let maxGuesses = 5;
let hintCount = 0;
let hintGiven = new Set();
let highLowHints = 0;

function generateNumber() {
  min = Math.floor(Math.random() * 100) + 100; // min >= 100
  max = min + Math.floor(Math.random() * 50) + 5; // max = min + [5-55]
  number = Math.floor(Math.random() * (max - min + 1)) + min;
  document.getElementById('range').innerText = `🔢 Guess a number between ${min} and ${max}`;
  guesses = 0;
  hintCount = 0;
  highLowHints = 0;
  hintGiven.clear();
  document.getElementById('message').innerText = '';
  document.getElementById('hintBox').innerText = '';
  document.getElementById('guessesLeft').innerText = `Guesses Left: ${maxGuesses - guesses}`;
  document.getElementById('guessInput').value = '';
}

generateNumber();

function checkGuess() {
  const guess = parseInt(document.getElementById('guessInput').value);
  if (isNaN(guess)) return;
  guesses++;

  if (guess === number) {
    document.getElementById('message').innerHTML = '<span class="congrats">🎉 Congratulations! You guessed it right!</span>';
    setTimeout(generateNumber, 2500);
  } else {
    if (highLowHints < 2) {
      const diffHint = guess > number ? '📉 Too High!' : '📈 Too Low!';
      document.getElementById('message').innerText = diffHint;
      highLowHints++;
    } else {
      document.getElementById('message').innerText = '❌ Incorrect guess.';
    }
    if (guesses >= maxGuesses) {
      document.getElementById('message').innerHTML = `💡 The correct number was ${number}. Starting next round...`;
      setTimeout(generateNumber, 2500);
    }
  }
  document.getElementById('guessesLeft').innerText = `Guesses Left: ${maxGuesses - guesses}`;
}

function showHint() {
  const hints = [];
  if (!hintGiven.has('parity')) {
    hints.push(() => {
      const isEven = number % 2 === 0;
      return `🧮 The number is ${isEven ? 'Even' : 'Odd'}.`;
    });
  }
  if (!hintGiven.has('div3')) {
    hints.push(() => {
      const isDiv3 = number % 3 === 0;
      return `➗ The number is ${isDiv3 ? '' : 'not '}divisible by 3.`;
    });
  }
  if (!hintGiven.has('prime')) {
    hints.push(() => {
      const isPrime = checkPrime(number);
      return `🔍 The number is ${isPrime ? 'a Prime' : 'a Composite'} number.`;
    });
  }

  if (hintCount >= 3 || hints.length === 0) return;
  const index = Math.floor(Math.random() * hints.length);
  const hintFn = hints[index];
  const text = hintFn();

  if (text.includes('Even') || text.includes('Odd')) hintGiven.add('parity');
  if (text.includes('divisible')) hintGiven.add('div3');
  if (text.includes('Prime') || text.includes('Composite')) hintGiven.add('prime');

  const hintBox = document.getElementById('hintBox');
  const hint = document.createElement('p');
  hint.innerText = text;
  hintBox.appendChild(hint);
  hintCount++;
}

function checkPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function toggleInstructions() {
  const panel = document.getElementById('instructionsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}
