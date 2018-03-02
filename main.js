require.config({
        paths: {
                "THREE": "lib/three.min",
                "EditorControls": "lib/EditorControls",
                "TransformControls": "lib/TransformControls",
                
                "Brick": "Scripts/Brick",
                "Builder": "Scripts/Builder",
                "Renderer": "Scripts/Renderer",
                "Signal": "Scripts/Signal",
                "Editor": "Scripts/Editor",
                "App": "Scripts/App"
        }
});
require(['App'], function (App) {
        var app = new App();
        console.log("App start!");
});