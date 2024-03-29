const Connection = require("../Connection");
const basicEnemy = require("./basicEnemy");
module.exports = class NPC_Manager {
    constructor(enemyList = Array){
        this.npcs = []; 
        this.enemiesToRespawn = [];
        this.runOnce = true;
        this.enemiesReady = false;
        this.initializeNpcs(enemyList);
    }


    initializeNpcs(enemyList)
    {
        //Spawning enemies
        enemyList.forEach(enemy =>{
            for(let i=0; i < enemy.spawnAmount; i++)
            {
                let newCube = new basicEnemy();
                newCube.name = enemy.name;
                newCube.maxHealth = 100; 
                newCube.Health = 100;
                newCube.dead = false;
                newCube.target = 'empty';
                let arrId = newCube.id;
                this.npcs.push({id:arrId, ai:newCube});
            }
        });
        
        

        
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

    setEnemyTarget(npcId,playerId)
    {
        let enemy = this.npcs.find(x => x.id === npcId);
        enemy.target = playerId;
    }

    updateEnemyStats(connection = Connection, data)
    {
        let lobby = connection.lobby;
        let enemy = this.npcs.find(x => x.id === data.id);
        
        let sendData = {
            id: enemy.ai.id,
            maxHealth: enemy.ai.maxHealth,
            health: enemy.ai.currentHealth,
            target : enemy.ai.target
        }
        console.log('UPDATED ENEMEY STATS: ' + sendData.id +" " + sendData.maxHealth);
        let connections = lobby.connections;
        connections.forEach(c =>{
            c.socket.emit('updateEnemyStats', sendData);
        })
    }
   
}