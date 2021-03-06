
let shortID = require('shortid');
const Player = require('../Player');
const Vector3 = require('../Vector3');


module.exports = class BaseAI
{
    constructor()
    {
        this.name = 'Default AI';
        this.purpose = 'NPC';
        this.Interactable = false;
        this.id = shortID.generate();
        this.connectionHostingMe= "";
        

        this.currentState = 'idle';

        //Respawn stuff
        this.npcRespawnTime = new Number(3);
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);


    }

    randomBetween(min = Number, max = Number)
    {
        return Math.floor(
            Math.random() * (max-min) + min
        )
    }
    
    respawnCounter(){
        this.respawnTicker = this.respawnTicker +1;

        if(this.respawnTicker >= 10){
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;

            //Three seconds respond time
            if(this.respawnTime >= this.npcRespawnTime){
                console.log('Respawning item id: ' + this.id);
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                return true;
            }
        }
        return false;
    }

}

