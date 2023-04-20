'use strict'

require('dotenv').config();
const { io } = require('socket.io-client');
const SERVER_URL = process.env.SERVER_URL
const eventPool = require('../eventPool')

const socket = io(SERVER_URL)

let player = {
  name: 'testPlayer',
  id: 1,
  score: 0,
}

socket.on(eventPool[0], (player) => {
  console.log(`${player.name} HAS JOINED THE GAME`)
} )

socket.emit(eventPool[0], player)




