var shortID = require('shortid');
let fs = require('fs');

module.exports = class Projectiles{
    constructor(_ownerId, _nameOfProj){
        this.ownerId = _ownerId;
        this.serverId = shortID.generate();
        this.nameOfProjectile = _nameOfProj;
        //this.stats = getProjectileStats(_nameOfProj);
    }




    getProjectileStats(name = String)
    {
        let template = './Classes/json/projectileCatelog.json';
        var projectiles = JSON.parse(fs.readFileSync(template).toString());
        
        console.log("Projectile script" + projectiles[name]);


    }

}