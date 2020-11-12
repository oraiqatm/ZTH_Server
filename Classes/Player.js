var shortID = require('shortid');
var Vector3 = require('./Vector3.js');
let PlayerInfo = require('./Mesc/playerInfo');


module.exports = class Player{
    constructor(){
        this.username = 'Default_Player';
        this.id = shortID.generate();
        this.lobby = 0;

        this.position = new Vector3();
        this.modelRotation = new Number(0);

        //Animation variables
        this.vert = new Number(0);
        this.horizl = new Number(0);
        this.sprinting = false;
        this.moving = false;
        this.falling = false;
        this.landing = false;
        this.attackKickTrigger = false;
        this.attackTrigger = false;
        this.weaponNum = new Number(0);
        this.leftrght = new Number(0);
        this.jump = new Number(0);
        this.actionP = new Number(0);
        this.rollTrigger = false;
        this.isInteracting = false;
    } 
}