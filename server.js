const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/games', (req, res) => {
    res.render('games', { title: 'Games' });
});

app.get('/game1', (req, res) => {
    res.render('game1', { roomId: req.query.roomId }); // Ensure roomId is passed to game1 for socket room association
});

app.get('/game2', (req, res) => {
    res.render('game2', { roomId: req.query.roomId });
});

app.get('/game3', (req, res) => {
    res.render('game3', { roomId: req.query.roomId });
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

const triviaQuestions = [
    { question: "What is the capital of France?", answers: ["Berlin", "Madrid", "Paris", "Lisbon"], correctIndex: 2 },
    { question: "Who wrote '1984'?", answers: ["Aldous Huxley", "George Orwell", "Stephen King", "Ernest Hemingway"], correctIndex: 1 },
    { question: "What is the smallest planet in our solar system?", answers: ["Earth", "Jupiter", "Mars", "Mercury"], correctIndex: 3 },
    { question: "Which element has the chemical symbol 'O'?", answers: ["Gold", "Oxygen", "Silver", "Iron"], correctIndex: 1 },
    { question: "What year did the Titanic sink?", answers: ["1912", "1905", "1898", "1923"], correctIndex: 0 },
    { question: "Who painted the Mona Lisa?", answers: ["Vincent Van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], correctIndex: 2 },
    { question: "What is the largest country in the world by area?", answers: ["Russia", "Canada", "China", "United States"], correctIndex: 0 },
    { question: "In what year did the Berlin Wall fall?", answers: ["1983", "1989", "1991", "1986"], correctIndex: 1 },
    { question: "What gas do plants absorb from the atmosphere for photosynthesis?", answers: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correctIndex: 1 },
    { question: "Which planet is known as the Red Planet?", answers: ["Mars", "Jupiter", "Saturn", "Venus"], correctIndex: 0 }
];


io.on('connection', socket => {
    // For new connections in the lobby
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        socket.on('start-game', () => {                         //added individual game navigation
            io.in(roomId).emit('navigate-to-games', roomId);
        });

        socket.on('start-game1', () => {
            io.in(roomId).emit('navigate-to-game1', roomId);
        });

        socket.on('start-game2', () => {
            io.in(roomId).emit('navigate-to-game2', roomId);
        });

        socket.on('start-game3', () => {
            io.in(roomId).emit('navigate-to-game3', roomId);
        });

        socket.on('start-trivia', () => {
            io.in(roomId).emit('trivia-starting', triviaQuestions[0], 0);
            startTimer(roomId, 10, 0);
        });

        socket.on('request-next-question', (roomId, questionIndex) => {
            questionIndex = parseInt(questionIndex);
            if (questionIndex < triviaQuestions.length) {
                io.in(roomId).emit('question', triviaQuestions[questionIndex], questionIndex);
                startTimer(roomId, 10, questionIndex);
            } else {
                io.in(roomId).emit('end-game');
            }
        });

        socket.on('hide-start-button', roomId => {
            socket.to(roomId).emit('hide-button');  // Broadcasting to all others except the sender
        });
        
        socket.on('correct-answer', (userId) => {
            // Assuming you have a 'users' object to store user information
            if (users[userId]) {
                users[userId].points += 10; // Increment points by 10 for correct answer
                io.to(users[userId].roomId).emit('update-points', userId, users[userId].points);
            }
        });
        socket.on('return-to-lobby', roomId => {
            io.in(roomId).emit('navigate-to-lobby', roomId);
        });
    });

    socket.on('rejoin-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    });

    socket.on('disconnect', userId => {
        socket.broadcast.emit('user-disconnected', userId);
    });

    function startTimer(roomId, duration, questionIndex) {
        let timeLeft = duration;
        const timer = setInterval(() => {
            io.in(roomId).emit('timer', timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timer);
                io.in(roomId).emit('times-up', triviaQuestions[questionIndex].correctIndex);
            }
            timeLeft--;
        }, 1000);
    }
});

const port = process.argv[2] || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});