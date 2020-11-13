let invSlot = require("./invSlot");

module.exports = class playerInfo{
    constructor(id)
    {
        this.inventorySlot = [];
        this.armorSlot =[];
        
    }

    generateInventory(id)
    {
        let makeDir1 = './Classes/PlayerStorage/'+ id +'.json';
        var m = JSON.parse(fs.readFileSync(makeDir1).toString());



        /* Write to a new file it will override the contents
         fs.writeFile(makeDir1, JSON.stringify(m), (err) => { // will overrite the file
            if(err) console.log(err);
        });
        */
    }
};
