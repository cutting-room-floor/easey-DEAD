var map, madden;

window.addEventListener('load', function() {

    var mm = com.modestmaps,
    map = new com.modestmaps.Map('map',
        new wax.mm.connector({
            tiles: ['http://a.tiles.mapbox.com/mapbox/1.0.0/world-light/{z}/{x}/{y}.png'],
            scheme: 'tms'
        }), null, [
        new easey.DoubleClickHandler()
    ]);
    map.setCenterZoom(new com.modestmaps.Location(33.760882, 66.137695), 4);
});
