const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer();
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

let selectedAnswerIndex = -1; // Index of the selected answer

document.addEventListener('DOMContentLoaded', function() {
    const startTriviaButton = document.getElementById('start-trivia-button');
    if (startTriviaButton) {
        startTriviaButton.addEventListener('click', function() {
            const roomId = getRoomId();
            socket.emit('start-trivia', roomId); // Notify the server to start trivia
            startTriviaButton.style.display = 'none'; // Hide the start button
            socket.emit('hide-start-button', roomId);
            startTriviaButton.style.display = 'none';
        });
    }
});

socket.on('question', function(questionData, questionIndex) {
  displayQuestion(questionData, questionIndex);
  startTimer();
});

socket.on('trivia-starting', function(firstQuestion, questionIndex) {
  displayQuestion(firstQuestion, questionIndex);
});

socket.on('timer', function(timeLeft) {
  const timerElement = document.getElementById('timer');
  timerElement.textContent = `Time left: ${timeLeft} seconds`;
});


socket.on('times-up', function(correctIndex) {
  displayResult(correctIndex);
  currentRound++;  // Increment the current round

  // Check if the current round is less than the total number of questions
  if (currentRound < triviaQuestions.length) {
    // Request the next question if there are more questions remaining
    setTimeout(() => {
      const roomId = getRoomId();
      socket.emit('request-next-question', roomId, currentRound);
    }, 4000);
  } else {
    endGame();  // End the game if all questions have been displayed
  }
});

function startTriviaGame() {
  const startTriviaButton = document.getElementById('start-trivia-button');
  startTriviaButton.style.display = 'none';
}

const triviaQuestions = [
  {
      question: "What is the capital of France?",
      answers: ["Berlin", "Madrid", "Paris", "Lisbon"],
      correctIndex: 2 // Index of "Paris"
  },
  {
      question: "Who wrote the novel '1984'?",
      answers: ["Aldous Huxley", "George Orwell", "Stephen King", "Ernest Hemingway"],
      correctIndex: 1 // Index of "George Orwell"
  },
  {
      question: "What is the smallest planet in our solar system?",
      answers: ["Earth", "Jupiter", "Mars", "Mercury"],
      correctIndex: 3 // Index of "Mercury"
  },
  {
      question: "Which element has the chemical symbol 'O'?",
      answers: ["Gold", "Oxygen", "Silver", "Iron"],
      correctIndex: 1 // Index of "Oxygen"
  },
  {
      question: "What year did the Titanic sink?",
      answers: ["1912", "1905", "1898", "1923"],
      correctIndex: 0 // Index of "1912"
  },
  {
    question: "Who painted the Mona Lisa?",
    answers: ["Vincent Van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
    correctIndex: 2 // Index of "Leonardo da Vinci"
},
{
    question: "What is the largest country in the world by area?",
    answers: ["Russia", "Canada", "China", "United States"],
    correctIndex: 0 // Index of "Russia"
},
{
    question: "In what year did the Berlin Wall fall?",
    answers: ["1983", "1989", "1991", "1986"],
    correctIndex: 1 // Index of "1989"
},
{
    question: "What gas do plants absorb from the atmosphere for photosynthesis?",
    answers: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 1 // Index of "Carbon Dioxide"
},
{
    question: "Which planet is known as the Red Planet?",
    answers: ["Mars", "Jupiter", "Saturn", "Venus"],
    correctIndex: 0 // Index of "Mars"
}
];

let currentRound = 0;
const totalRounds = 10; 

function requestNextQuestion() {
  const roomId = getRoomId();
  socket.emit('request-next-question', roomId);
}

function displayQuestion(questionData, questionIndex) {
  const triviaGameContainer = document.getElementById('trivia-game');
  triviaGameContainer.style.display = 'block';
  const questionParagraph = document.getElementById('question');
  questionParagraph.textContent = questionData.question;
  const answers = document.querySelectorAll('#answers button');
  answers.forEach((button, index) => {
      button.textContent = questionData.answers[index];
      button.disabled = false;
      button.style.backgroundColor = ''; // Reset background color
      button.onclick = function() {
          selectedAnswerIndex = index; // Store selected answer index
          answers.forEach(btn => {
              btn.disabled = true; // Disable all buttons after one is clicked
              btn.style.backgroundColor = ''; // Reset all backgrounds
          });
          button.style.backgroundColor = 'grey'; // Highlight the selected answer
      };
  });
}

function displayResult(correctIndex) {
  const answerButtons = document.querySelectorAll('#answers button');
  answerButtons.forEach((button, index) => {
      if (index === correctIndex) {
          button.style.backgroundColor = 'green'; // Correct answer shown in green
      } else if (index === selectedAnswerIndex) {
          button.style.backgroundColor = 'grey'; // Incorrect selected answer shown in grey
      }
      button.disabled = true; // Disable all buttons after showing the result
  });
}

function submitAnswer(isCorrect) {
  if (isCorrect) {
      alert("Correct answer!");
  } else {
      alert("Wrong answer!");
  }
}

function startTimer() {
  let timeLeft = 10;
  const timer = document.getElementById('timer');
  timer.textContent = timeLeft;
  const timerInterval = setInterval(() => {
      timeLeft--;
      timer.textContent = timeLeft;
      if (timeLeft === 0) {
          clearInterval(timerInterval);
          socket.emit('times-up'); // Inform server that time's up
      }
  }, 1000);
}

function showCorrectAnswer(correctAnswer) {
    alert("Time's up! The correct answer was " + correctAnswer);
    // Do not request the next question here to enforce timing rules
}

function endGame() {
    alert("Game Over! Thanks for playing.");
    const triviaGameContainer = document.getElementById('trivia-game');
    triviaGameContainer.style.display = 'none'; // Hide the game
}

// Existing video streaming and connection handling code remains unchanged...


function initStreamHandling(stream) {
    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        if (peers[userId]) return;
        const call = connectToNewUser(userId, stream);
        peers[userId] = call;
    });

    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close();
            delete peers[userId];
        }
    });
}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('open', id => {
        const ROOM_ID = getRoomId();
        socket.emit('join-room', ROOM_ID, id);
        initStreamHandling(stream);
    });
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });
    return call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

