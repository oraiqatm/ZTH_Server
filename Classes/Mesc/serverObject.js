
let vector3 = require('../Vector3');



module.exports = class ServerObject{
    constructor(){
        this.id = new Number(0);
        this.name = 'ServerObject';
        this.position = new vector3();
        this.quanity = new Number(1);

        this.canRespawn = false;
        this.destroyed = false;
        
        this.itemRespawnTime = new Number(3);
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
    }

    respawnCounter(){
        this.respawnTicker = this.respawnTicker +1;

        if(this.respawnTicker >= 10){
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;

            //Three seconds respond time
            if(this.respawnTime >= this.itemRespawnTime){
                console.log('Respawning item id: ' + this.id);
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                return true;
            }
        }
        return false;
    }

    
}