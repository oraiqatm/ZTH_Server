module.exports = class GameLobbySettings {
    constructor(gameMode, maxPlayers){
        this.gameMode = 'Scene'; //the scene that the player was last in.
        this.maxPlayers = maxPlayers;
    }

    getEnemiesOnLevel()
    {
        if(this.gameMode == 'Level')
        {
            let enemyList = [{name: 'MonsterCube', spawnAmount: 2}];
            return enemyList;
        }
    }
}