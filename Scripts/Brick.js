define(function () {
    //Brick 一块积木
    /** 
     * 积木属性
     * 所处格子数组位置：[n,n,n]
     * 形态：enum Shape
     */
    var Brick = function (uid) {
        this.uid = uid;
        this.site = new Array(3);//[x,y,z]
        this.shape = Brick.Shape.Cube;//default cube
        this.color = 0xafafaf;//default color
    };
    Brick.Shape = {
        Cube: 0,
        Cone: 1,
        Cylinder: 2,
        Sphere: 3
    };

    return Brick;
});