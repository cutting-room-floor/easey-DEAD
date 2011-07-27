var easey = {};

easey.slowZoom = function (map, by) {
    console.log(by);
    function easeIn(t) {
        return t * t;
    }
    var start = +new Date();
    var zs = map.getZoom();
    var zc = map.getCenter();
    var duration = 100;
    var zi = window.setInterval(function() {
        // use shift-double-click to zoom out
        var delta = +new Date() - start;
        if (delta > duration) {
            window.clearInterval(zi);
            map.setZoom(Math.round(map.getZoom()));
            return;
        }
        var t = delta / duration;
        // TODO: correct centerpoint
        var za = zs + easeIn(t) * by;
        map.setZoom(za);
    }, 0);
};

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

                easey.slowZoom(theHandler.map, (e.shiftKey ? -1 : 1));

                return com.modestmaps.cancelEvent(e);
            };
        }
        return this.doubleClickHandler;
    }
};



// A handler that allows mouse-wheel zooming - zooming in
// when page would scroll up, and out when the page would scroll down.
easey.MouseWheelHandler = function(map) {
    if (map !== undefined) {
        this.init(map);
    }
};

easey.MouseWheelHandler.prototype = {

    init: function(map) {
        this.map = map;
        com.modestmaps.addEvent(map.parent, 'mousewheel', this.getMouseWheel());
    },

    mouseWheelHandler: null,

    getMouseWheel: function() {
        // Ensure that this handler is attached once.
        if (!this.mouseWheelHandler) {
            var theHandler = this;
            var prevTime = new Date().getTime();
            this.mouseWheelHandler = function(e) {

                var delta = 0;
                if (e.wheelDelta) {
                    delta = e.wheelDelta;
                } else if (e.detail) {
                    delta = -e.detail;
                }

                // limit mousewheeling to once every 200ms
                var timeSince = new Date().getTime() - prevTime;

                if (Math.abs(delta) > 0 && (timeSince > 200)) {
                    var point = com.modestmaps.getMousePoint(e, theHandler.map);
                    easey.slowZoom(theHandler.map, delta > 0 ? 1 : -1);

                    prevTime = new Date().getTime();
                }

                // Cancel the event so that the page doesn't scroll
                return com.modestmaps.cancelEvent(e);
            };
        }
        return this.mouseWheelHandler;
    }
};
