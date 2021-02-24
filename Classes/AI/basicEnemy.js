const Player = require("../Player");
const BaseAI = require("./BaseAI");

module.exports = class basicEnemy extends BaseAI
{
    constructor()
    {
        super();
        this.Health = 100;
        this.dead = false;
        this.target = "";

    }

    setTarget(playerId)
    {
        this.target= playerId;

    }


}