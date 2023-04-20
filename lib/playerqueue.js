'use strict';

class PlayerQueue{
  constructor() {
    this.players = [];
  }

  addPlayer(value){
    this.players.push(value)
  }

  read(turnId){
    this.players.forEach(player => {
      if(player.id === turnId){
        return true;
      }
    })
  }

}
module.exports = PlayerQueue;