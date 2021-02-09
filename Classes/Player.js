var shortID = require('shortid');
var Vector3 = require('./Vector3.js');
let PlayerInfo = require('./Mesc/playerInfo');


module.exports = class Player{
    constructor(){
        this.username = 'Default_Player';
        this.id = shortID.generate();
        this.playerId = new Number(-1);
        this.lobby = 0;
        this.isOnline = false;
        this.position = new Vector3();
        this.modelRotation = new Number(0);
        this.playerInfo = new PlayerInfo();

        
    } 
}