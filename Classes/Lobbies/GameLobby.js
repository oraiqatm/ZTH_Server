let Connection = require('../Connection');
let LobbyObjects = require('../LobbyObjects');

let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');

module.exports = class GameLobby extends LobbyBase{
    constructor(id, settings = GameLobbySettings){
        super(id);
        this.settings = settings;

        //Server Spawning items when logging in.
        this.Objects = new LobbyObjects();
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


    



}