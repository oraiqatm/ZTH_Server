let Connection = require('../Connection');
let LobbyObjects = require('../LobbyObjects');
const ServerObject = require('../Mesc/serverObject');
const basicEnemy = require('../AI/basicEnemy');
let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');
const NPC_Manager = require('../AI/NPC_Manager');




module.exports = class GameLobby extends LobbyBase{
    constructor(id, settings = GameLobbySettings, items){
        super(id);
        this.settings = settings;

        //Server Spawning items when logging in.
        this.Objects = new LobbyObjects();
        this.Objects.ServerRespawnObjects = this.convertSO(items);
        this.NpcManager = new NPC_Manager();
        this.NpcManager.initializeEnemies(2);
        
        this.runOnce = true;
    }

    onUpdate(){
        let lobby = this;
        if(this.connections.length >0){
            this.respawnObjects();
        }

    }

    canEnterLobby(connection = Connection){
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if(currentPlayerCount + 1> maxPlayerCount){
            console.log("Current player Count" + currentPlayerCount);
            return false;
        }

        return true;
    }

    onEnterLobby(connection = Connection){
        let lobby = this;
        let socket = connection.socket;
        let player = connection.player;
        super.onEnterLobby(connection);

        this.Intialize(connection);
        //spawn AI
        
        lobby.addPlayer(connection);
        socket.emit('loadGame');

        
      
    }

    onLeaverLobby(connection = Connection){
        let lobby = this;
        super.onLeaveLobby(connection);
        lobby.removePlayer(connection);

       
    }

    addPlayer(connection = Connection){
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var controllerData = { //Include player stats from on spawn
            id: connection.player.id,
            invSize: connection.player.playerInfo.inventorySize,
            userName: connection.player.username 
        }

        var returnData = {
            id: connection.player.id,
            userName: connection.player.username
        }
      
        socket.emit('spawn', controllerData); //tell myself i have spawned
        socket.broadcast.to(lobby.id).emit('spawn', returnData); //Tell others

        //tell myself about everyone else already in the lobby

        connections.forEach(c => {
            if(c.player.id != connection.player.id){
                socket.emit('spawn', {
                    id: c.player.id,
                    userName: c.player.username
                });
            }
        });
    }

    removePlayer(connection = Connection){
        let lobby = this;
        
        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });

    }

    Intialize(connection = Connection){
        let lobby = this;
        if(this.connections.length == 1)
        {
            this.NpcManager.runOnce = true;
        }

        //Respawn Object from the database
        let respawnObjects = lobby.Objects.ServerRespawnObjects; 
        if(respawnObjects.length > 0){
            let i; 
            for (i = 0; i < respawnObjects.length; i++){
                this.spawnObjects(connection, respawnObjects[i]);
            }
        }
        

    }

  

    
    //--------------------------------------Game Engine to Server -----------------------------------------------------------------------

    handGameChatMessaging(connection, data)
    {
        let lobby = this;
        let connections = lobby.connections;
        let sendData = {
            username: connection.player.username, 
            message: data.message,
            type: data.type
        }

        this.connections.forEach(c=>{
            c.socket.emit('updateGameChat', sendData);
        });

    }

    

    updateAIPosition(connection = Connection, data)
    {
        let lobby = this;

        let sendData = {
            id : data.id,
            position: {
                x: data.pos.x,
                y: data.pos.y,
                z: data.pos.z
            }
        }

        connection.socket.broadcast.to(lobby.id).emit('updateAIPosition', sendData);
      

    }

    updateAIRotation(connection = Connection, data)
    {
        let lobby = this;
        let sendData = {
            id : data.id,
            rotation: data.modelRotation
        }

        connection.socket.broadcast.to(lobby.id).emit('updateAIRotation', sendData);
    }

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

    spawnAllNPCs(connection = Connection)
    {
        this.NpcManager.spawnAllEnemies(connection);
    }

    makeNewConnectionHost(connection = Connection)
    {
        //Called right before disconnect in "Connection.js"
        let lobby = this;
        let connections = lobby.connections;
        let enemiesID = connection.player.enemysHosted;
    
        for(let i=0; i < connections.length; i++)
        {
            if(connection.player.id != connections[i].player.id)
            {
                
                connections[i].player.hostingEnemy = true;
                connections[i].enemysHosted = enemiesID;
                
                console.log("Player" + connections[i].player.id + " is hosting enemies");
                enemiesID.forEach(enemyid =>{
                    let sendData = {
                        id: enemyid
                    }

                    connections[i].socket.emit('updateEnemyHost', sendData);
                    console.log("updated host enemy" + sendData);
                });
                console.log("Connections in lobby: ");
                connections.forEach(c=>{
                    console.log(c.player.id);
                })
                return;

            }
        }

    }

   

}