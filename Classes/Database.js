let MySql = require('mysql');
let DatabaseSetting = require('./json/database.json');
let DatabaseSettingLocal = require('./json/locolDatabase.json');

module.exports = class Database{
    constructor(isLocal =false){
        this.currentSetting = (isLocal) ? DatabaseSetting: DatabaseSettingLocal;
        this.pool = MySql.createPool({
            host: this.currentSetting.Host,
            user: this.currentSetting.Username,
            password: this.currentSetting.Password,
            database:this.currentSetting.Database
        });
    }

    Connect(callback){
        let pool = this.pool;
        pool.getConnection((error, connection) =>{
            if(error) throw error;
            callback(connection);
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
}