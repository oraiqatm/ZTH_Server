module.exports = class invSlot{
    constructor(itemName, itemId, quanity, isEmpty)
    {
        this.name = itemName;
        this.id = itemId;
        this.amount = quanity; 
        this.isEmpty = isEmpty;
    }
}