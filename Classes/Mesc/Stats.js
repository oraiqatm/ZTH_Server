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

    takeDamage(connection = Connection, _damage)
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

    }

    updateDynamicStats(connection = Connection, playerId)
    {
        let sendData=
        {
            id : playerId,
            object: "player",
            currentHealth : this.currentHealth,
            stamina: this.stamina
        }

        connection.socket.emit('updateDynamicStats', sendData);
        connection.socket.broadcast.to(connection.lobby.id).emit('updateDynamicStats', sendData);
    }

    updateStaticStats (connection = Connection, playerId)
    {
        let sendData = 
        {
            id: playerId,
            attackLevel : this.attackLevel
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