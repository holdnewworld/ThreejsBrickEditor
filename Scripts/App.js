define(['Builder', 'Renderer', 'Editor'], function (Builder, Renderer, Editor) {
    var App = function () {
        this.builder = new Builder();
        this.renderer = new Renderer();

        var dom = document.getElementById('scene');
        this.renderer.AttachTo(dom);
        this.editor = new Editor(this.builder, this.renderer.scene, this.renderer.camera, dom);

        //bind events
        this.builder.OnItemAdd.AddListener(this.renderer.AddBrick, this.renderer);
        this.builder.OnItemRemove.AddListener(this.renderer.RemoveBrick, this.renderer);
        this.builder.OnItemChanged.AddListener(this.renderer.ChangeBrick, this.renderer);
    };

    return App;
});