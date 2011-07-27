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
        function easeIn(t) {
            return t * t;
        }


        // Ensure that this handler is attached once.
        if (!this.doubleClickHandler) {
            var theHandler = this;
            this.doubleClickHandler = function(e) {
                // Get the point on the map that was double-clicked
                var point = com.modestmaps.getMousePoint(e, theHandler.map);
                var n = 0;
                var duration = 100;

                var start = +new Date();
                var zs = theHandler.map.getZoom();
                var zc = theHandler.map.getCenter();
                var zi = window.setInterval(function z() {
                    // use shift-double-click to zoom out
                    var delta = +new Date() - start;
                    if (delta > duration) {
                        window.clearInterval(zi);
                        theHandler.map.setZoom(Math.round(theHandler.map.getZoom()));
                        return;
                    }
                    var t = delta / duration;
                    var za = zs + (easeIn(t) * (e.shiftKey ? -1 : 1));
                    theHandler.map.setZoom(za);
                }, 0);

                return com.modestmaps.cancelEvent(e);
            };
        }
        return this.doubleClickHandler;
    }
};
