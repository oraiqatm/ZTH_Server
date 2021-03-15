const Connection = require("../Connection");

module.exports = class Stats
{
    constructor(){

        this.level = new Number(0);
        this.maxHealth = new Number(100);
        this.currentHealth = this.maxHealth;
        this.stamina = new Number(100);

        this.attackLevel = new Number(1);

        this.levelExperience = new Number(0);
    }



    setLevelsAndStats(data)
    {
        this.maxHealth = data.maxHealth;
        this.currentHealth = data.health;
        this.stamina = data.stamina;
    }

    takeDamage( connection =Connection, _damage, targettedPlayerId)
    {
       
        let  temp = this.currentHealth - _damage;
        if(this.currentHealth > _damage)
        {
            this.currentHealth = temp;
        }
        else
        {
            this.currentHealth = 0;
        }
        this.updateDynamicStats(connection,targettedPlayerId)
    }

    updateDynamicStats(connection = Connection, id)
    {
        let lobby = connection.lobby;
        let connections = lobby.connections;

        let playerId = id;
        let sendData=
        {
            id : playerId,
            currentHealth : this.currentHealth,
            stamina: this.stamina
        }
        connections.forEach(c =>{
            c.socket.emit('updateDynamicStats', sendData)
        });
    }

    updateStaticStats (connection = Connection)
    {
    
        let playerId = connection.player.id;
        let sendData = 
        {
            id: playerId,
            maxHealth: this.maxHealth
            
        } 
        connection.socket.emit('updateStaticStats', sendData);
    }

    updateLevelExperience (connection = Connection, playerId)
    {
        let sendData = 
        {
            id: playerId,
            levelExp : this.levelExperience
        }
        connection.socket.emit('updateExp', sendData);

    }
}