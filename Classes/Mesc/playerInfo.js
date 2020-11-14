let invSlot = require("./invSlot");
let Connection = require("../Connection");
let fs = require('fs');
module.exports = class playerInfo{
    constructor()
    {
        this.inventorySlot = [];
        this.armorSlot =[];
        this.InventoryFull = false;
        
    }
    updateInventory(connection = Connection)
    {   
        this.InventoryFull = this.checkInvFull();

        let socket = connection.socket;
        let sendData = {
            id: connection.player.id,
            invFull: this.InventoryFull,
            Inventory: this.inventorySlot
        }
        console.log("inventory sent!");
        socket.emit('updateInventory', sendData);
    }
    generateInventory(data)
    {
        let dataArr = data.Inventory;
        let i;
        
        for(i=0; i< dataArr.length; i++)
        {
            let tempSlot = new invSlot(dataArr[i].name, dataArr[i].id, dataArr[i].amount, dataArr[i].isEmpty);
            this.inventorySlot.push(tempSlot)
        } 
        
    }

    addToInventory(data, connection = Connection)
    {
        let tempSlot = new invSlot(data.name, data.itemID, data.amount, false);
        
        let i;
        for(i=0; i<this.inventorySlot.length; i++)
        {
            if(this.inventorySlot[i].isEmpty){
                this.inventorySlot[i] = tempSlot; 
                this.updateInventory(connection);
                return;  
            }
        }
        console.log("Inventory is full");
        
    }

    checkInvFull(){
        let i;
        for(i=0; i < this.inventorySlot.length; i++)
        {
            if(this.inventorySlot[i].isEmpty)
            {
                return false;
            }
        }
        return true;
    }
    
};
