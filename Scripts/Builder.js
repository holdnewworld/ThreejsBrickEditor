define(['Brick', 'Signal'], function (Brick, Signal) {
    var Builder = function (site, bricks) {
        //已拥有的砖块{"uid":{details}}
        this.bricks = bricks ? bricks : {};

        //events
        this.OnItemAdd = new Signal();//+
        this.OnItemRemove = new Signal();//-
        this.OnItemChanged = new Signal();//change
    };
    Builder.prototype.Add = function (uid, site, shape, color) {
        //if exist
        if (this.bricks[uid]) return false;

        this.bricks[uid] = new Brick(uid);
        if (site) this.bricks[uid].site = site;
        if (shape) this.bricks[uid].shape = shape;
        if (color) this.bricks[uid].color = color;

        this.OnItemAdd.Excute(this.bricks[uid]);
    };
    Builder.prototype.RemoveByUid = function (uid) {
        if (!this.bricks[uid]) return;
        delete this.bricks[uid];
        this.OnItemRemove.Excute(uid);
    };
    Builder.prototype.Remove = function (brick) {
        if (!brick || !brick.uid) return;
        //if exist
        if (!this.bricks[brick.uid]) return;
        delete this.bricks[brick.uid];
        this.OnItemRemove.Excute(brick.uid);
    };
    Builder.prototype.SetSite = function (uid, site) {
        if (typeof site !== Array) return false;
        //if not exist
        if (!this.bricks[uid]) return false;

        //if site is not valid return false;

        this.bricks[uid].site = site;
        this.OnItemChanged.Excute(this.bricks[uid]);
    };
    Builder.prototype.SetColor = function (uid, color) {
        //if not exist
        if (!this.bricks[uid]) return false;

        this.bricks[uid].color = color;
        this.OnItemChanged.Excute(this.bricks[uid]);
    };
    Builder.prototype.SetShape = function (uid, shape) {
        //if not exist
        if (!this.bricks[uid]) return false;

        this.bricks[uid].shape = shape;
        this.OnItemChanged.Excute(this.bricks[uid]);
    };

    return Builder;
});