define(['THREE', 'EditorControls', 'TransformControls'], function (THREE, EditorControls, TransformControls) {
	var ThreeJSEditor = function (currentapp) {
		//————————————————————————————————————————init base scene part
		var _this = this;
		var app = currentapp;
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		var mousePlane = new THREE.Plane();
		var INTERSECTED = null;
		var deletehandle = false;
		var addhandle = false;
		var timetemp = 0;

		var onDownPosition = new THREE.Vector2();
		var onUpPosition = new THREE.Vector2();
		var onDoubleClickPosition = new THREE.Vector2();

		var offset = new THREE.Vector3();
		var intersection = new THREE.Vector3();
		var INTERSECTED = null;

		var camera = app.camera;
		var scene = app.scene;
		var renderer = app.renderer;
		var dom = renderer.domElement;

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

		//window edit used
		// roll-over helpers
		var rollOverGeo = new THREE.BoxGeometry(49, 49, 49);
		var rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
		var rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
		rollOverMesh.createVisible = true;
		plane.add(rollOverMesh);
		//selected helper
		/*var selectGeo = new THREE.BoxGeometry( 52,52,52 );
		var selectMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
		var selectMesh = new THREE.Line( selectGeo, selectMaterial );
		selectMesh.position.copy(new THREE.Vector3(0,10000,0));
		plane.add( selectMesh );*/
		scene.add(plane);

		//set controls
		var controls = new EditorControls(camera, dom);
		//transfrom controls
		var transformcontrol = new TransformControls(camera, dom);
		transformcontrol.name = "transformcontroler";
		transformcontrol.tag = 'controller';
		transformcontrol.addEventListener('mouseDown', function () {
			controls.enabled = false;
		});
		transformcontrol.addEventListener('mouseUp', function () {
			controls.enabled = true;
		});
		scene.add(transformcontrol);
		//——————————————————————————————————————ADD events
		var prevTime, request;
		function animate(time) {
			request = requestAnimationFrame(animate);
			try {
				if (renderer) renderer.render(scene, camera);
			} catch (e) {
				console.error((e.message || e), (e.stack || ""));
			}
			prevTime = time;
		}
		//———————————————————— Actions Facing UI	
		//Bind UIs
		//Add mouse events
		dom.addEventListener('mousedown', onMouseDown, false);
		dom.addEventListener('touchstart', onTouchStart, false);
		dom.addEventListener('dblclick', onDoubleClick, false);
		dom.addEventListener('mousemove', onMouseMove, false);
		document.addEventListener('keydown', onKeyDown, false);
		document.addEventListener('keyup', onKeyUp, false);
		//————————————————————————————————————————————— Mouse Actions ———————————————————————————————————————————————
		function getIntersects(point, objects) {
			mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);
			raycaster.setFromCamera(mouse, camera);
			return raycaster.intersectObjects(objects);
		}
		function getMousePosition(x, y) {
			var rect = dom.getBoundingClientRect();
			return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
		}

		function handleClick(event) {
			if (onDownPosition.distanceTo(onUpPosition) === 0) {
				var intersects = getIntersects(onUpPosition, scene.children);

				if (intersects.length > 0 && event.button == 0) {
					//Add action
					if (addhandle && intersects[0].face) {
						if (!rollOverMesh.createVisible) {
							console.log("此处已有目标！请选另一处！");
							return;
						}

						var pos = new THREE.Vector3();
						pos.copy(rollOverMesh.position);
						app.addpositeddefaultitem(pos);
						return;
					}

					var object = intersects[0].object;
					if (object.item) {
						//delete action
						if (deletehandle) {
							app.removeItem(object.item);
							return;
						}
						//select action
						if (object.selected !== true) {
							app.selectItem(object.item);
						}
					} else {
						app.dropCurrentSelected();
					}

				} else {
					app.dropCurrentSelected();
				}
			}
		}
		function onMouseDown(event) {
			event.preventDefault();
			var array = getMousePosition(event.clientX, event.clientY);
			onDownPosition.fromArray(array);
			dom.style.cursor = 'move';
			var intersects = getIntersects(onDownPosition, scene.children);
			//if(intersects.length > 0)
			dom.addEventListener('mouseup', onMouseUp, false);
		}

		function onMouseUp(event) {
			var array = getMousePosition(event.clientX, event.clientY);
			onUpPosition.fromArray(array);
			handleClick(event);
			dom.style.cursor = 'auto';
			dom.removeEventListener('mouseup', onMouseUp, false);
		}

		function onTouchStart(event) {
			var touch = event.changedTouches[0];
			var array = getMousePosition(touch.clientX, touch.clientY);
			onDownPosition.fromArray(array);
			dom.addEventListener('touchend', onTouchEnd, false);
		}

		function onTouchEnd(event) {
			var touch = event.changedTouches[0];
			var array = getMousePosition(touch.clientX, touch.clientY);
			onUpPosition.fromArray(array);
			handleClick(event);
			dom.removeEventListener('touchend', onTouchEnd, false);
		}

		function onDoubleClick(event) {
			var array = getMousePosition(event.clientX, event.clientY);
			onDoubleClickPosition.fromArray(array);
		}
		function onMouseMove(event) {
			event.preventDefault();
			dom.style.cursor = 'auto';
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
			var array = getMousePosition(event.clientX, event.clientY);
			mouse.fromArray(array);
			var intersects = getIntersects(mouse, scene.children);
			if (intersects.length > 0) {
				if (intersects[0].face) {
					rollOverMesh.position.copy(intersects[0].point).add(intersects[0].face.normal);
					rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
					rollOverMesh.createVisible = true;
					rollOverMesh.material.color.set(new THREE.Color(0x00ff00));
					if (intersects[0].object.position.distanceTo(rollOverMesh.position) < 0.5) {
						rollOverMesh.createVisible = false;
						rollOverMesh.material.color.set(new THREE.Color(0xff0000));
					}
				}

				if (intersects[0].object.tag === "sceneItem") {
					dom.style.cursor = 'pointer';
					if (!INTERSECTED) {
						INTERSECTED = intersects[0].object;
						INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
						if (!INTERSECTED.selected) INTERSECTED.material.emissive.setHex(0xff0000);
					} else if (INTERSECTED != intersects[0].object) {
						if (!INTERSECTED.selected)
							INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
						INTERSECTED = intersects[0].object;
						INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
						if (!INTERSECTED.selected) INTERSECTED.material.emissive.setHex(0xff0000);
					}
				} else {
					if (INTERSECTED && !INTERSECTED.selected) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
					INTERSECTED = null;
				}
			} else {
				if (INTERSECTED && !INTERSECTED.selected) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
				rollOverMesh.position.copy(new THREE.Vector3(0, 10000, 0));
				INTERSECTED = null;
			}
			timetemp++;
			if (timetemp > 5) {
				app.pushcurrentSelecte();
				if (app.getcurrentSelected()) {
					_this.selectedObj(app.getcurrentSelected().threejsobj);
				}
				timetemp = 0;
			}
		}
		function onKeyDown(event) {
			switch (event.keyCode) {
				case 16: //shift
					deletehandle = true; break;
				case 81: // Q
					transformcontrol.setSpace(transformcontrol.space === "local" ? "world" : "local");
					break;
				case 17: // Ctrl
					addhandle = true;
					break;
				case 87: // W
					transformcontrol.setMode("translate");
					break;
				case 69: // E
					transformcontrol.setMode("rotate");
					break;
				case 82: // R
					transformcontrol.setMode("scale");
					break;
				case 187:
				case 107: // +, =, num+
					transformcontrol.setSize(transformcontrol.size + 0.1);
					break;
				case 189:
				case 109: // -, _, num-
					transformcontrol.setSize(Math.max(transformcontrol.size - 0.1, 0.1));
					break;
			}
		}

		function onKeyUp(event) {

			switch (event.keyCode) {

				case 16: //shift
					deletehandle = false;
					break;
				case 17: // Ctrl
					addhandle = false;
					break;
			}

		}
		//—————————————————————————————————————————— Mouse actions end——————————————————————————————————————————————
		this.selectedObj = function (mesh) {
			if (!mesh) return;
			if (transformcontrol) transformcontrol.attach(mesh);
			//selectMesh.position.copy(mesh.position);
		}
		this.dropObj = function () {
			transformcontrol.detach();
			//selectMesh.position.copy(new THREE.Vector3(0,5000,0));
		}
		this.dispose = function () {
			dom.removeEventListener('mousedown', onMouseDown, false);
			dom.removeEventListener('mousemove', onMouseMove, false);
			dom.removeEventListener('touchstart', onTouchStart, false);
			dom.removeEventListener('dblclick', onDoubleClick, false);
			document.removeEventListener('keydown', onKeyDown, false);
			document.removeEventListener('keyup', onKeyUp, false);
			dom = null;
			if (controls) controls.dispose();
			if (transformcontrol) transformcontrol.dispose();
			transformcontrol = null;
			controls = null;
			renderer = null;
			scene = null;
			camera = null;

			timetemp = 0;

			raycaster = new THREE.Raycaster();
			mouse = new THREE.Vector2();
			mousePlane = new THREE.Plane();
			INTERSECTED = null;

			onDownPosition = new THREE.Vector2();
			onUpPosition = new THREE.Vector2();
			onDoubleClickPosition = new THREE.Vector2();

			offset = new THREE.Vector3();
			intersection = new THREE.Vector3();
			cancelAnimationFrame(animate);
		}

		//start update
		animate(performance.now());
	}

	return ThreeJSEditor;
})