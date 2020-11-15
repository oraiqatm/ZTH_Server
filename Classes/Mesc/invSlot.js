module.exports = class invSlot{
    constructor(itemName, itemId, quanity, type, isEmpty)
    {
        this.name = itemName;
        this.id = itemId;
        this.amount = quanity; 
        this.type = type;
        this.isEmpty = isEmpty;

        //Make some sort of look up table for item information.
    }

    makeEmpty()
    {
        this.name ="empty";
        this.id = 0;
        this.amount = 1;
        this.type = "empty";
        this.isEmpty = true;
    }

    makeCopy(item = invSlot)
    {
        this.name = item.name;
        this.id = item.id;
        this.amount = item.amount;
        this.type = item.type;
        this.isEmpty = item.isEmpty;
    }
}