define(["THREE"], function (THREE) {
    //Item 只监听+修改子属性
    var Item = (function () {
        var defaultMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        var CubeGeo = new THREE.BoxGeometry(50, 50, 50),
            ConeGeo = new THREE.ConeGeometry(30, 50, 32),
            CylinderGeo = new THREE.CylinderGeometry(25, 25, 50, 32),
            SphereGeo = new THREE.SphereGeometry(25, 32, 32);

        var dataequal = function (olddata, newdata) {
            for (var p in olddata) {
                if (p == 'timeStamp')
                    continue;
                if (olddata[p] != newdata[p])
                    return false;
            }
            return true;
        }
        var Obj = function (ref, data, scene) {
            var _this = this;
            this.scene = scene;
            this.rootref = ref;
            for (var p in data) {
                switch (p) {
                    case 'itemid':
                        _this.itemid = data[p];
                        break;
                    case 'name':
                        _this.name = data[p];
                        break;
                    case 'inScene':
                        _this.inScene = data[p];
                        break;
                    case '_3jsobjurl':
                        //通过 meta.val() 查找到three js object data 然后还原；
                        _this.threejsref = _this.rootref.ref(data[p]);
                        _this.threejsurl = data[p];
                        _this.threejsref.once('value', function (snap) {
                            //set transfrom isue
                            var transdata = snap.val();
                            _this.threejsobj = _this.localupdate3jsData(transdata);
                            var colorData = (transdata.selected == true) ? 0xff0000 : transdata.color;//ADD 标志！！
                            _this.threejsobj.material.color.set(new THREE.Color(colorData));
                            var hexData = (transdata.selected == true) ? 0xff0000 : 0x000000;
                            _this.threejsobj.material.emissive.setHex(hexData);
                        });
                        break;
                };
            }
            //on ref
            this.onRef();
        }
        Obj.prototype.get3jsRefData = function () {
            var _3jsobj = this.threejsobj;
            if (!_3jsobj) return null;
            return {
                itemid: _3jsobj.itemid,
                type: _3jsobj.type,
                name: _3jsobj.name,
                uuid: _3jsobj.uuid,
                selected: _3jsobj.selected,
                statetag: _3jsobj.statetag,
                parentuid: _3jsobj.parentuid,
                timeStamp: _3jsobj.timeStamp,
                color: _3jsobj.color,
                matrixtype: _3jsobj.matrixtype,
                px: _3jsobj.position.x,
                py: _3jsobj.position.y,
                pz: _3jsobj.position.z,
                rx: _3jsobj.rotation.x,
                ry: _3jsobj.rotation.y,
                rz: _3jsobj.rotation.z,
                sx: _3jsobj.scale.x,
                sy: _3jsobj.scale.y,
                sz: _3jsobj.scale.z,
            }
        }
        //select and drop
        Obj.prototype.Select = function (manager) {
            // set authority
            var data = this.get3jsRefData();
            if (data.selected === true) return;
            //three js 
            this.offRef();
            data.selected = true;
            data.timeStamp = this.rootref.ServerValue.TIMESTAMP;
            var _this = this;
            this.threejsref.set(data).then(function () {
                _this.Selected(manager);
                // release object when close/refresh window
                _this.threejsref.onDisconnect().update({
                    selected: false
                });
            });
        }
        Obj.prototype.Selected = function (manager) {
            if (!this.threejsobj) return;
            this.threejsobj.selected = true;
            this.threejsobj.material.emissive.setHex(0x000000);
            manager.userSelected(this);
        }
        Obj.prototype.Droped = function () {
            this.onRef();
            //set 最后一次的data
            var data = this.get3jsRefData();
            data.selected = false;
            data.timeStamp = this.rootref.ServerValue.TIMESTAMP;
            this.threejsref.set(data);
            this.threejsref.onDisconnect().cancel();
        }

        //ref functions——————————————————————————————————————
        Obj.prototype.onRef = function () {
            var _this = this;
            this.rootref.ref("scene-items").child(this.itemid).on("child_changed", function (snap) {
                console.log(snap.val());
            });
            if (this.threejsref) this.threejsref.on('value', function (snap) {
                var data = snap.val();
                if (!data) return;
                if (!_this.threejsobj) return;
                if (data.timeStamp < _this.threejsobj.timeStamp) return;
                if (data.matrixtype && data.matrixtype !== _this.threejsobj.matrixtype) {
                    _this.scene.remove(_this.threejsobj);
                    _this.threejsobj = _this.localupdate3jsData(data);
                    var colorData = (data.selected == true) ? 0xff0000 : data.color;//ADD 标志！！
                    _this.threejsobj.material.color.set(new THREE.Color(colorData));
                    var hexData = (data.selected == true) ? 0xff0000 : 0x000000;
                    _this.threejsobj.material.emissive.setHex(hexData);
                    return;
                }
                _this.threejsobj.itemid = data.itemid;
                _this.threejsobj.name = data.name;
                _this.threejsobj.uuid = data.uuid;
                _this.threejsobj.selected = data.selected;
                _this.threejsobj.statetag = data.statetag;
                _this.threejsobj.parentuid = data.parentuid;
                _this.threejsobj.timeStamp = data.timeStamp;
                _this.threejsobj.color = data.color;
                _this.threejsobj.matrixtype = data.matrixtype;
                _this.threejsobj.position.x = data.px;
                _this.threejsobj.position.y = data.py;
                _this.threejsobj.position.z = data.pz;
                _this.threejsobj.rotation.x = data.rx;
                _this.threejsobj.rotation.y = data.ry;
                _this.threejsobj.rotation.z = data.rz;
                _this.threejsobj.scale.x = data.sx
                _this.threejsobj.scale.y = data.sy;
                _this.threejsobj.scale.z = data.sz;

                var colorData = (data.selected == true) ? 0xff0000 : data.color;//ADD 标志！！
                _this.threejsobj.material.color.set(new THREE.Color(colorData));
                var hexData = (data.selected == true) ? 0xff0000 : 0x000000;
                _this.threejsobj.material.emissive.setHex(hexData);
            });
        }
        Obj.prototype.offRef = function () {
            this.rootref.ref("scene-items").child(this.itemid).off();
            if (this.threejsref) this.threejsref.off();
        }
        //——————————————————————end

        //set functions——————————————————————————————————————
        Obj.prototype.updateState = function () {
            if (!this.threejsobj || this.threejsobj.selected === false) return;
            var currentdata = this.get3jsRefData();
            if (!dataequal(this.pre3jsdata, currentdata)) {
                currentdata.timeStamp = this.rootref.ServerValue.TIMESTAMP;
                this.threejsref.update(currentdata);
            }
            this.pre3jsdata = currentdata;
        }

        Obj.prototype.localupdate3jsData = function (data) {
            var threejsObj = null;
            switch (data.matrixtype) {
                case "cube":
                    threejsObj = new THREE.Mesh(CubeGeo.clone(), defaultMaterial.clone());
                    break;
                case "cone":
                    threejsObj = new THREE.Mesh(ConeGeo.clone(), defaultMaterial.clone());
                    break;
                case 'cylinder':
                    threejsObj = new THREE.Mesh(CylinderGeo.clone(), defaultMaterial.clone());
                    break;
                case "sphere":
                    threejsObj = new THREE.Mesh(SphereGeo.clone(), defaultMaterial.clone());
                    break;
                default:
                    threejsObj = new THREE.Object3D();
                    break;
            }
            threejsObj.item = this;
            threejsObj.tag = "sceneItem";
            threejsObj.itemid = this.itemid;
            threejsObj.name = data.name;
            threejsObj.uuid = data.uuid;
            threejsObj.color = data.color;
            threejsObj.parentuid = data.parentuid;
            threejsObj.timeStamp = data.timeStamp;
            threejsObj.selected = data.selected;
            threejsObj.statetag = data.statetag;
            threejsObj.matrixtype = data.matrixtype;

            threejsObj.position.x = data.px;
            threejsObj.position.y = data.py;
            threejsObj.position.z = data.pz;

            threejsObj.scale.x = data.sx;
            threejsObj.scale.y = data.sy;
            threejsObj.scale.z = data.sz;

            threejsObj.rotation.x = data.rx;
            threejsObj.rotation.y = data.ry;
            threejsObj.rotation.z = data.rz;

            threejsObj.material.color.set(new THREE.Color(data.color));
            this.scene.add(threejsObj);
            return threejsObj;
        }
        Obj.prototype.editItemMeta = function (data) {
            if (!this.threejsobj) return;
            if (data.matrixtype && data.matrixtype !== this.threejsobj.matrixtype) {
                this.scene.remove(this.threejsobj);
                this.threejsobj = this.localupdate3jsData(data);
                return;
            }
            this.threejsobj.itemid = data.itemid;
            this.threejsobj.name = data.name;
            this.threejsobj.uuid = data.uuid;
            this.threejsobj.selected = data.selected;
            this.threejsobj.statetag = data.statetag;
            this.threejsobj.parentuid = data.parentuid;
            this.threejsobj.timeStamp = data.timeStamp;
            this.threejsobj.color = data.color;
            this.threejsobj.matrixtype = data.matrixtype;
            this.threejsobj.position.x = data.px;
            this.threejsobj.position.y = data.py;
            this.threejsobj.position.z = data.pz;
            this.threejsobj.rotation.x = data.rx;
            this.threejsobj.rotation.y = data.ry;
            this.threejsobj.rotation.z = data.rz;
            this.threejsobj.scale.x = data.sx
            this.threejsobj.scale.y = data.sy;
            this.threejsobj.scale.z = data.sz;
            this.threejsobj.material.color.set(new THREE.Color(data.color));
        }
        //————————————————end

        Obj.prototype.destroy = function () {
            //remove from local scene,and remove scene-items:item
            this.rootref.ref("scene-items/" + this.itemid).off();
            if (this.threejsref) this.threejsref.off();
            if (this.threejsobj) {
                this.scene.remove(this.threejsobj);
            }
            this.itemid = undefined;
            this.name = undefined;
            this.inScene = undefined;
            this.threejsobj = undefined;
        }
        return function (ref, data, scene) {
            return new Obj(ref, data, scene);
        }
    })();

    return Item;
});