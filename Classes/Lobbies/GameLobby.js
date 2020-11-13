let Connection = require('../Connection');
let LobbyObjects = require('../LobbyObjects');
const ServerObject = require('../Mesc/serverObject');

let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');

//Test
let fs = require('fs');


module.exports = class GameLobby extends LobbyBase{
    constructor(id, settings = GameLobbySettings, items){
        super(id);
        this.settings = settings;

        //Server Spawning items when logging in.
        this.Objects = new LobbyObjects();
        this.Objects.ServerRespawnObjects = this.convertSO(items);
       
        this.runOnce = true;
    }

    onUpdate(){
        let lobby = this;
        this.respawnObjects();

    }

    canEnterLobby(connection = Connection){
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if(currentPlayerCount + 1> maxPlayerCount){
            return false;
        }

        return true;
    }

    onEnterLobby(connection = Connection){
        let lobby = this;
        let socket = connection.socket;
        super.onEnterLobby(connection);

        this.Intialize(connection); 

        lobby.addPlayer(connection);

        socket.emit('loadGame');
      
    }

    onLeaverLobby(connection = Connection){
        let lobby = this;
        super.onLeaveLobby(connection);
        lobby.removePlayer(connection);

        //Handle unspawning any server spawned objects here
        //Example: Loot, perhaps flying bullets etc.

    }

    addPlayer(connection = Connection){
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var returnData = { //Include player stats from on spawn
            id: connection.player.id
        }

        socket.emit('spawn', returnData); //tell myself i have spawned
        socket.broadcast.to(lobby.id).emit('spawn', returnData); //Tell others

        //tell myself about everyone else already in the lobby

        connections.forEach(c => {
            if(c.player.id != connection.player.id){
                socket.emit('spawn', {
                    id: c.player.id
                });
            }
        })
    }

    removePlayer(connection = Connection){
        let lobby = this;
        
        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });

    }

    Intialize(connection = Connection){
        let lobby = this;
        let respawnObjects = lobby.Objects.ServerRespawnObjects; 

        if(respawnObjects.length > 0){
            let i; 
            for (i = 0; i < respawnObjects.length; i++){
                this.spawnObjects(connection, respawnObjects[i]);
            }
        }

        let makeDir1 = './Classes/PlayerStorage/'+ 1 +'.json';
        var m = JSON.parse(fs.readFileSync(makeDir1).toString());
        console.log(m.Inventory.length);
       
        


    }
    
    //--------------------------------------Game Engine to Server -----------------------------------------------------------------------


    //--------------------------------------Utilities functions ---------------------------------------------------------------------------
    convertSO(items){
        let arr = [];
        let i =0;

        for(i =0; i < items.length; i++){
            let tempSO = new ServerObject();
            tempSO.id = items[i].id;
            tempSO.name = items[i].name;
            tempSO.position.x = items[i].x; 
            tempSO.position.y = items[i].y;
            tempSO.position.z = items[i].z;
            tempSO.quanity = items[i].baseQuanity;
            arr.push(tempSO);

        }    
        return arr;
    }

    spawnObjects(connection = Connection, item = ServerObject ){
        let lobby = this;
        let data = {
            id: item.id,
            name: item.name,
            position: item.position,
            quanity: item.quanity
        }
  
        connection.socket.emit('serverSpawnObject', data);
        
    }
    unSpawnObject(connection = Connection, data){
        
        let lobby = this;
        let sendData ={
            id: data.itemID
        }

        connection.socket.emit('serverUnSpawnObject',sendData);
        connection.socket.broadcast.to(lobby.id).emit('serverUnSpawnObject', sendData);

        let i;
        for(i=0; i< this.Objects.ServerRespawnObjects.length; i++){
            if(this.Objects.ServerRespawnObjects[i].id == data.itemID){
                this.Objects.ServerRespawnObjects[i].destroyed = true;
            }
        }
    }

    respawnObjects(){
        let lobby = this;
        let connections = lobby.connections;

        this.Objects.ServerRespawnObjects.forEach(item => {
            if(item.destroyed){
                let isRespawn = item.respawnCounter();

                if(isRespawn){
                    connections.forEach(connection => {
                        item.destroyed = false;
                        this.spawnObjects(connection, item);
                    })
                }
            }
        })
    }

    loadPlayerInfo(){
        
    }

}