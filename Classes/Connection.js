let fs = require('fs');
module.exports = class Connection{
    constructor(){
        this.socket;
        this.player;
        this.server;
        this.lobby;
        
    }

    createEvents(){
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;

        socket.on('disconnect', function(){
            let playerFile = './Classes/PlayerStorage/'+ player.playerId +'.json';
            let playerInv = player.playerInfo.inventorySlot;
            let playerArmor = player.playerInfo.armorSlot;
            let playerScene = player.playerInfo.currentScene;
            
            let playerFound = server.playersOnline.find(x=> x.id === player.playerId)
            let index = server.playersOnline.indexOf(playerFound);
           
            if(player.playerId != -1)
            {
                server.database.updatePlayerDB(player.playerId, player.playerInfo.coins,playerInv, playerArmor, playerScene, results =>{
                    if(results.valid)
                    {
                       
                        
                        
                        if(playerFound != undefined)
                            server.playersOnline.splice(index,1);
                        server.onDisconnected(connection);
                    }
                    
                });
            }
            else{
                if(player.hostingEnemy)
                {
                    connection.lobby.makeNewConnectionHost(connection);  
                }
                if(playerFound != undefined)
                            server.playersOnline.splice(index,1);
                server.onDisconnected(connection);
            }//updated the players database for storage
            
            

        });

        socket.on('createAccount', function(data){
            server.database.CreateAccount(data.username, data.password, result =>{
                //Results will return a true or false based on if account already exists or not
                console.log(result.valid + ': ' + result.reason + " id:" + result.id);
                //Creating the save json file on server
                if(result.valid){
                    let template = './Classes/json/template.json';
                    var m = JSON.parse(fs.readFileSync(template).toString());
                    var createTableQuery = "CREATE TABLE player" + result.id + m.createQuery;
                    

                    
                    let newPlayerId = result.id;
                    server.database.CreatePlayerInfo(createTableQuery, result =>{
                        if(result.valid)
                        {
                           console.log("New table created for player" + newPlayerId);
    
                           server.database.initializePlayerInfo(newPlayerId, m.Coins,m.Inventory, m.Armor, m.Scene ,out =>{
                                console.log("Player" + newPlayerId +" table has been initialized.");
                                socket.emit('accountCreated');
    
                           });
                        }
                    });
                }
                
            });

        });

        socket.on('signIn', function(data){

            let playerFound = server.playersOnline.find(x => x.name === data.username)
            if(playerFound == undefined)
            {
                server.database.SignIn(data.username, data.password, results =>{
                    //Results will return a true or false based on if account already exists or not
                    console.log(results.valid + ': ' + results.reason); 
                    if(results.valid)
                    {

                        player.playerId = results.id;
                        player.username = results.username;
                        server.database.getPlayerData(player.playerId, d =>{
                            console.log(d.Loc);
                            player.playerInfo.generateProfile(d.Inventory, d.Armor, d.Currency, d.Loc.Scene);
                            
                            server.playersOnline.push({id: player.playerId, name: player.username})
                            socket.emit('signIn');
                        }) 
                    }
                    else
                    {
                        //failed to sign in re enable the sign in button
                        socket.emit('retryLogin');
                    }

                });
            }
            else
            {
                console.log("Player is already signed in.")
                socket.emit('retryLogin');
            }
            
        
        });

        socket.on('joinGame', function(){
            server.onAttemptToJoinGame(connection);
        });

        socket.on('spawnActors', function(){ //Sent from client
            connection.lobby.addPlayer(connection);
            connection.lobby.spawnAllNPCs(connection);
        })

        socket.on('updatePosition', function(data){
            
            let sendData = {
                id: data.id,
                position:{
                    x: data.position.x,
                    y: data.position.y,
                    z: data.position.z
                }
            }
            socket.broadcast.to(connection.lobby.id).emit('updatePosition', sendData); 
            
              
        });

        socket.on('updateRotation', function(data){
            
            let sendData = {
                id: data.id,
                modelRotation: data.modelRotation
            }
                
                
            socket.broadcast.to(connection.lobby.id).emit('updateRotation', sendData);
            
            
        });

        socket.on('updateAnimation', function(data){
            let sendData = {
                id: data.id,
                playerState: data.playerState,
                isMoving: data.isMoving,
                isSprinting: data.isSprinting,
                isJumping: data.isJumping,
                isFalling: data.isFalling,
                isLanding:data.isLanding,
                verticalY:data.verticalY,
                horizontalX: data.horizontalX,
                attackAction: data.attackAction,
                handAttackTrig: data.HandAttackTrig,
                legAttackTrig: data.LegAttackTrig,
                isAiming: data.isAiming
            }
               // console.log(data.LegAttackTrig);
                         
                socket.broadcast.to(connection.lobby.id).emit('updateAnimation', sendData);
                
            
        });

        socket.on('serverUnSpawnObject', function(data){
            player.playerInfo.addToInventory(data, connection);
            connection.lobby.unSpawnObject(connection, data);
            

        });

        socket.on('updatePlayer', function(){
            player.playerInfo.updateInventory(connection);
            player.playerStats.updateStaticStats(connection);
            player.playerStats.updateDynamicStats(connection);
            
           
        });

        socket.on('addToInventory', function(data){
            player.playerInfo.addToInventory(data, connection);
        })

        socket.on('equipItem', function(data){
            player.playerInfo.equipItem(data, connection);
        });

        socket.on('dropItem', function(data){
            player.playerInfo.dropItem(data, connection);
        });

        socket.on('unequipItem', function(data){
            player.playerInfo.unequipItem(data, connection);
        });

        socket.on('updateGameChat', function(data){
           //connection.lobby.handGameChatMessaging(connection, data);
           console.log('message recived on connection')
           server.onHandleGameChat(data, player.username);
        });

        socket.on('TriggerCollider', function(data){
            connection.lobby.handleTriggerCollider(connection, data);
        });

        socket.on('SpawnProjectile', function(data){
           
            player.spawnProjectilesToClients(connection, data);
        });
        socket.on('updateProjectileDirection', function(data){
            
            let sendData = {
                id: data.id,
                direction:{
                    x: data.position.x,
                    y: data.position.y,
                    z: data.position.z,
                }
            }
                
                
            socket.broadcast.to(connection.lobby.id).emit('updateRotation', sendData);
            
            
        });

        socket.on('UnspawnProjectile', function(data){
            let sendData = {
                id: data.id
            }
            socket.broadcast.to(connection.lobby.id).emit('serverUnSpawnObject', sendData);
        });

        
//----------------------------------NPC -----------------------------------
        socket.on('updateAIPosition', function(data){
            connection.lobby.updateAIPosition(connection, data);
        });
     
        socket.on('updateAIRotation', function(data){
            connection.lobby.updateAIRotation(connection, data);
        });

        socket.on('updateEnemyStats', function(data)
        {
            connection.lobby.NpcManager.updateEnemyStats(connection,data);
        });

        socket.on('changeEnemyHost', function(data){   
            if(player.hostingEnemy)
            {
                connection.lobby.makeNewConnectionHost(connection, player.enemyHosted);  
                console.log("closed before quitted");
            }
        });
    }
}