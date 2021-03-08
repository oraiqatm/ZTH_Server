const Player = require("../Player");
const BaseAI = require("./BaseAI");

module.exports = class basicEnemy extends BaseAI
{
    constructor()
    {
        super();
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;

        this.dead = false;
        this.target = "";

    }

    OnUpdate()
    {
        
    }
    
    setTarget(playerId)
    {
        this.target= playerId;

    }


    takeDamage(connection, _damage)
    {
        let temp = new Number(0);
        temp = this.currentHealth -  _damage; 
        if(this.currentHealth > _damage)
        {
            this.currentHealth = temp;
            
        }
        else 
        {
            this.currentHealth = 0;
        }
    }

}