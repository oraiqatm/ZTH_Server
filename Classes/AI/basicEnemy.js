const Player = require("../Player");
const BaseAI = require("./BaseAI");

module.exports = class basicEnemy extends BaseAI
{
    constructor()
    {
        super();
        this.maxHealth = 100;
        this.Health = this.maxHealth;
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


    takeDamage( _damage)
    {
        let temp = new Number(0);
        temp = this.health -  _damage; 
        if(this.health > _damage)
        {
            this.health = temp;
            
        }
        else 
        {
            this.health = 0;
        }
    }

}