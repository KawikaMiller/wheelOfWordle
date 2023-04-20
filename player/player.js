'use strict'

require('dotenv').config();
const prompt = require('prompt-sync')();
const { io } = require('socket.io-client');
const SERVER_URL = process.env.SERVER_URL
const eventPool = require('../eventPool')

const socket = io(SERVER_URL)

let player = {
  name: 'testPlayer',
  id: 1,
  score: 0,
}


socket.on(eventPool[5], (turnId) => {
  console.log('IDs', turnId, player.id)
  if(turnId === player.id){
    const guessLetter = prompt('Guess a letter: ');
    socket.emit(eventPool[3], guessLetter)
  }
})

socket.on(eventPool[4], (score) =>{
  player.score += score;
  console.log('Score: ', player.score)
})

socket.on(eventPool[2], (player) =>{
  player = player; 
  console.log('PLAYER ID', player);
})

socket.on(eventPool[1], (turnId) =>{
  if(turnId === player.id){
    const guessLetter = prompt('Guess a letter: ');
    socket.emit(eventPool[3], guessLetter)
  }
})

socket.on(eventPool[0], (player) => {
  console.log(`${player.name} HAS JOINED THE GAME`)
} )

socket.emit(eventPool[0], player)





