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
            database:this.currentSetting.Database
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
                this.numberOfPlayers = results[0].num; 
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
        this.GetNumberofPlayers();
        
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
                query = "INSERT INTO player (id,username, password) VALUES (?,?, ?)";
                connection.query(query, [this.numberOfPlayers,username, hashedPassword], (error, results) =>{
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
                            reason: "Success"
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
}