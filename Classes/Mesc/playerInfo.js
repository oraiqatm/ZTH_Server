let invSlot = require("./invSlot");

let Connection = require("../Connection");

let fs = require('fs');


module.exports = class playerInfo{
    constructor()
    {
        this.coins = new Number(0);
        this.inventorySlot = [];
        this.armorSlot =[];
        this.InventoryFull = false;
        
    }
    updateInventory(connection = Connection)
    {   
        this.InventoryFull = this.checkInvFull(1);

        let socket = connection.socket;
        let sendData = {
            id: connection.player.id,
            money: this.coins,
            invFull: this.InventoryFull,
            Inventory: this.inventorySlot,
            Armor:this.armorSlot
        }
        console.log("inventory sent!");
        console.log(this.armorSlot);
        socket.emit('updateInventory', sendData);
    }
    generateInventory(data)
    {
        this.coins = data.Coins; 
        let dataArr = data.Inventory;
        let dataArmorArr = data.Armor;
 
        let i;
        
        for(i=0; i< dataArr.length; i++)
        {
            let tempSlot = new invSlot(dataArr[i].name, dataArr[i].id, dataArr[i].amount, dataArr[i].isEmpty);
            this.inventorySlot.push(tempSlot)
        } 
        for(i=0; i< dataArmorArr.length; i++)
        {
            let tempSlot1 = new invSlot(dataArmorArr[i].name, dataArmorArr[i].id, dataArmorArr[i].amount, dataArmorArr[i].isEmpty);
            this.armorSlot.push(tempSlot1)
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

    checkInvFull(x = Number){
        let i;
        let count = new Number(0);
        for(i=0; i < this.inventorySlot.length; i++)
        {
            if(this.inventorySlot[i].isEmpty)
            {
                count+=1;
            }
        }

        if(count >=x)
            return false;

        return true;
    }

    findEmptySlot(slots)
    {
        let i;
        for(i=0; i < this.inventorySlot.length; i++)
        {
            if(this.inventorySlot[i].isEmpty)
            {
                return i;
            }
        }
        return undefined;
    }
    

    equipItem(data, connection = Connection)
    {
        //Need to check if already equiping....
        console.log(data.type, data.slotNumber, data.index );   
        this.armorSlot[data.slotNumber] = this.inventorySlot[data.index];
        //this.inventorySlot[data.index].makeEmpty();
        //console.log(this.armorSlot);
        
        this.updateInventory(connection);
        
    }
};
