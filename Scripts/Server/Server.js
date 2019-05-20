define(["wilddog"], function (wilddog) {
    var Server = function (app) {
        this.app = app;
        this.uid;
        this.init();
    }
    Server.prototype.init = function () {
        var _this = this;
        var config = {
            authDomain: "dragcube.wilddog.com",
            syncURL: "https://dragcube.wilddogio.com/"
        };
        wilddog.initializeApp(config);
        this.wilddogServer = wilddog.sync();

        wilddog.auth().onAuthStateChanged(function (user) {
            if (user) {
                // init all from here
                _this.wilddogServer.ref("users").child(user.uid).once('value', function (snap) {
                    //get scene data
                    //console.log(snap.val());
                    _this.wilddogServer.ref(snap.val().lastScene).once('value', function (snap) {
                        //turn scene
                        _this.app.loadscene(snap.val());
                    })
                });
            } else {
                console.log("user logged out.");
            }
        });
    }
    Server.prototype.register = function (email, password) {
        var _this = this;
        if (email && password) {
            wilddog.auth().createUserWithEmailAndPassword(email, password).then(function (user) {
                //——————————————————————init a default item——start
                //set default scene-privilege
                var newSceneRef = _this.wilddogServer.ref('scenes').push();
                var sceneId = newSceneRef.key();
                //set user data
                var userData = {
                    uid: user.uid,
                    username: "user" + parseInt(Math.random() * 0xffffff),
                    lastScene: "scenes/" + sceneId,
                };
                _this.wilddogServer.ref("users").child(user.uid).set(userData);
                newSceneRef.set({
                    sceneId: sceneId,
                    name: 'default',
                    creator: user.uid,
                    url: "scenes/" + sceneId,
                });
                var authorities = {};
                authorities[user.uid] = "owner";
                _this.wilddogServer.ref("scene-privilege").child(sceneId).set({
                    owner: user.uid,
                    editors: authorities,
                });

                /*//set default item
                            var _3jsobjref = _this.wilddogServer.ref('_3jsobjdata').push();
                            var newitemRef = _this.wilddogServer.ref('scene-items').push(); 
                            var itemdata = {
                                inScene:"scenes/"+sceneId,
                                itemname:"default",
                                itemid:newitemRef.key(),
                                _3jsobjurl:"_3jsobjdata/"+_3jsobjref.key()
                            }
                            newitemRef.set(itemdata);
                //set threejs
                            var data = {};
                            data.name = "Object" + parseInt(Math.random() * 10000);//1
                            data.uuid = _3jsobjref.key();//2
                            data.color = Math.random() * 0xffffff;//3
                            data.parentuid = "null";//4
                            data.selected = false;//5
                            data.statetag = "idle";//6
                            data.matrixtype = "cube";//7
                            data.px = Math.random() * 1000 - 500;
                            data.py = Math.random() * 600 - 300;
                            data.pz = Math.random() * 800 - 400;
                            data.rx = Math.random() * 2 * Math.PI;
                            data.ry = Math.random() * 2 * Math.PI;
                            data.rz = Math.random() * 2 * Math.PI;
                            data.sx = Math.random() * 2 + 1;
                            data.sy = Math.random() * 2 + 1;
                            data.sz = Math.random() * 2 + 1
                            data.itemid = newitemRef.key();
                            _3jsobjref.set(data);
                        //————————————————————init a default item——end
                            var items = {};
                            items[newitemRef.key()] = 'scene-items/'+newitemRef.key();
                            newSceneRef.child('items').set(items);
                            */
            }).catch(function (err) {
                console.info("create user failed.", err);
            });
        } else {
            console.log("fill in both fileds.");
        }
        return false;
    }
    Server.prototype.login = function (email, password) {
        wilddog.auth().signInWithEmailAndPassword(email, password);
    }
    Server.prototype.logout = function () {
        this.app.dispose();
        wilddog.auth().signOut();
    }
    Server.prototype.getCurrentUser = function () {
        return wilddog.auth().currentUser;
    }

    return Server;
});
