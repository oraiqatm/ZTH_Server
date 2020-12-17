//ws://127.0.0.1:3000/socket.io/?EIO=4&transport=websocket
//ws://zth-project.herokuapp.com:80/socket.io/?EIO=4&transport=websocket
//https://zth-project.herokuapp.com/

var io = require('socket.io')(process.env.PORT || 3000);
console.log('Server has started');

let Server = require('./Classes/Server');

let server = new Server();

setInterval(()=>{
    server.onUpdate();
}, 1000, 0);


io.on('connection', function(socket){
    let connection = server.onConnected(socket);
    connection.createEvents();
    connection.socket.emit('register', {'id': connection.player.id});    

});



//explained part 5 39:00
function interval (func, wait, times){
    var interv = function(w,t){
        return function(){
            if(typeof t === "undefined" || t-- > 0){
                setTimeout(interv, w);
                try{
                    func.call(null);
                }catch (e) {
                    t = 0;
                    throw e.toString();
                }
            }
        };
    } (wait, times);
    setTimeout(interv, wait);
}

