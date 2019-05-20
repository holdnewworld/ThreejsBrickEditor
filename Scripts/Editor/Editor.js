define(['EditorTools', 'ThreeJSEditor'], function (EditorTools, ThreeJSEditor) {
	var Editor = function (currentapp) {
		//set document
		var _this = this;
		var se = null, pe = null, sceneController = null, createInfoController = null, itemEditor = null;//tools
		var app = currentapp;

		//app functions
		this.AppEditorInit = function (rootref, scenedata, uid) {
			//init html UI view by scenedata
			se = new EditorTools.SceneEditor(app);
			pe = new EditorTools.PriviligeController();
			createInfoController = new EditorTools.GeneratInhericity();
			sceneController = new ThreeJSEditor(app);
			se.showScenes(rootref);
			pe.showUserPrivilege(rootref, scenedata.sceneId, uid, createInfoController.showPanel);
			pe.showUsers(rootref, scenedata.sceneId, uid);
			userEnterScene(rootref, scenedata.sceneId, uid);
			loginDone();
		}
		this.AppEditorDispose = function (rootref, scenedata, uid) {
			if (se) se.dispose();
			if (pe) pe.dispose();
			if (sceneController) sceneController.dispose();
			if (createInfoController) createInfoController.dispose();
			userleaveScene(rootref, scenedata.sceneId, uid);
			logoutDone();
		}

		this.selectedTransform = function (item) {
			if (!sceneController) return;
			if (item.threejsobj) {
				sceneController.selectedObj(item.threejsobj);
				if (itemEditor) itemEditor.dispose();
				itemEditor = new EditorTools.ItemInhericity(item);
			}
			else
				sceneController.selectedObj(null);
		}
		this.dropTransform = function () {
			sceneController.dropObj();
			if (itemEditor) itemEditor.dispose();
		}
		this.getCreateInfo = function () {
			return createInfoController.getCreateInfo();
		}
		//—————————————————————————————————————————— Default Button Actions ——————————————————————————————————————————
		document.getElementById('login-opener').addEventListener('click', login_open, false);
		function login_open() {
			document.getElementById('login-div').hidden = false;
			document.getElementById('register-div').hidden = true;
		}
		document.getElementById('register-opener').addEventListener('click', register_open, false);
		function register_open() {
			document.getElementById('register-div').hidden = false;
			document.getElementById('login-div').hidden = true;
		}
		document.getElementById('register').addEventListener('click', register, false);
		function register(event) {
			var email = document.getElementById('register-email').value;
			var password = document.getElementById('register-password').value;
			app.register(email, password);
		}
		document.getElementById('login').addEventListener('click', login, false);
		function login(event) {
			var email = document.getElementById('login-email').value;
			var password = document.getElementById('login-password').value;
			app.login(email, password);
		}
		function loginDone() {
			document.getElementById('register-login').hidden = true;
			document.getElementById('logoutpanel').hidden = false;
		}

		document.getElementById('logout').addEventListener('click', logout, false);
		function logout() {
			app.logout();
		}
		function logoutDone() {
			document.getElementById('register-login').hidden = false;
			document.getElementById('logoutpanel').hidden = true;
		}
		//—————————————————————————————————————————— Button Actions end ——————————————————————————————————————————


		//—————————————————————————————————————————— scene Control ——————————————————————————————————————————

		function userEnterScene(rootref, sceneId, uid) {
			var ref = rootref.ref('user-scene/' + sceneId);
			ref.child(uid).set(true);
		}
		function userleaveScene(rootref, sceneId, uid) {
			var ref = rootref.ref('user-scene/' + sceneId);
			console.log("leaving", ref.toString())
			if (uid) ref.child(uid).remove();
		}
		//—————————————————————————————————————————— scene Control end ——————————————————————————————————————————

	}

	return Editor;
});


