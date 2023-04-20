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
    player.id = playerQueue.players.length + 1;
    playerQueue.addPlayer(player);

    io.to(socket.id).emit(eventPool[2], player)

    // console.log(usersArray);

    socket.join('gameRoom');
    console.log(`${player.name} HAS JOINED THE GAME ROOM`)

    // socket.to('gameRoom').emit(eventPool[0], player)
    socket.emit(eventPool[0], player)
    const clientsInRoom = socket.adapter.rooms.get('gameRoom');
    if (clientsInRoom.size >= 2) {
      socket.emit(eventPool[1], (turnId))
  }
})

  socket.on(eventPool[1], (player) => {

  })

  socket.on(eventPool[3], (guessLetter) =>{
    secretWord.forEach((letter, idx) => {
      if(guessLetter === letter){
        revealedWord[idx] = secretWord[idx]
        socket.emit(eventPool[4], 1)
      }
    })
    console.log('REVEALED WORD', revealedWord);
    turnId ++;
    if(turnId > playerQueue.players.length){
      turnId = 1;
    }
    socket.emit(eventPool[5], turnId);
  })


})
