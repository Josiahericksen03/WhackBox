const diceImages = [
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/Alea_1.png",
    "https://upload.wikimedia.org/wikipedia/commons/b/b8/Alea_2.png",
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Alea_3.png",
    "https://upload.wikimedia.org/wikipedia/commons/8/8d/Alea_4.png",
    "https://upload.wikimedia.org/wikipedia/commons/5/55/Alea_5.png",
    "https://upload.wikimedia.org/wikipedia/commons/2/26/Dice-6-b.svg" 
];

let previousRoll = 0;

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function displayDice(roll) {
    const diceElement = document.getElementById('dice');
    diceElement.src = diceImages[roll - 1]; 
    diceElement.alt = `Dice ${roll}`;
    diceElement.dataset.value = roll;

    const resultElement = document.getElementById('result');
    resultElement.innerText = `Result: ${roll}`; 
}

function guess(direction) {
    let counter = 0;
    const statusElement = document.getElementById('status');
    const gameMessage = document.getElementById('game-message'); 
    statusElement.innerText = "Rolling!";
    gameMessage.innerText = "";

    let intervalId = setInterval(function() {
        const tempRoll = rollDice();
        displayDice(tempRoll);
        counter++;

        if (counter > 10) {
            clearInterval(intervalId);
            const currentRoll = rollDice();
            displayDice(currentRoll);

            statusElement.innerHTML = `The number <span style="color: red; font-weight: bold;">${currentRoll}</span>`;

            // MESSAGE DISPLAY
            if ((direction === 'h' && currentRoll > previousRoll) ||
                (direction === 'l' && currentRoll < previousRoll)) {
                gameMessage.innerText = 'Correct! You win.';
                gameMessage.style.color = 'green'; 
            } else {
                gameMessage.innerText = 'Incorrect. You lose.';
                gameMessage.style.color = 'red'; 
            }

            previousRoll = currentRoll;
        }
    }, 100);
}

displayDice(1);
