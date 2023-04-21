'use strict'

require('dotenv').config();

const chalk = require('chalk');

const prompt = require('prompt-sync')();
const { io } = require('socket.io-client');
const SERVER_URL = process.env.SERVER_URL
const eventPool = require('../eventPool')
const Chance = require('chance')
const chance = new Chance();

const socket = io(SERVER_URL)

let player = {
  name: chance.animal(),
  id: 1,
  score: 0,
}

socket.on(eventPool[5], (payload) => {

  if (payload.previousPlayer){
    console.log(`${payload.previousPlayer} guessed '${payload.guessLetter}'`)
  }

  console.log(payload.revealedWord.join(''))

  if(payload.turnId === player.id){
    console.log(chalk.green('YOUR TURN! \n'))
    const guessLetter = prompt('Guess a letter: ');
    socket.emit(eventPool[3], guessLetter)
  }
})

socket.on(eventPool[4], (payload) =>{
  console.log(payload.revealedWord.join(''))
  player.score += payload.addedScore;
  console.log(chalk.green(`Player earned ${payload.addedScore} points!`))
  console.log(`Your have ${player.score} points total!`)
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

const username = prompt('Choose a username: ')
if (username !== '') {
  player.name = username;
  socket.emit(eventPool[0], player)
} else {
  socket.emit(eventPool[0], player)
}






