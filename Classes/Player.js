var shortID = require('shortid');
var Vector3 = require('./Vector3.js');
let PlayerInfo = require('./Mesc/playerInfo');
let Stats = require('./Mesc/Stats');


module.exports = class Player{
    constructor(){
        this.username = 'Default_Player';
        this.id = shortID.generate();
        this.playerId = new Number(-1);
        this.lobby = 0;
        this.isOnline = false;
        this.position = new Vector3();
        this.modelRotation = new Number(0);

        this.playerInfo = new PlayerInfo(this.id); //INVENTORY
        this.playerStats = new Stats(); //PLAYER STATS
       

        //Hosting some enemys
        this.hostingEnemy = false;
        this.enemysHosted = [];
        
        
    } 
}