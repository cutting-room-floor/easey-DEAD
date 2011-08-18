var map;

$.domReady(function() {
    var mm = com.modestmaps,
    map = new com.modestmaps.Map('map',
        new wax.mm.connector({
            tiles: ['http://a.tiles.mapbox.com/mapbox/1.0.0/world-glass/{z}/{x}/{y}.png'],
            scheme: 'tms'
        }), new mm.Point(600, 600), [
            new easey.DragHandler(),
            new easey.DoubleClickHandler(),
            new easey.MouseWheelHandler()
        ]);
    map.setCenterZoom(new com.modestmaps.Location(30, -90), 4);

    $('button').click(function(b) {
        eval($('pre', this.parentNode).text());
    });
});
