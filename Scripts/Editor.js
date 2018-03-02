define(['THREE', 'EditorControls', 'TransformControls', 'Signal'], function (THREE, EditorControls, TransformControls, Signal) {
    //编辑器
    var Editor = function (builder, scene, camera, dom) {
        this.builder = builder;
        this.camera = camera;
        this.scene = scene;
        this.dom = dom;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.mousePlane = new THREE.Plane();
        this.INTERSECTED = null;
        this.deletehandle = false;
        this.addhandle = false;
        this.timetemp = 0;

        this.onDownPosition = new THREE.Vector2();
        this.onUpPosition = new THREE.Vector2();
        this.onDoubleClickPosition = new THREE.Vector2();

        this.offset = new THREE.Vector3();
        this.intersection = new THREE.Vector3();
        this.selected = null;

        //set controls
        this.controls = new EditorControls(camera, dom);

        //transfrom controls
        this.transformcontrol = new TransformControls(camera, dom);
        this.scene.add(this.transformcontrol);

        //init scene Tools
        //Plane
        var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
        geometry.rotateX(- Math.PI / 2);
        var plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
        // grid
        var size = 500, step = 50;
        var geometry = new THREE.Geometry();
        for (var i = - size; i <= size; i += step) {
            geometry.vertices.push(new THREE.Vector3(- size, 0, i));
            geometry.vertices.push(new THREE.Vector3(size, 0, i));
            geometry.vertices.push(new THREE.Vector3(i, 0, - size));
            geometry.vertices.push(new THREE.Vector3(i, 0, size));
        }
        var material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true });
        var line = new THREE.LineSegments(geometry, material);
        line.tag = "scenegrid";
        plane.add(line);

        // roll-over helpers
        var rollOverGeo = new THREE.BoxGeometry(49, 49, 49);
        var rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
        this.rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
        this.rollOverMesh.createVisible = true;
        plane.add(this.rollOverMesh);
        this.scene.add(plane);

        //———————————————————— Actions Facing UI	
        //Bind UIs
        //Add mouse events
        this.transformcontrol.addEventListener('mouseDown', function () {
            this.controls.enabled = false;
        }.bind(this));
        this.transformcontrol.addEventListener('mouseUp', function () {
            this.controls.enabled = true;
        }.bind(this));

        this.dom.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.dom.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.dom.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.dom.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        this.dom.addEventListener('dblclick', this.onDoubleClick.bind(this), false);
        this.dom.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    };
    Editor.prototype = {
        onMouseDown: function (event) {
            event.preventDefault();
            var array = this.getMousePosition(event.clientX, event.clientY);
            this.onDownPosition.fromArray(array);
            this.dom.style.cursor = 'move';
        },
        onMouseUp: function (event) {
            var array = this.getMousePosition(event.clientX, event.clientY);
            this.onUpPosition.fromArray(array);
            this.handleClick(event);
            this.dom.style.cursor = 'auto';
        },
        handleClick: function (event) {
            if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) {
                var intersects = this.getIntersects(this.onUpPosition, this.scene.children);

                if (intersects.length > 0 && event.button == 0) {
                    //Add action
                    if (this.addhandle && intersects[0].face) {
                        if (!this.rollOverMesh.createVisible) {
                            console.log("此处已有目标！请选另一处！");
                            return;
                        }

                        var pos = new Array(3);
                        pos[0] = this.rollOverMesh.position.x;
                        pos[1] = this.rollOverMesh.position.y;
                        pos[2] = this.rollOverMesh.position.z;
                        var uid = guid();
                        this.builder.Add(uid, pos);
                        console.log("Signal1:Add " + uid);
                        return;
                    }

                    var object = intersects[0].object;
                    if (object.brick) {
                        //delete action
                        if (this.deletehandle) {
                            console.log("Signal2:Remove ");
                            console.log(object.brick);
                            this.builder.Remove(object.brick);
                            return;
                        }

                        //select action
                        console.log("Signal3:Select " + object.brick);
                        this.selected = object.brick;

                    } else {
                        console.log("Signal4:Drop ");
                        this.selected = null;
                    }

                } else {
                    console.log("Signal4:Drop ");
                    this.selected = null;
                }
            }
        },
        onMouseMove: function (event) {
            event.preventDefault();
            this.dom.style.cursor = 'auto';
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            var array = this.getMousePosition(event.clientX, event.clientY);
            this.mouse.fromArray(array);
            var intersects = this.getIntersects(this.mouse, this.scene.children);
            if (intersects.length > 0) {
                if (intersects[0].face) {
                    this.rollOverMesh.position.copy(intersects[0].point).add(intersects[0].face.normal);
                    this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    this.rollOverMesh.createVisible = true;
                    this.rollOverMesh.material.color.set(new THREE.Color(0x00ff00));
                    if (intersects[0].object.position.distanceTo(this.rollOverMesh.position) < 0.5) {
                        this.rollOverMesh.createVisible = false;
                        this.rollOverMesh.material.color.set(new THREE.Color(0xff0000));
                    }
                }

                if (intersects[0].object.tag === "sceneItem") {
                    this.dom.style.cursor = 'pointer';
                    if (!this.INTERSECTED) {
                        this.INTERSECTED = intersects[0].object;
                        this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                        if (!this.INTERSECTED.selected) this.INTERSECTED.material.emissive.setHex(0xff0000);
                    } else if (this.INTERSECTED != intersects[0].object) {
                        if (!this.INTERSECTED.selected)
                            this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                        this.INTERSECTED = intersects[0].object;
                        this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                        if (!this.INTERSECTED.selected) this.INTERSECTED.material.emissive.setHex(0xff0000);
                    }
                } else {
                    if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                    this.INTERSECTED = null;
                }
            } else {
                if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                this.rollOverMesh.position.copy(new THREE.Vector3(0, 10000, 0));
                this.INTERSECTED = null;
            }
        },
        onTouchStart: function (event) {
        },
        onTouchEnd: function (event) {
        },
        onDoubleClick: function (event) {
            var array = this.getMousePosition(event.clientX, event.clientY);
            this.onDoubleClickPosition.fromArray(array);
        },
        getMousePosition: function (x, y) {
            var rect = this.dom.getBoundingClientRect();
            return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
        },
        getIntersects: function (point, objects) {
            this.mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);
            this.raycaster.setFromCamera(this.mouse, this.camera);
            return this.raycaster.intersectObjects(objects);
        },
        onKeyDown: function (event) {
            switch (event.keyCode) {
                case 16: //shift
                    this.deletehandle = true; break;
                case 81: // Q
                    this.transformcontrol.setSpace(this.transformcontrol.space === "local" ? "world" : "local");
                    break;
                case 17: // Ctrl
                    this.addhandle = true;
                    break;
                case 87: // W
                    this.transformcontrol.setMode("translate");
                    break;
                case 69: // E
                    this.transformcontrol.setMode("rotate");
                    break;
                case 82: // R
                    this.transformcontrol.setMode("scale");
                    break;
                case 187:
                case 107: // +, =, num+
                    this.transformcontrol.setSize(this.transformcontrol.size + 0.1);
                    break;
                case 189:
                case 109: // -, _, num-
                    this.transformcontrol.setSize(Math.max(this.transformcontrol.size - 0.1, 0.1));
                    break;
            }
        },
        onKeyUp: function (event) {
            switch (event.keyCode) {
                case 16: //shift
                    this.deletehandle = false;
                    break;
                case 17: // Ctrl
                    this.addhandle = false;
                    break;
            }

        }
    };
    function guid() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };
    return Editor;
});