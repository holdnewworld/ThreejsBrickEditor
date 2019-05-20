define(['Server', 'ItemsManager', 'Editor', 'THREE'], function (Server, ItemsManager, Editor, THREE) {
    var App = function () {
        var _this = this;
        //init container
        this.width = 960;
        this.height = 640;

        this.renderer = null;
        this.rootref = null;
        var server, editor;
        //managers
        var Itemsmanager;
        this.user = null;
        //————————————self functions
        this.loadscene = function (scenedata) {
            _this.user = server.getCurrentUser();
            _this.currentscenedata = scenedata;
            _this.dom = document.createElement('div');
            if (document.getElementById('ApplicationWindow')) {
                document.getElementById('ApplicationWindow').appendChild(_this.dom);
            } else {
                document.body.appendChild(_this.dom);
            }
            _this.renderer = new THREE.WebGLRenderer({ antialias: true });
            _this.renderer.setClearColor(0xffffff);
            _this.renderer.setPixelRatio(window.devicePixelRatio);
            _this.renderer.setSize(_this.width, _this.height);
            _this.dom.appendChild(_this.renderer.domElement);

            _this.scene = new THREE.Scene();

            //设置灯光
            var light = new THREE.SpotLight(0xffffff, 1.5);
            light.position.set(0, 500, 2000);
            light.castShadow = true;
            light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
            light.shadow.bias = - 0.00022;
            light.shadow.mapSize.width = 2048;
            light.shadow.mapSize.height = 2048;
            _this.scene.add(light);
            _this.scene.add(new THREE.AmbientLight(0x505050));
            light = null;

            //generate camera
            _this.camera = new THREE.PerspectiveCamera(70, _this.width / _this.height, 1, 10000);
            _this.camera.position.z = 1000;

            Itemsmanager = new ItemsManager(_this);//generate objects manager
            //editor load
            if (editor) editor.AppEditorInit(_this.rootref, scenedata, _this.user.uid);
        }

        this.dispose = function () {
            if (_this.dom) _this.dom.parentNode.removeChild(_this.dom);
            _this.dom = null;
            if (_this.renderer) _this.renderer.dispose();
            _this.renderer = null;
            _this.camera = undefined;
            _this.scene = undefined;
            _this.renderer = undefined;
            if (Itemsmanager) Itemsmanager.dispose();
            Itemsmanager = undefined;
            var uid = null;
            if (_this.user && _this.user.uid) uid = _this.user.uid;
            console.log(uid);
            if (editor) editor.AppEditorDispose(_this.rootref, _this.currentscenedata, uid);
        }

        this.setSize = function (width, height) {
            _this.width = width;
            _this.height = height;
            if (_this.camera) {
                _this.camera.aspect = _this.width / _this.height;
                _this.camera.updateProjectionMatrix();
            }
            if (_this.renderer) {
                _this.renderer.setSize(_this.width, _this.height);
            }
        }
        //—————————————————————————————————————————————— Facing Server
        server = new Server(this);
        this.rootref = server.wilddogServer;
        //base data
        this.register = function (email, password) {
            server.register(email, password);
        }
        this.login = function (email, password) {
            server.login(email, password);
        }
        this.logout = function () {
            server.logout();
        }
        //———————————————————————— end

        //—————————————————————————————————————————————— Facing Editor
        editor = new Editor(this);

        this.addrandombox = function () {
            if (Itemsmanager) Itemsmanager.addRandomItem();
        }
        this.addpositeddefaultitem = function (pos) {
            var info = editor.getCreateInfo();
            if (Itemsmanager) Itemsmanager.addPositedItem(pos, info);
        }

        this.removeItem = function (item) {
            if (Itemsmanager) Itemsmanager.removeItem(item);
        }

        this.getcurrentSelected = function () {
            if (Itemsmanager) return Itemsmanager.currentSelected;
            return null;
        }
        this.selectItem = function (item) {
            this.dropCurrentSelected();
            if (Itemsmanager) Itemsmanager.selectItem(item);
        }
        this.selectedItem = function (item) {
            editor.selectedTransform(item);
        }
        this.dropCurrentSelected = function () {
            if (Itemsmanager) Itemsmanager.dropCurrentSelected();
            editor.dropTransform();
        }
        this.pushcurrentSelecte = function () {
            if (Itemsmanager) { Itemsmanager.pushCurrentSlected(); }
        }
        //———————————————————————— end
    }

    return App;
});