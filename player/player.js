'use strict'

require('dotenv').config();
const prompt = require('prompt-sync')();
const { io } = require('socket.io-client');
const SERVER_URL = process.env.SERVER_URL
const eventPool = require('../eventPool')
const Chance = require('chance')
const chance = new Chance();

const socket = io(SERVER_URL)

let player = {
  name: chance.name(),
  id: 1,
  score: 0,
}

socket.on(eventPool[5], (payload) => {
  console.log(payload.revealedWord)

  if(payload.turnId === player.id){
    console.log('YOUR TURN! \n')
    const guessLetter = prompt('Guess a letter: ');
    socket.emit(eventPool[3], guessLetter)
  }
})

socket.on(eventPool[4], (score) =>{
  player.score += score;
  console.log('Score: ', player.score)
  console.log('Waiting for other player\'s turn...')
})

socket.on(eventPool[2], (updatedPlayer) =>{
  player = updatedPlayer; 
})

socket.on(eventPool[1], (message) =>{
  console.log(message)
})

socket.on(eventPool[0], (player) => {
  console.log(`${player.name} HAS JOINED THE GAME`)
} )

socket.emit(eventPool[0], player)





