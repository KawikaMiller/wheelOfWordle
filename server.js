'use strict';

require('dotenv').config()

const chalk = require('chalk')

const { Server } = require('socket.io');
const io = new Server(process.env.PORT);
const PlayerQueue = require('./lib/playerqueue')

let playerQueue =  new PlayerQueue;
let wordPool = ['javascript', 'codefellows', 'banana', 'socket', 'documentation', 'coffee']

let secretWord = [...wordPool[Math.round(Math.random() * wordPool.length - 1)]];

let revealedWord = [];

secretWord.map(letter => {
  revealedWord.push('_')
})

let turnId = 1; 
const eventPool = require('./eventPool')

console.log(secretWord)

io.on('connection', (socket) => {
  console.log('CLIENT CONNECTED TO SERVER: ', socket.id)

  socket.on(eventPool[0], (player) => {
    let updatedPlayer = playerQueue.addPlayer(player);

    io.to(socket.id).emit(eventPool[2], updatedPlayer)

    socket.join('gameRoom');
    console.log(`${player.name} HAS JOINED THE GAME ROOM`)

    // socket.to('gameRoom').emit(eventPool[0], player)
    socket.emit(eventPool[0], player)

    const clientsInRoom = socket.adapter.rooms.get('gameRoom');
    if (clientsInRoom.size >= 2) {

      let payload = {
        turnId: turnId,
        revealedWord: revealedWord,
      }

      socket.to('gameRoom').emit(eventPool[5], payload)
  }
})

  socket.on(eventPool[3], (guessLetter) =>{
    let addedScore = 0;
    secretWord.forEach((letter, idx) => {
      if(guessLetter === letter){
        revealedWord[idx] = secretWord[idx]
        playerQueue.players[turnId - 1].score++;
        addedScore++;
      }
    })

    let payload = {
      addedScore: addedScore,
      revealedWord: revealedWord,
    }

    if (addedScore > 0) {
      socket.emit(eventPool[4], payload)
    }

    let noLetterMatch = secretWord.every((letter) => {
      if (letter !== guessLetter) {
        return true;
      }
    })

    if (noLetterMatch) {
      socket.emit(eventPool[1], chalk.red(`No ${guessLetter}'s!`) + `\nWaiting for other player\'s turn...`)
    }

    let isGameOver = revealedWord.every((letter) => {
      if (letter !== '_') {
        return true;
      }
    })

    if (isGameOver) {
      let highscore = 0;
      let winner;
      playerQueue.players.forEach(player => {
        if (player.score > highscore){
          winner = player;
        }
      })
      socket.emit(eventPool[1], `GAME OVER!! Winner is ${winner.name} with ${winner.score} points!`);

      socket.to(`gameRoom`).emit(eventPool[1], `GAME OVER!! Winner is ${winner.name} with ${winner.score} points!`);
      return;
    }

    turnId ++;
    if(turnId > playerQueue.players.length){
      turnId = 1;
    }

    payload = {
      revealedWord: revealedWord,
      guessLetter: guessLetter,
      previousPlayer: playerQueue.players[turnId-1].name,
      turnId: turnId
    }

    socket.to('gameRoom').emit(eventPool[5], payload);
  })


})
