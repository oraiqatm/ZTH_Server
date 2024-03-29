let invSlot = require("./invSlot");

let Connection = require("../Connection");

let fs = require('fs');


module.exports = class playerInfo{ //INVENTORY 
    constructor(id)
    {
        this.playerId = id;
        this.coins = new Number(0);
        this.inventorySlot = [];
        this.armorSlot =[];
        this.InventoryFull = false;
        this.inventorySize = new Number(0);
        this.currentScene = "";
        
        
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
            Armor: this.armorSlot
        }
       
        socket.emit('updateInventory', sendData);

        let sendArmor = {
            id: this.playerId,
            Armor: this.armorSlot
        }

        socket.broadcast.to(connection.lobby.id).emit('equipOnOtherClients', sendArmor);
    }
    

    generateProfile(dataInv, dataArmor, dataCurrency, currentScene)
    {
        this.coins = dataCurrency[0].Currency; 
        console.log(dataArmor.length);
        this.inventorySize = dataInv.length;
        let i;
        
        for(i=0; i< dataInv.length; i++)
        {
            let tempSlot = new invSlot(dataInv[i].InvName, dataInv[i].InvID, dataInv[i].InvAmnt, dataInv[i].InvType, dataInv[i].InvEmpty);

            this.inventorySlot.push(tempSlot)
        }
        for(i=0; i< dataArmor.length; i++)
        {
            let tempSlot1 = new invSlot(dataArmor[i].ArmorName, dataArmor[i].ArmorID, dataArmor[i].ArmorAmnt, dataArmor[i].ArmorType,dataArmor[i].ArmorEmpty);

            this.armorSlot.push(tempSlot1)
        }  
        
        this.currentScene = currentScene;
    }

    addToInventory(data, connection = Connection)
    {
        let tempSlot = new invSlot(data.name, data.itemID, data.amount, data.type,false);
        
        let i;
        for(i=0; i<this.inventorySlot.length; i++)
        {
            if(this.inventorySlot[i].isEmpty){
                this.inventorySlot[i] = tempSlot; 
                this.updateInventory(connection);
                return;  
            }
        }
        
    }

    checkInvFull(x = Number){ // x is the number of spots we are checking are available
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

    findEmptySlot() //find 1st empty slot
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
       
        //hard code the slots
        if(data.type == "double")
        {
            if(data.slotNumber == 8)
            {
                if (this.armorSlot[8].isEmpty) //check right hand is empty
                {   
                    if(!this.armorSlot[9].isEmpty) //check if left hand full make empty
                    {
                        let temp = new invSlot();
                        temp.makeCopy( this.armorSlot[9]);
                        this.armorSlot[9].makeEmpty();
                        this.armorSlot[8].makeCopy(this.inventorySlot[data.index]);
                        this.inventorySlot[data.index].makeCopy(temp);
                    }
                    else{ //both left and right are empty
                        this.armorSlot[8].makeCopy(this.inventorySlot[data.index])
                        this.inventorySlot[data.index].makeEmpty();
                    }
                    
                }
                else if(!this.armorSlot[8].isEmpty && this.armorSlot[9].isEmpty) //right hand full and left hand empty
                {//then empty right hand and equip new weapon
                    let temp = new invSlot();
                    temp.makeCopy(this.inventorySlot[data.index]);
                    this.inventorySlot[data.index].makeCopy(this.armorSlot[8]);
                    this.armorSlot[8].makeCopy(temp);
                } 
                else if(!this.armorSlot[8].isEmpty && !this.armorSlot[9].isEmpty) //if both are full then unequip 
                {//unequip both and equip right hand weapon
                    
                    if(!this.checkInvFull(1))
                    {
                        let temp = new invSlot();
                        temp.makeCopy(this.inventorySlot[data.index]);
                        this.inventorySlot[data.index].makeCopy(this.armorSlot[8]);
                        this.armorSlot[8].makeCopy(temp);
    
                        let freeSpot = this.findEmptySlot();
                        this.inventorySlot[freeSpot].makeCopy(this.armorSlot[9]);
                        this.armorSlot[9].makeEmpty()
                    }
                }
            }
            else { // slotNumber == 9
                if(this.armorSlot[9].isEmpty)
                {
                    if(!this.armorSlot[8].isEmpty)
                    {
                        let temp = new invSlot();
                        temp.makeCopy(this.armorSlot[8]);
                        this.armorSlot[8].makeEmpty();
                        this.armorSlot[9].makeCopy(this.inventorySlot[data.index]);
                        this.inventorySlot[data.index].makeCopy(temp);
                    }
                    else{ //both left and right are empty
                        this.armorSlot[9].makeCopy(this.inventorySlot[data.index])
                        this.inventorySlot[data.index].makeEmpty();
                    }
                } else if(!this.armorSlot[9].isEmpty && this.armorSlot[8].isEmpty)
                {
                    let temp = new invSlot();
                    temp.makeCopy(this.inventorySlot[data.index]);
                    this.inventorySlot[data.index].makeCopy(this.armorSlot[9]);
                    this.armorSlot[9].makeCopy(temp);
                } else if(!this.armorSlot[9].isEmpty && !this.armorSlot[8].isEmpty)
                {
                    if(!this.checkInvFull(1))
                    {
                        let temp = new invSlot();
                        temp.makeCopy(this.inventorySlot[data.index]);
                        this.inventorySlot[data.index].makeCopy(this.armorSlot[9]);
                        this.armorSlot[9].makeCopy(temp);
    
                        let freeSpot = this.findEmptySlot();
                        this.inventorySlot[freeSpot].makeCopy(this.armorSlot[8]);
                        this.armorSlot[8].makeEmpty()
                    }
                }
            }   
            
        }

        else if(data.type == "single")
        {
            if(data.slotNumber == 9 && this.armorSlot[8].type == "double") //try to eqiup a shield
            {
                let temp = new invSlot();
                temp.makeCopy(this.inventorySlot[data.index]);
                this.inventorySlot[data.index].makeCopy(this.armorSlot[8]);
                this.armorSlot[8].makeEmpty();
                this.armorSlot[9].makeCopy(temp);
 
            } else if (data.slotNumber == 8 && this.armorSlot[9].type == "double") //try to equip a sword
            {
                let temp = new invSlot();
                temp.makeCopy(this.inventorySlot[data.index]);
                this.inventorySlot[data.index].makeCopy(this.armorSlot[9]);
                this.armorSlot[9].makeEmpty();
                this.armorSlot[8].makeCopy(temp);
            }
            else
            {
                if(!this.armorSlot[data.slotNumber].isEmpty)
                {
                    let temp = new invSlot();
                    temp.makeCopy(this.inventorySlot[data.index]);
                    this.inventorySlot[data.index].makeCopy(this.armorSlot[data.slotNumber]);
                    this.armorSlot[data.slotNumber].makeCopy(temp);

                }
                else
                {                   
                    this.armorSlot[data.slotNumber].makeCopy(this.inventorySlot[data.index])
                    this.inventorySlot[data.index].makeEmpty();
                                            
                }  
            }

        }
        else if (data.type == 'Ammo')
        {
            if(this.armorSlot[10].isEmpty)
            {
                this.armorSlot[10].makeCopy(this.inventorySlot[data.index])
                this.inventorySlot[data.index].makeEmpty();
            
            }
        }
        
        
        //console.log(this.armorSlot[9]);   
        
        this.updateInventory(connection);
        
    }

    unequipItem(data, connection = Connection)
    {
        console.log("unequip called");
        if(!this.checkInvFull(1))
        {
            console.log("inventory not full");

            if(data.type == 'double' || data.type == 'single' || data.type == 'Ammo')
            {
                console.log("type is valid");

                let x = this.findEmptySlot();
                this.inventorySlot[x].makeCopy(this.armorSlot[data.slotNumber]);
                this.armorSlot[data.slotNumber].makeEmpty();
                
                this.updateInventory(connection);
            }
        }
    }

    dropItem(data, connection = Connection)
    {
        if(data.destroyDrop)
        {
            this.inventorySlot[data.slotNumber].makeEmpty();
            this.updateInventory(connection);
        }
    }

    

};
