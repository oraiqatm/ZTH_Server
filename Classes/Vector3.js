module.exports = class Vector3{
    constructor(X = 0, Y= 0, Z = 0){
        this.x = X;
        this.y = Y;
        this.z = Z;
    }

    Magnitude(){
        //Returns the length of the vector
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    }

    Normalize(){
        var mag = this.Magnitude();
        return new Vector3(this.x / mag, this.y / mag, this.z/ mag);
    }

    Distance(OtherVect = Vector3){
        var direction = new Vector3();
        direction.x = OtherVect - this.x;
        direction.y = OtherVect - this.y;
        direction.z = OtherVect - this.z;
        return direction.Magnitude();
    }

    ConsoleOuput(){
        return '(' + this.x + ',' + this.y + ',' + this.z + ')'; 
    }

    
}