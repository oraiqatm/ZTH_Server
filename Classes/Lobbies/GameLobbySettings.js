module.exports = class GameLobbySettings {
    constructor(gameMode, maxPlayers){
        this.gameMode = gameMode; //the scene that the player was last in.
        this.maxPlayers = maxPlayers;
        this.sceneData = this.getSceneData(gameMode)
    }

    getSceneData(gameMode)
    {
        let enemyList =[]
        let respawnables= []
        switch(this.gameMode)
        {
            case 'Level':
                 enemyList = [{name: 'MonsterCube', spawnAmount: 2}];
                 respawnables = [
                    {id:1, name:'Sword', baseQuanity:1, x:-2, y:0, z:-5},
                    {id:2, name:'Shield', baseQuanity:1, x:-2, y:0, z:5}, 
                    {id:3, name:'2H Axe', baseQuanity:1, x:-2, y:1, z:8}, 
                    {id:4, name:'Bow', baseQuanity:1, x:2, y:0, z:3}, 
                    {id:5, name:'2H Sword', baseQuanity:1, x:5, y:0, z:-7} 
                ]
                return {Enemies: enemyList, Objects: respawnables}

                break;

            case 'Kingdom':
                 enemyList = [];
                 respawnables = [ ]
                return {Enemies: enemyList, Objects: respawnables}
                break;

            default:
                console.log('Game mode' + this.gameMode + ' was not found.' );
                return undefined;
        }
    }

    
}