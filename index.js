var map;

window.onload = function() {
    var mm = com.modestmaps;
    var dmap = document.getElementById('map');
    wax.tilejson('http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets.jsonp',
        function(tj) {
        map = new com.modestmaps.Map(dmap,
            new wax.mm.connector(tj), null, [
                easey.DragHandler(),
                easey.MouseWheelHandler(),
                easey.DoubleClickHandler()
            ]);
        map.setCenterZoom(new com.modestmaps.Location(-10, 50), 3);
    });
};
