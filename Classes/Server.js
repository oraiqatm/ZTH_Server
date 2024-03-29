let Connection = require('./Connection');
let Player = require('./Player');
let Database = require('./Database');

//Lobbies 
let LobbyBase = require('./Lobbies/LobbyBase');
let GameLobby = require('./Lobbies/GameLobby');
let GameLobbySettings = require('./Lobbies/GameLobbySettings');

module.exports = class Server{
    constructor(onlineServer = Boolean){
        this.database = new Database(onlineServer); //episode 19
        this.connections = [];
        this.lobbys = [];
        this.playersOnline = [];

        this.lobbys[0] = new LobbyBase(0);

        
    }

    onUpdate(){
        let server = this;

        //update each lobby
        for(let id in server.lobbys){
            server.lobbys[id].onUpdate();
        }
    }

    //Handle a new connection to the server.
    onConnected(socket){
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.server = server;

        let player = connection.player;
        let lobbys = server.lobbys;

        console.log('Added new player to the server (' + player.id + ')');
        server.connections[player.id] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);
        

        return connection;
    }

    onDisconnected(connection = Connection ){
        let server = this;
        let id = connection.player.id;

        delete server.connections[id];
        console.log('Player ' + connection.player.id + ' has disconnected');

        //Tell other players in the lobby that we have disconnected from the game
        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected',{
            id:id
        });

        //perform lobby clean up
        server.lobbys[connection.player.lobby].onLeaveLobby(connection);
    }

    onAttemptToJoinGame(connection = Connection){
        //Look through lobbies for a game lobby
        //check if joinable
        //if not make a new game

        let server = this;
        let lobbyFound = false;
        let playerScene = connection.player.playerInfo.currentScene;

        let gameLobbies = server.lobbys.filter(item => {
            return item instanceof GameLobby;
        });

        console.log('Found (' + gameLobbies.length + ') lobbies on the server');

        gameLobbies.forEach(lobby => {
            if(!lobbyFound){
                let canJoin = lobby.canEnterLobby(connection);


                if(canJoin) {
                    lobbyFound = true;
                    server.onSwitchLobby(connection, lobby.id);
                }
            }
        });

        //All game lobbies full or we have never created one
        if(!lobbyFound){
            console.log('Making a new game lobby');
            let gamelobby = new GameLobby(gameLobbies.length + 1, new GameLobbySettings(playerScene, 50));
            server.lobbys.push(gamelobby);
            server.onSwitchLobby(connection, gamelobby.id);
        }
    }
    onSwitchLobby(connection = Connection, lobbyID){
        let server = this;
        let lobbys = server.lobbys;
    
        connection.socket.join(lobbyID); //Join the new lobby's socket channel
        connection.lobby = lobbys[lobbyID]; //assign reference to the new lobby
    
        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
    }

    onHandleGameChat(data, username)
    {
        let server = this;
        console.log('message recieved on server')
        let sendData = {
            username: username, 
            message: data.message,
            type: data.type
        }
        for(let id in server.lobbys){
            server.lobbys[id].connections.forEach(c =>{
                c.socket.emit('updateGameChat', sendData);
            });
        }
        
    }

}