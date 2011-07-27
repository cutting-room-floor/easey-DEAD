var easey = {};
// Handle double clicks, that zoom the map in one zoom level.
easey.DoubleClickHandler = function(map) {
    if (map !== undefined) {
        this.init(map);
    }
};

easey.DoubleClickHandler.prototype = {

    init: function(map) {
        this.map = map;
        com.modestmaps.addEvent(map.parent, 'dblclick', this.getDoubleClick());
    },

    doubleClickHandler: null,

    getDoubleClick: function() {
        // Ensure that this handler is attached once.
        if (!this.doubleClickHandler) {
            var theHandler = this;
            this.doubleClickHandler = function(e) {
                // Get the point on the map that was double-clicked
                var point = com.modestmaps.getMousePoint(e, theHandler.map);
                var n = 0;

                var zi = window.setInterval(function z() {
                    // use shift-double-click to zoom out
                    theHandler.map.zoomByAbout(e.shiftKey ? -0.1 : 0.1, point);
                    if (++n === 10) {
                        window.clearInterval(zi);
                        theHandler.map.setZoom(Math.round(theHandler.map.getZoom()));
                    }
                }, 5);

                return com.modestmaps.cancelEvent(e);
            };
        }
        return this.doubleClickHandler;
    }
};