function getRoomId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('roomId') || window.location.pathname.split('/')[1];
}


// Function to start the game and navigate to the games page
function startGame() {
  const ROOM_ID = getRoomId();
  if (ROOM_ID) {
      socket.emit('start-game', ROOM_ID);
  } else {
      console.error('Room ID is null');
  }
}

function startGame1() {
  const ROOM_ID = getRoomId();
  if (ROOM_ID) {
      socket.emit('start-game1', ROOM_ID);
  } else {
      console.error('Room ID is null');
  }
}

function startGame2() {
  const ROOM_ID = getRoomId();
  if (ROOM_ID) {
      socket.emit('start-game2', ROOM_ID);
  } else {
      console.error('Room ID is null');
  }
}

function startGame3() {
  const ROOM_ID = getRoomId();
  if (ROOM_ID) {
      socket.emit('start-game3', ROOM_ID);
  } else {
      console.error('Room ID is null');
  }
}


// Listener for navigation to the games page
socket.on('navigate-to-games', (roomId) => {
  if (roomId) {
      window.location.href = `/games?roomId=${roomId}`;
  } else {
      console.error('Received null Room ID for navigation');
  }
});

socket.on('navigate-to-game1', (roomId) => {
  if (roomId) {
      window.location.href = `/game1?roomId=${roomId}`;
  } else {
      console.error('Received null Room ID for navigation');
  }
});

socket.on('navigate-to-game2', (roomId) => {
  if (roomId) {
      window.location.href = `/game2?roomId=${roomId}`;
  } else {
      console.error('Received null Room ID for navigation');
  }
});

socket.on('navigate-to-game3', (roomId) => {
  if (roomId) {
      window.location.href = `/game3?roomId=${roomId}`;
  } else {
      console.error('Received null Room ID for navigation');
  }
});

socket.on('navigate-to-lobby', (roomId) => {
  window.location.href = `/${roomId}`; // Adjust if the URL needs to be different
});

socket.on('hide-button', function() {
  const startTriviaButton = document.getElementById('start-trivia-button');
  if (startTriviaButton) {
      startTriviaButton.style.display = 'none';
  }
});



function endGame() {
  const triviaGameContainer = document.getElementById('trivia-game');
  triviaGameContainer.style.display = 'none'; // Hide the game

  const gameOverMessage = document.getElementById('game-over-message');
  gameOverMessage.textContent = "Game Over! Thanks for playing.";
  gameOverMessage.style.display = 'block'; // Show the game over message

  const returnToLobbyButton = document.getElementById('return-to-lobby-button');
  returnToLobbyButton.style.display = 'block'; // Show the return button
  returnToLobbyButton.onclick = function() {
      const roomId = getRoomId();
      socket.emit('return-to-lobby', roomId);
  };
}

document.getElementById("game1-button").addEventListener("click", function() {
  const roomId = getRoomId();
  socket.emit('start-game1', roomId); 
});

document.getElementById("game2-button").addEventListener("click", function() {
  const roomId = getRoomId();
  socket.emit('start-game2', roomId); 
});

document.getElementById("game3-button").addEventListener("click", function() {
  const roomId = getRoomId();
  socket.emit('start-game3', roomId); 
});
