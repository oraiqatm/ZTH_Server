module.exports = class invSlot{
    constructor(itemName, itemId, imgName, quanity)
    {
        this.name = itemName;
        this.id = itemId;
        this.imgName = imgName;
        this.amount = quanity; 
        this.isEmpty = true;
    }
}