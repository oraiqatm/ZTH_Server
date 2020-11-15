module.exports = class invSlot{
    constructor(itemName, itemId, quanity, isEmpty)
    {
        this.name = itemName;
        this.id = itemId;
        this.amount = quanity; 
        this.isEmpty = isEmpty;

        //Make some sort of look up table for item information.
    }

    makeEmpty()
    {
        this.name ="";
        this.id = 0;
        this.amount = 1;
        this.isEmpty = true;
    }
}