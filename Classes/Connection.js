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
                }
                
            });
        });
        socket.on('signIn', function(data){
            server.database.SignIn(data.username, data.password, result =>{
                //Results will return a true or false based on if account already exists or not
                console.log(results.valid + ': ' + results.reason); 
                if(result.valid)
                {
                    socket.emit('signIn');
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
                id: player.id,
                vertical: data.vert,
                horizontal: data.horizl,
                moving: data.moving,
                sprinting: data.sprinting,
                falling: data.falling,
                landing: data.landing,
                attackKickTrigger: data.attackKickTrigger,
                attackTrigger: data.attackTrigger,
                rollTrigger: data.rollTrigger,
                weaponNum: data.weaponNum,
                leftrght: data.leftrght,
                jump:data.jump,
                actionP:data.actionP,
                isInteracting: data.isInteracting
        
            }
                
                socket.broadcast.to(connection.lobby.id).emit('updateAnimation', sendData);
            
            
        });

        socket.on('serverUnSpawnObject', function(data){
            connection.lobby.unSpawnObject(connection, data);
        });

    }
}