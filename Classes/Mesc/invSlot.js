module.exports = class invSlot{
    constructor(itemName, itemId, quanity)
    {
        this.name = itemName;
        this.id = itemId;
        this.amount = quanity; 
        this.isEmpty = true;
    }
}