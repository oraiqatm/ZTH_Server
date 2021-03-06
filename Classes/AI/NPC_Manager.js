const Connection = require("../Connection");
const basicEnemy = require("./basicEnemy");
module.exports = class NPC_Manager {
    constructor(){
        this.npcs = []; 
        this.enemiesToRespawn = [];
        this.runOnce = true;
        this.enemiesReady = false;
    }


    initializeEnemies(nameofNPC,amnt)
    {
        //these monster will never be removed from enemies once init
        //will run when gamelobby is created
        for(let i=0; i < amnt; i++)
        {
            let newCube = new basicEnemy();
            newCube.name = nameofNPC; 
            newCube.Health = 100;
            newCube.dead = false;
            let arrId = newCube.id;
            this.npcs.push({id:arrId, ai:newCube});
        }

        
    }

    spawnAllEnemies(connection = Connection)
    {
       
        //each socket will spawn all enemies within the enemies array
        //which was instantiated 
        if(this.runOnce) // the very first person in the lobby
        {
            
            let player = connection.player;
            this.npcs.forEach(npc =>{
                let sendData = {
                    id: npc.ai.id,
                    name: npc.ai.name,
                    isHost: true
                }
                connection.socket.emit('spawnAI', sendData);
                npc.ai.connectionHostingMe = player.id;
                player.enemysHosted.push(npc.ai.id);
                
            });
            player.hostingEnemy = true;
            this.runOnce = false;
        }
        else{

            this.npcs.forEach(npc =>{
                let sendData = {
                    id: npc.ai.id,
                    name: npc.ai.name,
                    isHost: false
                }
                connection.socket.emit('spawnAI', sendData);
              
            });
            this.enemiesReady = true;
        }
        
    }
   
}