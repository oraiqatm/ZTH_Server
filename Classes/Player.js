var shortID = require('shortid');
var Vector3 = require('./Vector3.js');
let PlayerInfo = require('./Mesc/playerInfo');
let Stats = require('./Mesc/Stats');
let ServerObject = require('./Mesc/serverObject');
const Projectiles = require('./Weapons/Projectile.js');


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


    spawnProjectilesToClients(connection, data)
    {
        let lobby = connection.lobby;
       if(data.isAmmo)
       {      
           this.playerInfo.armorSlot[10].amount -= 1;
           this.playerInfo.updateInventory(connection);

           let newProjectile = new Projectiles(this.id, data.name);
           let sendData = {
               serverId: newProjectile.serverId,
               ownerId : this.id,
               projectileName: newProjectile.nameOfProjectile,
               bowCharge: data.bowCharge,
               direction: {
                    x: data.direction.x,
                    y: data.direction.y,
                    z: data.direction.z
               }

           }
           
           connection.socket.emit('spawnProjectiles', sendData);
           connection.socket.broadcast.to(lobby.id).emit('spawnProjectiles', sendData); 

       }
    }
}