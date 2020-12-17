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

            fs.access(playerFile, (err) =>{
                if(err){
                    console.log("The file does not exist")
                }else
                {
                    var m = JSON.parse(fs.readFileSync(playerFile).toString());
                    let i;
                    m.Coins = player.playerInfo.coins;
                    for(i=0; i < m.Inventory.length; i++)
                    {
                        m.Inventory[i].name = playerInv[i].name;
                        m.Inventory[i].id = playerInv[i].id;
                        m.Inventory[i].amount = playerInv[i].amount;
                        m.Inventory[i].type = playerInv[i].type;
                        m.Inventory[i].isEmpty = playerInv[i].isEmpty;
                    }
                    
                    for(i=0; i < m.Armor.length; i++)
                    {
                        m.Armor[i].name = playerArmor[i].name;
                        m.Armor[i].id = playerArmor[i].id;
                        m.Armor[i].amount = playerArmor[i].amount;
                        m.Armor[i].type = playerArmor[i].type;
                        m.Armor[i].isEmpty = playerArmor[i].isEmpty;
                    }
                    fs.writeFile(playerFile, JSON.stringify(m), (err) => { // will overrite the file
                        if(err) console.log(err);
                    });
                }
            });
            

            server.onDisconnected(connection);
        });

        socket.on('createAccount', function(data){
            server.database.CreateAccount(data.username, data.password, result =>{
                //Results will return a true or false based on if account already exists or not
                console.log(result.valid + ': ' + result.reason + " id:" + result.id);
                //Creating the save json file on server
                if(result.valid){
                    let template = './Classes/PlayerStorage/template.json';
                    var m = JSON.parse(fs.readFileSync(template).toString()); 
                    let makeDir1 = './Classes/PlayerStorage/'+ result.id +'.json';
                    fs.writeFile(makeDir1, JSON.stringify(m), (err) => { // will overrite the file
                        if(err) console.log(err);
                    });
                    console.log("File: " + result.id +".json was created on server.");
                }
                
            });
        });
        socket.on('signIn', function(data){
            server.database.SignIn(data.username, data.password, results =>{
              
                //Results will return a true or false based on if account already exists or not
                console.log(results.valid + ': ' + results.reason); 
                if(results.valid)
                {
                    
                    player.playerId = results.id;
                    let playerFile = './Classes/PlayerStorage/'+ results.id +'.json';
                    fs.access(playerFile, (err) =>{
                        if(err){
                            console.log("The file does not exist")
                        }else{
                            var m = JSON.parse(fs.readFileSync(playerFile).toString());
                            player.playerInfo.generateInventory(m);
                            socket.emit('signIn');
                        }
                    });
                    
                }
            });
        });

        socket.on('joinGame', function(){
            server.onAttemptToJoinGame(connection);
        });

        socket.on('updatePosition', function(data){
            
            let sendData = {
                id: player.id,
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
                id: player.id,
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
                horizontalX: data.horizontalX
            }
            
                         
                socket.broadcast.to(connection.lobby.id).emit('updateAnimation', sendData);
            
            
        });

        socket.on('serverUnSpawnObject', function(data){
            player.playerInfo.addToInventory(data, connection);
            connection.lobby.unSpawnObject(connection, data);
            

        });

        socket.on('updateInventory', function(){
            player.playerInfo.updateInventory(connection);
        });

        socket.on('equipItem', function(data){
            player.playerInfo.equipItem(data, connection);
        });

        socket.on('dropItem', function(data){
            player.playerInfo.dropItem(data, connection);
        });

        socket.on('unequipItem', function(data){
            player.playerInfo.unequipItem(data, connection);
        });
    }
}