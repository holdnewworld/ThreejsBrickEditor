define(function (){
    //预留
    var SourcesManager = function(){
        //wilddog
        this.scripts = {};
    }
    SourcesManager.prototype.addScript = function ( object, script ) {
        if ( this.scripts[ object.uuid ] === undefined ) {
            this.scripts[ object.uuid ] = [];
        }
        this.scripts[ object.uuid ].push( script );
    };

    SourcesManager.prototype.removeScript = function ( object, script ) {
        if ( this.scripts[ object.uuid ] === undefined ) return;
        var index = this.scripts[ object.uuid ].indexOf( script );
        if ( index !== - 1 ) {
            this.scripts[ object.uuid ].splice( index, 1 );
        }
    }

    return SourcesManager;
});