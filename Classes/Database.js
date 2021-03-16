let MySql = require('mysql');
let DatabaseSetting = require('./json/database.json');
let DatabaseSettingLocal = require('./json/locolDatabase.json');
let PasswordHash = require('password-hash')

module.exports = class Database{
    constructor(isLocal =false){
        this.currentSetting = (isLocal) ? DatabaseSetting: DatabaseSettingLocal;
        this.pool = MySql.createPool({
            host: this.currentSetting.Host,
            user: this.currentSetting.Username,
            password: this.currentSetting.Password,
            database:this.currentSetting.Database,
            acquireTimeout:1000000
        });
        this.numberOfPlayers = new Number(0);
    }

    Connect(callback){
        let pool = this.pool;
        pool.getConnection((error, connection) =>{
            if(error) throw error;
            callback(connection);
        });
    }

    GetNumberofPlayers(){
        this.Connect(connection =>{
            let query = "SELECT COUNT(*) as num from player where id >= 0;"
            connection.query(query,(error, results)=>{
                connection.release();
                if(error) throw error;
                this.d = results[0].num; 
            })
        });
    }

    GetRespawnItems(callback){
        this.Connect(connection => {

            let query = "Select * from items where canRespawn = 1"
            connection.query(query, (error, results) =>{
                connection.release();
                if(error) throw error;
                callback(results);
            });
        })
    }

    GetSampleData(callback){
        this.Connect(connection =>{
            let query = "SELECT * FROM player";

            connection.query(query, (error, results) =>{
                connection.release();
                if(error) throw error;
                callback(results);
            });
        });
    }

    GetSampleDataByName(username, callback){
        this.Connect(connection =>{
            let query = "SELECT * FROM player WHERE username = ?";

            connection.query(query,[username], (error, results) =>{
                connection.release();
                if(error) throw error;
                callback(results);
            });
        });
    }

    //ACCOUNT QUERIES
    //adding a new player to the database
    CreateAccount(username, password, callback){
        //You may want to check the length and perform a regex on this
        
        var hashedPassword = PasswordHash.generate(password, {saltLength: 30});
        
        //this.GetNumberofPlayers();
        //Attempt to see if someone is already in the db
        this.Connect(connection =>{
            let query = "SELECT username FROM player WHERE username = ?";

            connection.query(query,[username], (error, results) =>{
                if(error) {
                    connection.release();
                    throw error;
                }

                if(results[0] != undefined){
                    callback({
                        valid: false,
                        reason: "user already exists."
                    });
                    connection.release();
                    return;
                }

                  //if not put user in db
                let query = "SELECT COUNT(*) as num from player where id >= 0;"
                connection.query(query,(error, results)=>{
                    if(error) throw error;
                    this.numberOfPlayers = results[0].num;
                   console.log("Number of players in db: "+ this.numberOfPlayers);
                    query = "INSERT INTO player (id,username, password) VALUES (?,?, ?)";
                    connection.query(query, [this.numberOfPlayers ,username, hashedPassword], (error, results) =>{
                        connection.release();
                        if(error) throw error;

                        callback({
                            id: this.numberOfPlayers,
                            valid: true,
                            reason: "Success"
                        });
                    });
                });
                
                
                
                
            });
             
        });


         
    }


    SignIn(username, password, callback){
      
        this.Connect(connection=>{
            let query = "SELECT password , id FROM player WHERE username = ?";
            connection.query(query, [username], (error, results) => {
                connection.release();
                if(error) throw error;

                if(results[0] != undefined)
                {
                    
                    if(PasswordHash.verify(password, results[0].password)){
                        callback({
                            id: results[0].id,
                            valid: true,
                            reason: "Success",
                            username: username //local variable of this function
                        });
                    }else{
                        //dont return this or youll get botted.
                        callback({
                            valid: false,
                            reason: "Password does not match"
                        });
                    }
                }else{
                    callback({
                        valid: false,
                        reason: "User does not exist."
                    });
                }
            });
        });
    }

    CreatePlayerInfo(createQuery,callback)//Call on CreateUser
    {
        this.Connect(connection => {
            connection.query(createQuery, (error, results) => {
                if(error) throw error
                connection.release();
                callback({valid:true});
            });
        })
    }

    initializePlayerInfo(playerId, currency, inventorySlots, armorSlots, scene,callback)//Call on CreateUser
    {
        
        this.Connect(connection => {
            var invQuery = "INSERT IGNORE INTO player" + playerId + " (ind, InvName, InvID, InvAmnt, InvType, InvEmpty ) VALUES (?,?, ?, ?, ?, ?)";
            var armorQuery = "UPDATE player" + playerId + " SET ArmorName = ?, ArmorID =?, ArmorAmnt =?, ArmorType =?, ArmorEmpty =? WHERE ind =?";
            var currencyQuery = "UPDATE player" + playerId + " SET Currency =? WHERE ind =?";
            var sceneQuery = "UPDATE player" + playerId + " Set Scene =? WHERE ind =?";

            let i =0; 
            
            
            for(i =0; i < inventorySlots.length; i++)
            {
                connection.query(invQuery,[i+1, inventorySlots[i].name, inventorySlots[i].id, inventorySlots[i].amount, inventorySlots[i].type, inventorySlots[i].isEmpty],(error, results) => {
                    if(error) throw error
                });
            }
            

            i =0;
            for(i =0; i < armorSlots.length; i++)
            {
                connection.query(armorQuery,[armorSlots[i].name, armorSlots[i].id, armorSlots[i].amount, armorSlots[i].type, armorSlots[i].isEmpty, i+1], (error, results) => {
                    if(error) throw error
                    
                });
            }

 
            connection.query(currencyQuery,[currency, 1], (error, results) => {
                if(error) throw error             
            });

            connection.query(sceneQuery,[scene, 1], (error, results) => {
                if(error) throw error             
                callback({valid: true})
            });
            connection.release();
            
        });
    }

    updatePlayerDB(playerId, currency, inventorySlots, armorSlots, scene, callback)//Call on disconnect
    {
       
        this.Connect(connection => {
            var invQuery = "UPDATE player" + playerId + " SET InvName = ?, InvID =?, InvAmnt=?, InvType=?, InvEmpty=? WHERE ind = ?";
            var armorQuery = "UPDATE player" + playerId + " SET ArmorName = ?, ArmorID =?, ArmorAmnt =?, ArmorType =?, ArmorEmpty =? WHERE ind =?";
            var currencyQuery = "UPDATE player" + playerId + " SET Currency =? WHERE ind =?";
            var sceneQuery = "UPDATE player" + playerId + " Set Scene =? WHERE ind =?";

            let i =1; 
            
            
            for(i =0; i < inventorySlots.length; i++)
            {
                connection.query(invQuery,[inventorySlots[i].name, inventorySlots[i].id, inventorySlots[i].amount, inventorySlots[i].type, inventorySlots[i].isEmpty,i+1],(error, results) => {
                    if(error) throw error
                    
                });
                //console.log("item at " + i + " was sent");

            }
            

            for(i =0; i < armorSlots.length; i++)
            {
                connection.query(armorQuery,[armorSlots[i].name, armorSlots[i].id, armorSlots[i].amount, armorSlots[i].type, armorSlots[i].isEmpty, i+1], (error, results) => {
                    if(error) throw error
                    
                });
            }

            connection.query(currencyQuery,[currency, 1], (error, results) => {
                if(error) throw error             
                
            });
            connection.query(sceneQuery,[scene, 1], (error, results) => {
                if(error) throw error             
                callback({valid: true})
                connection.release();

            });
            
        });
    }
    

    

    getPlayerData(playerId, callback)
    {
        this.Connect(connection => {
            let query = "Select * FROM player" + playerId 
            connection.query(query,(error, data) =>
            {
                if(error) throw error

                let inv = []
                let armor =[] 
                let money = []
                
                for(let i= 0; i < 28; i++)
                {
                    inv.push({ InvName: data[i].InvName, InvID: data[i].InvID ,InvAmnt: data[i].InvAmnt, InvType: data[i].InvType, InvEmpty: data[i].InvEmpty})
                }
                for(let i= 0; i < 13; i++)
                {
                    armor.push({ArmorName: data[i].ArmorName, ArmorID: data[i].ArmorID ,ArmorAmnt: data[i].ArmorAmnt, ArmorType: data[i].ArmorType, ArmorEmpty: data[i].ArmorEmpty})
                }
                //Get the only row of currency need to change for more types of currency
                money.push({Currency: data[0].Currency})
                //Get Scene data
                let scene = {
                    Scene: data[0].Scene
                }
                callback({Inventory: inv, Armor: armor, Currency:money, Loc:scene})
                connection.release()

            });
        });
    }

}