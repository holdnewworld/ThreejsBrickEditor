define(function () {
	var SceneEditor = function (currentapp) {
		this.app = currentapp;
		var _this = this;
		var scenediv = null;
		var sceneturnsref = null;
		//—————————————————————————————————————————— Scenes Button ——————————————————————————————————————————
		this.showScenes = function (rootref) {
			var _this = this;
			sceneturnsref = rootref;
			scenediv = document.createElement('div');
			scenediv.id = 'scenes';
			document.getElementById('scenepanel').appendChild(scenediv);

			sceneturnsref.ref('users').on('child_added', function (snap) {
				var sceneButton = document.createElement('button');
				sceneButton.height = '20px';
				sceneButton.width = '200px';
				sceneButton.textContent = snap.val().lastScene;
				sceneButton.addEventListener('click', function () {
					sceneturnsref.ref(snap.val().lastScene).once('value', function (snap) {
						_this.app.dispose();
						var data = snap.val();
						_this.app.loadscene(data);
					})
				});

				if (scenediv) scenediv.appendChild(sceneButton);
			});
		}
		this.hideScenes = function () {
			if (document.getElementById('scenes'))
				document.getElementById('scenes').remove();
		}
		this.dispose = function () {
			var _this = this;
			sceneturnsref.ref('users').off();
			if (scenediv) scenediv.remove();
		}

		//—————————————————————————————————————————— Scenes Button end ——————————————————————————————————————————		
	}
	var PriviligeController = function () {
		var privilegeRef = null, usersRef = null, rolediv = null, userscontainer = null;
		//—————————————————————————————————————————— Privilege Control ——————————————————————————————————————————		
		this.showUserPrivilege = function (rootref, sceneId, uid) {
			if (!uid || !sceneId) return;
			rolediv = document.createElement('div');
			rolediv.id = 'agent-role-in-scene';
			rolediv.position = 'fixed';
			document.getElementById('scenepanel').appendChild(rolediv);

			// get user id
			var privilegeRefUrl = 'scene-privilege/' + sceneId + '/editors';
			privilegeRef = rootref.ref(privilegeRefUrl);
			privilegeRef.child(uid).on('value', function (snap) {
				if (snap.val() == 'owner') {
					rolediv.textContent = 'owner';
				} else if (snap.val() == true) {
					rolediv.textContent = 'editor';
				} else {
					rolediv.textContent = 'visitor';
				}
			});
		}
		this.showUsers = function (rootref, sceneId, currentuid) {
			userscontainer = document.createElement('div');
			userscontainer.id = "users";
			userscontainer.style.margin = "20px 0 0 0";
			userscontainer.style.alpha = "0.3";

			document.getElementById('scenepanel').appendChild(userscontainer);

			rootref.child('scene-privilege/' + sceneId).child('owner').once('value', function (snap) {
				var uid = snap.val();
				// only shows for creator
				if (uid == currentuid) {
					//show Editor panel

					// get user list and show
					var usersRefUrl = 'user-scene/' + sceneId;
					usersRef = rootref.ref(usersRefUrl);

					// scene-edit records "editable editors" for each scene
					var privilegeRefUrl = 'scene-privilege/' + sceneId + '/editors';
					var privilegeRef = rootref.ref(privilegeRefUrl);

					usersRef.on('child_added', function (snap) {
						var uid = snap.key();
						if (document.getElementById(uid))
							document.getElementById(uid).remove();
						if (uid != currentuid) {
							// first check if in scene-privilege editor list
							privilegeRef.child(uid).once('value', function (snap) {
								if (snap.val() == true) {
									var role = "editor";
									userDivGenerator(privilegeRef, uid, role, userscontainer);
								} else {
									var role = "visitor";
									userDivGenerator(privilegeRef, uid, role, userscontainer);
								}
							});
						}
					});
					usersRef.on('child_removed', function (snap) {
						var uid = snap.key();
						// if the left user is an editor, keep it in the list
						privilegeRef.child(uid).once('value', function (snap) {
							if (snap.val() == undefined) {
								if (document.getElementById(uid))
									document.getElementById(uid).remove();
							}
						});
					});
					privilegeRef.on('child_added', function (snap) {
						var uid = snap.key();
						if (uid != currentuid) {
							var role = "editor";
							// delete repeated div generated when reading from user list
							if (document.getElementById(uid))
								document.getElementById(uid).remove();
							userDivGenerator(privilegeRef, uid, role, userscontainer);
						}
					});
					privilegeRef.on('child_removed', function (snap) {
						var uid = snap.key();
						var role = "visitor";
						// delete repeated div generated before changed
						if (document.getElementById(uid))
							document.getElementById(uid).remove();
						userDivGenerator(privilegeRef, uid, role, userscontainer);
					});
				}
			});
			this.dispose = function () {
				if (rolediv) rolediv.remove();
				if (userscontainer) userscontainer.remove();
				if (usersRef) usersRef.off();
				if (privilegeRef) privilegeRef.off();
			}
		}
		function userDivGenerator(scenePrivilegeRef, uid, role, container) {
			var userdiv = document.createElement('div');
			userdiv.textContent = uid + " (" + role + ")";
			userdiv.id = uid;
			if (role == "visitor") {
				userDivAddButton(scenePrivilegeRef, uid, userdiv);
			} else if (role == "editor") {
				userDivDelButton(scenePrivilegeRef, uid, userdiv);
			}
			container.appendChild(userdiv);
		}
		function userDivAddButton(scenePrivilegeRef, uid, container) {
			var addButton = document.createElement('button');
			addButton.textContent = "添加编辑权限";
			// call function in App
			addButton.addEventListener('click', function () {
				scenePrivilegeRef.child(uid).set(true);
			});
			container.appendChild(addButton);
		}
		function userDivDelButton(scenePrivilegeRef, uid, container) {
			var delButton = document.createElement('button');
			delButton.textContent = "取消编辑权限";
			delButton.addEventListener('click', function () {
				scenePrivilegeRef.child(uid).remove();
			});

			container.appendChild(delButton);
		}
		function closeUserList() {
			if (document.getElementById('users'))
				document.getElementById('users').remove();
		}
		//—————————————————————————————————————————— Privilege Control end ——————————————————————————————————————————
	}

	var GeneratInhericity = function () {
		//init type block
		var threejsTypeEnum = ['cube', 'cone', 'cylinder', 'sphere'];
		var selectBlock = document.createElement('select');
		selectBlock.id = 'itemtype';
		document.getElementById('editorTools').appendChild(selectBlock);
		for (i = 0; i < threejsTypeEnum.length; i++) {
			var item = document.createElement('option');
			item.value = threejsTypeEnum[i];
			item.textContent = "创建：" + threejsTypeEnum[i];
			selectBlock.appendChild(item);
		}

		//init color type
		var colorbox = document.createElement('input');
		colorbox.type = 'color';
		colorbox.textContent = "下一个被Item的颜色"
		document.getElementById('editorTools').appendChild(colorbox);

		this.getCreateInfo = function () {
			return {
				type: selectBlock.value,
				color: colorbox.value
			};
		}
		this.showPanel = function () {
			document.getElementById('editorTools').hidden = false;
		}
		this.dispose = function () {
			selectBlock.remove();
			colorbox.remove();
		}
	}
	var ItemInhericity = function (Item) {
		var data = Item.get3jsRefData();
		if (!data) return;

		//init panel
		var panel = document.createElement('div');
		document.getElementById('editorTools').appendChild(panel);

		//init color type
		var colorbox = document.createElement('input');
		colorbox.type = 'color';
		colorbox.onchange = function () {
			data.color = colorbox.value;
			Item.editItemMeta(data);
		}
		colorbox.value = data.color;
		panel.appendChild(colorbox);

		//init meshtype
		var threejsTypeEnum = ['cube', 'cone', 'cylinder', 'sphere'];
		var meshtype = document.createElement('select');
		meshtype.id = 'itemtype';
		for (i = 0; i < threejsTypeEnum.length; i++) {
			var item = document.createElement('option');
			item.value = threejsTypeEnum[i];
			item.textContent = "Mesh类型：" + threejsTypeEnum[i];
			meshtype.appendChild(item);
		}
		meshtype.value = data.matrixtype;
		meshtype.onchange = function () {
			data.matrixtype = meshtype.value;
			Item.editItemMeta(data);
		}
		panel.appendChild(meshtype);

		//close
		this.dispose = function () {
			panel.remove();
		}
	}

	return {
		SceneEditor: SceneEditor,
		PriviligeController: PriviligeController,
		GeneratInhericity: GeneratInhericity,
		ItemInhericity: ItemInhericity
	};

});