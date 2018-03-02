define(['THREE', 'Brick', 'Signal'], function (THREE, Brick, Signal) {
    // 默认引用的资源
    var defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xafafaf });
    var CubeGeo = new THREE.BoxGeometry(50, 50, 50),
        ConeGeo = new THREE.ConeGeometry(30, 50, 32),
        CylinderGeo = new THREE.CylinderGeometry(25, 25, 50, 32),
        SphereGeo = new THREE.SphereGeometry(25, 32, 32);

    //显示的砖块
    var RenderBrick = function (brick) {
        THREE.Mesh.call(this, CubeGeo, defaultMaterial.clone());
        this.SetBrick(brick);
    };
    RenderBrick.prototype = Object.create(THREE.Mesh.prototype);
    //select and drop
    RenderBrick.prototype.SetBrick = function (brick) {
        this.brick = brick;
        switch (this.brick.shape) {
            case Brick.Shape.Cube: this.geometry = CubeGeo; break;
            case Brick.Shape.Cone: this.geometry = ConeGeo; break;
            case Brick.Shape.Cylinder: this.geometry = CylinderGeo; break;
            case Brick.Shape.Sphere: this.geometry = SphereGeo; break;
            default: break;
        }
        this.material.color.set(new THREE.Color(this.brick.color));
    };
    RenderBrick.prototype.Dispose = function () {
        this.geometry.dispose();
        delete this.geometry;
        this.material.dispose();
        delete this.material;
    };

    //渲染器
    var Renderer = function () {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(70, 1, 1, 10000);
        this.camera.position.z = 1000;
        this.bricks = {};

        //设置灯光
        var light = new THREE.SpotLight(0xffffff, 1.5);
        light.position.set(0, 500, 2000);
        light.castShadow = true;
        light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
        light.shadow.bias = - 0.00022;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x505050));

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        requestAnimationFrame(this.render.bind(this));
    };
    Renderer.prototype.render = function () {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    };
    Renderer.prototype.AttachTo = function (dom) {
        if (!dom) return;
        dom.appendChild(this.renderer.domElement);
        this.onWindowResize(dom.clientWidth, dom.clientHeight);
    };
    Renderer.prototype.onWindowResize = function (width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };
    Renderer.prototype.AddBrick = function (brick) {
        if (!brick || !brick.uid) return;
        if (this.bricks[brick.uid]) return;
        this.bricks[brick.uid] = new RenderBrick(brick);
        if (brick.site) {
            this.bricks[brick.uid].position.x = brick.site[0];
            this.bricks[brick.uid].position.y = brick.site[1];
            this.bricks[brick.uid].position.z = brick.site[2];
        }
        this.scene.add(this.bricks[brick.uid]);
    };
    Renderer.prototype.ChangeBrick = function (brick) {
        if (!brick || !brick.uid) return;
        if (!this.bricks[brick.uid]) return;
        this.bricks[brick.uid].SetBrick(brick);
        if (brick.site) {
            this.bricks[brick.uid].position.x = brick.site[0];
            this.bricks[brick.uid].position.y = brick.site[1];
            this.bricks[brick.uid].position.z = brick.site[2];
        }
    };
    Renderer.prototype.RemoveBrick = function (uid) {
        if (!this.bricks[uid]) return;
        this.scene.remove(this.bricks[uid]);
        this.bricks[uid].Dispose();
        delete this.bricks[uid];
    };
    return Renderer;
})