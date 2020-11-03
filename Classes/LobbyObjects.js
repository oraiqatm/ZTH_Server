module.exports = class LobbyObjects{
    constructor(){
        this.ServerSpawnObjects = [];
        this.ServerRespawnObjects = [];
    }

    addRespawnObject(object){
        this.ServerRespawnObjects.push(item);
    }

    addSingleSpawnObject(object){
        this.ServerSpawnObjects.push(object);
    }

}