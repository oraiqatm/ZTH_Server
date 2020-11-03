let Connection = require('../Connection');
let LobbyObjects = require('../LobbyObjects');

let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');

module.exports = class GameLobby extends LobbyBase{
    constructor(id, settings = GameLobbySettings, items){
        super(id);
        this.settings = settings;

        //Server Spawning items when logging in.
        this.Objects = new LobbyObjects();
        this.Objects.ServerRespawnObjects = items;
        this.runOnce = true;
    }

    onUpdate(){
        let lobby = this;

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
        console.log(" test from gamelobby" + this.Objects.ServerRespawnObjects.length);
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
    }
    
    spawnObjects(connection = Connection, item = ServerObject ){
        let lobby = this;
        let data = {
            id: item.id,
            name: item.name,
            position: {
                x: item.x,
                y: item.y,
                z: item.z
            } ,
            quanity: item.baseQuanity
        }
        console.log("Item is sent");
        connection.socket.emit('serverSpawnObject', data);
        
    }

    


}