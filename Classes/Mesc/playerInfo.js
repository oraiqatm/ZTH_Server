let invSlot = require("./invSlot");

module.exports = class playerInfo{
    constructor()
    {
        this.inventorySlot = [];
        this.armorSlot =[];
        
    }

    generateInventory(data)
    {
        let dataArr = data.Inventory;
        let i;
        
        for(i=0; i< dataArr.length; i++)
        {
            let tempSlot = new invSlot(dataArr[i].name, dataArr[i].id, dataArr[i].imgName, dataArr[i].amount, dataArr[i].isEmpty);
            this.inventorySlot.push(tempSlot)
        }  
    }
};
