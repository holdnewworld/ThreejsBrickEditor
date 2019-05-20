define(['Item'], function (Item) {
    //只管 添加、 删除、 查找
    var threejsTypeEnum = ['cube', 'cone', 'cylinder', 'sphere'];
    var ItemsManager = function (currentapp) {
        this.app = currentapp;
        var _this = this;
        this.items = {};
        this.scene = this.app.scene;
        this.userid = this.app.user.uid;
        this.currentSelected = null;

        //on ref scenedata.items
        this.rootref = this.app.rootref;
        this.scenedata = this.app.currentscenedata;
        this.itemsref = this.rootref.ref(this.scenedata.url + "/items");
        this.itemsref.on("child_added", function (data) {
            _this.rootref.ref(data.val()).once('value', function (snap) {
                if (!_this.items[snap.val().itemid])
                    _this.items[snap.val().itemid] = new Item(_this.rootref, snap.val(), _this.scene, _this);
            })
        });
        this.itemsref.on("child_removed", function (data) {
            if (!_this.items[data.key()]) return;
            _this.items[data.key()].destroy();
            delete _this.items[data.key()];
        });
    }
    //主动 add 的时候 要添加 scenedata.items
    ItemsManager.prototype.addRandomItem = function () {
        var data = {};
        data.name = "Object" + parseInt(Math.random() * 10000);//1
        data.color = Math.random() * 0xffffff;//3
        data.parentuid = "null";//4
        data.selected = false;//5
        data.statetag = "idle";//6
        var typeindex = parseInt(Math.random() * threejsTypeEnum.length);
        data.matrixtype = threejsTypeEnum[typeindex];//7
        data.px = Math.random() * 1000 - 500;
        data.py = Math.random() * 600 - 300;
        data.pz = Math.random() * 800 - 400;
        data.rx = Math.random() * 2 * Math.PI;
        data.ry = Math.random() * 2 * Math.PI;
        data.rz = Math.random() * 2 * Math.PI;
        data.sx = Math.random() * 2 + 1;
        data.sy = Math.random() * 2 + 1;
        data.sz = Math.random() * 2 + 1
        this.pushNewItem(data);
    }
    ItemsManager.prototype.addPositedItem = function (pos, info) {
        var data = {};
        data.name = "Object" + parseInt(Math.random() * 10000);//1
        data.color = info.color;//3
        data.parentuid = "null";//4
        data.selected = false;//5
        data.statetag = "idle";//6
        var typeindex = parseInt(Math.random() * threejsTypeEnum.length);
        data.matrixtype = info.type;//threejsTypeEnum[typeindex];//7
        data.px = pos.x;
        data.py = pos.y;
        data.pz = pos.z;
        data.rx = 0; data.ry = 0; data.rz = 0;
        data.sx = 1; data.sy = 1; data.sz = 1;
        this.pushNewItem(data);
    }
    ItemsManager.prototype.pushNewItem = function (temp) {
        //generate 3js data
        var _3jsobjref = this.rootref.ref('_3jsobjdata').push();
        var data = temp;
        data.uuid = _3jsobjref.key();//2
        //set threejs
        var newitemRef = this.rootref.ref('scene-items').push();
        data.itemid = newitemRef.key();
        data.inScene = "scenes/" + this.scenedata.sceneId;//6
        data.timeStamp = this.rootref.ServerValue.TIMESTAMP;
        _3jsobjref.set(data);

        //set item
        var itemdata = {
            inScene: "scenes/" + this.scenedata.sceneId,
            itemname: 'default',
            itemid: newitemRef.key(),
            _3jsobjurl: "_3jsobjdata/" + _3jsobjref.key()
        }
        newitemRef.set(itemdata);

        this.itemsref.child(newitemRef.key()).set("scene-items/" + newitemRef.key());
    }
    ItemsManager.prototype.removeItem = function (item) {
        var tempid = "";
        if (item === this.currentSelected) this.dropCurrentSelected();
        if (!item.itemid || (item.threejsobj && (item.threejsobj.selected === true))) return;
        tempid += item.itemid;
        if (item.threejsurl)
            this.rootref.ref(item.threejsurl).remove();
        this.rootref.ref("scene-items/" + tempid).remove();
        this.itemsref.child(tempid).remove();
    }

    // update user-aim
    ItemsManager.prototype.selectItem = function (item) {
        if (item.Selected) item.Select(this);
    }
    ItemsManager.prototype.userSelected = function (item) {
        this.currentSelected = item;
        this.app.selectedItem(item);
        //up to wilddog
        var itemid = item.itemid;
        var userAimRef = this.rootref.ref('user-aim/' + this.userid + '/' + this.scenedata.sceneId + '/' + itemid);
        var userEditingRef = this.rootref.ref('user-editing/' + this.userid);
        userAimRef.set(true);
        userAimRef.onDisconnect().remove();
        userEditingRef.set('editing');
        userEditingRef.onDisconnect().remove();
    }
    //change the details
    ItemsManager.prototype.dropCurrentSelected = function () {
        if (this.currentSelected) {
            this.currentSelected.Droped();
            var userAimRef = this.rootref.ref('user-aim/' + this.userid + '/' + this.scenedata.sceneId + '/' + this.currentSelected.itemid);
            var userEditingRef = this.rootref.ref('user-editing/' + this.userid);
            userAimRef.onDisconnect().cancel();
            userAimRef.remove();
            userEditingRef.onDisconnect().cancel();
            userEditingRef.remove();
        }
        this.currentSelected = null;
    }
    ItemsManager.prototype.pushCurrentSlected = function () {
        if (this.currentSelected) {
            this.currentSelected.Selected(this);
            this.currentSelected.updateState();
        }
    }
    ItemsManager.prototype.dispose = function () {
        if (this.currentSelected) this.dropCurrentSelected();
        this.rootref.ref('_3jsobjdata').off();
        this.itemsref.off();
    }
    return ItemsManager;
});