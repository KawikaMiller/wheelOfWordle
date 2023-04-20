"use strict";

require("dotenv").config();
const { Server } = require("socket.io");
const io = new Server(process.env.PORT);
const PlayerQueue = require("./lib/playerqueue");
let playerQueue = new PlayerQueue();
const words = ["apple", "banana", "cherry", "orange", "kiwi", "peach", "pear", "strawberry", "watermelon", "pineapple"];
let secretWord = words[Math.floor(Math.random() * words.length)];
let revealedWord = Array.from(secretWord, () => 0);
let turnId = 1;
const eventPool = require("./eventPool");
const GAME_ROOM = "gameroom";
let gameInProgress = false;

io.on("connection", (socket) => {
  console.log("CLIENT CONNECTED TO SERVER: ", socket.id);

  socket.on(eventPool[0], (player) => {
    let updatedPlayer = playerQueue.addPlayer(player);

    io.to(socket.id).emit(eventPool[2], updatedPlayer);

    socket.join("GAME_ROOM");
    console.log(`${player.name} HAS JOINED THE GAME ROOM`);

    socket.emit(eventPool[0], player);

    const clientsInRoom = socket.adapter.rooms.get("GAME_ROOM");
    if (clientsInRoom.size >= 2) {
      let payload = {
        turnId: turnId,
        revealedWord: revealedWord,
      };

      socket.to("GAME_ROOM").emit(eventPool[5], payload);
    }
  });

  socket.on(eventPool[3], (guessLetter) => {
    [...secretWord].forEach((letter, idx) => {
      if (guessLetter === letter) {
        revealedWord[idx] = secretWord[idx];
        playerQueue.players[turnId - 1].score++;
        socket.emit(eventPool[4], 1);
      }
    });

    const allLettersNotGuessed = [...secretWord].every((letter) => {
      return letter !== guessLetter;
    });

    if (allLettersNotGuessed) {
      socket.emit(
        eventPool[1],
        "Better luck next time! \n Waiting for other player's turn..."
      );
    }

    let isGameOver = revealedWord.every((letter) => {
      if (letter !== 0) {
        return true;
      }
    });

    if (isGameOver) {
      let highscore = 0;
      let winner;
      playerQueue.players.forEach((player) => {
        if (player.score > highscore) {
          winner = player;
        }
      });
      io.to('GAME_ROOM').emit(eventPool[6], `GAME OVER!! Winner is ${winner.name} with ${winner.score} points! Do you want to play again? (y/n)`);

      socket
        .to(GAME_ROOM)
        .emit(
          eventPool[6],
          `GAME OVER!! Winner is ${winner.name} with ${winner.score} points!`
        );
      return;
    }

    turnId++;
    if (turnId > playerQueue.players.length) {
      turnId = 1;
    }

    let payload = {
      turnId: turnId,
      revealedWord: revealedWord,
    };

    socket.to("GAME_ROOM").emit(eventPool[5], payload);
  });

  socket.on("restartGame", () => {
    if (gameInProgress) {
      return;
    }

    gameInProgress = true;
    secretWord = words[Math.floor(Math.random() * words.length)]
    revealedWord = Array.from(secretWord, () => 0);
    turnId = 1;

    io.in(GAME_ROOM).emit("gameRestarted");
  });
});
