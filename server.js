'use strict';

require('dotenv').config()
const { Server } = require('socket.io');
const io = new Server(process.env.PORT);

let usersArray = [];
let secretWord = [];
let revealedWord = [];
const eventPool = require('./eventPool')


io.on('connection', (socket) => {
  console.log('CLIENT CONNECTED TO SERVER: ', socket.id)

  socket.on(eventPool[0], (player) => {

    player.id = usersArray.length + 1;
    usersArray.push(player);

    // console.log(usersArray);

    socket.join('gameRoom');
    console.log(`${player.name} HAS JOINED THE GAME ROOM`)

    // socket.to('gameRoom').emit(eventPool[0], player)
    socket.emit(eventPool[0], player)
  })


})
