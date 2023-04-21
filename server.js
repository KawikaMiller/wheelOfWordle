'use strict';

require('dotenv').config()
const { Server } = require('socket.io');
const io = new Server(process.env.PORT);
const PlayerQueue = require('./lib/playerqueue')

let playerQueue =  new PlayerQueue;
let secretWord = [...'hat'];
let revealedWord = [0, 0, 0];
let turnId = 1; 
const eventPool = require('./eventPool')



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
    secretWord.forEach((letter, idx) => {
      if(guessLetter === letter){
        revealedWord[idx] = secretWord[idx]
        playerQueue.players[turnId - 1].score++;
        socket.emit(eventPool[4], 1)
      }
    })

    secretWord.every((letter) => {
      if (letter !== guessLetter) {
        socket.emit(eventPool[1], 'Better luck next time! \n Waiting for other player\'s turn...')
      }
    })

    let isGameOver = revealedWord.every((letter) => {
      if (letter !== 0) {
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

    let payload = {
      turnId: turnId,
      revealedWord: revealedWord,
    }

    socket.to('gameRoom').emit(eventPool[5], payload);
  })


})
