require.config({
        　　paths: {
                "wilddog": "https://cdn.wilddog.com/sdk/js/2.1.2/wilddog",
                "THREE": "lib/three.min",
                //threejs editor helper
                "EditorControls": "lib/EditorControls",
                "TransformControls": "lib/TransformControls",
                //script self
                "Editor": "scripts/Editor/Editor",
                "EditorTools": "scripts/Editor/EditorTools",
                "ThreeJSEditor": "scripts/Editor/ThreeJsSceneEditor",

                "Server": "scripts/Server/server",
                "ItemsManager": "scripts/App/ItemsManager",
                "Item": "scripts/App/Item",
                "App": "scripts/App/App",
        　　}
});
require(['App'], function (App) {
        var app = new App();
        console.log("App start!");
});