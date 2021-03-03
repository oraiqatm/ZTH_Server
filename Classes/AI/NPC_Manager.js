const Connection = require("../Connection");
const basicEnemy = require("./basicEnemy");
module.exports = class NPC_Manager {
    constructor(){
        this.enemies = []; 
        this.enemiesToRespawn = [];
        this.runOnce = true;
        this.enemiesReady = false;
    }


    initializeEnemies(nameofNPC,numofCubes)
    {
        //these monster will never be removed from enemies once init
        //will run when gamelobby is created
        for(let i=0; i < numofCubes; i++)
        {
            let newCube = new basicEnemy();
            newCube.name = nameofNPC; 
            newCube.Health = 100;
            newCube.dead = false;
            this.enemies.push(newCube);
        }

        
    }

    spawnAllEnemies(connection = Connection)
    {
       
        //each socket will spawn all enemies within the enemies array
        //which was instantiated 
        if(this.runOnce) // the very first person in the lobby
        {
            
            let player = connection.player;
            this.enemies.forEach(enemy =>{
                let sendData = {
                    id: enemy.id,
                    name: enemy.name,
                    isHost: true
                }
                connection.socket.emit('spawnAI', sendData);
                player.enemysHosted.push(enemy.id);
                
            });
            player.hostingEnemy = true;
            this.runOnce = false;
        }
        else{

            this.enemies.forEach(enemy =>{
                let sendData = {
                    id: enemy.id,
                    name: enemy.name,
                    isHost: false
                }
                connection.socket.emit('spawnAI', sendData);
              
            });
            this.enemiesReady = true;
        }
        
    }
   
}