var map;

window.onload = function() {
    var mm = com.modestmaps;
    wax.tilejson('http://a.tiles.mapbox.com/v3/mapbox.world-bright.jsonp',
        function(tj) {
        map = new com.modestmaps.Map('map',
            new wax.mm.connector(tj), null, [
                new MM.DragHandler(),
                new easey.DoubleClickHandler(),
                new easey.MouseWheelHandler()
            ]);
        map.setCenterZoom(new com.modestmaps.Location(30, -90), 4);
    });

    $('button').click(function(b) {
        eval($('pre', this.parentNode).text());
    });
};
