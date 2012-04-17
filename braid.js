var map;

window.onload = function() {
    var mm = com.modestmaps;
    var dmap = document.getElementById('map');
    wax.tilejson('http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets.jsonp',
        function(tj) {
        map = new com.modestmaps.Map(dmap, new wax.mm.connector(tj), null, [
          easey.DragHandler(),
          easey.BraidHandler(),
          easey.DoubleClickHandler()
        ]);
        map.setCenterZoom(new com.modestmaps.Location(50, 50), 4);

        var right = document.getElementById('right');

        var positions = [
          map.locationCoordinate({ lat: 0, lon: 0 }).zoomTo(4),
          map.locationCoordinate({ lat: 20, lon: -50 }).zoomTo(4),
          map.locationCoordinate({ lat: 50, lon: 50 }).zoomTo(4)];

        easey().map(map);

        function update() {
          var pos = right.scrollTop / 500;

          easey.from(positions[Math.floor(pos)])
            .to(positions[Math.ceil(pos)])
            .t(pos - Math.floor(pos));
        }

        right.addEventListener('scroll', update, false);
    });
};
