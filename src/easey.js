(function(context, MM) {
    var easey = {};

    function easeIn(t) { return t * t; }
    function easeOut(t) { return Math.sin(t * Math.PI / 2); }

    easey.slowZoom = function (map, by, point, duration) {
        var start = +new Date(),
            zs = map.getZoom(),
            zc = map.getCenter(),
            zoomTotal = 0;


        var zi = window.setInterval(function() {
            var delta = +new Date() - start;

            if (delta > duration) {
                window.clearInterval(zi);
                return map.setZoom(zs + by);
            }

            var thisZoom = easeIn(delta / duration) * by;
            map.zoomByAbout(thisZoom - zoomTotal, point);

            zoomTotal += thisZoom - zoomTotal;
        }, 0);
    };

    easey.slowPan = function (map, to, duration) {
        var start = +new Date(),
            startCenter = map.getCenter();

        var zi = window.setInterval(function() {
            // use shift-double-click to zoom out
            var delta = +new Date() - start;
            if (delta > duration) {
                window.clearInterval(zi);
                // return map.setCenter(centerTo);
            }

            var t = easeOut(delta / duration);

            map.setCenter(MM.Location.interpolate(startCenter, to, t));
        }, 0);
    };

    easey.slowZoomPan = function (map, to, z, duration) {
        var start = (+new Date()),
            startZoom = map.getZoom(),
            startCenter = map.getCenter();

        var zi = window.setInterval(function() {
            // use shift-double-click to zoom out
            var delta = (+new Date()) - start;
            if (delta > duration) {
                window.clearInterval(zi); // return map.setCenter(centerTo);
            }

            var t = easeOut(delta / duration);
            map.setCenterZoom(MM.Location.interpolate(startCenter, to, t),
                (startZoom * (1 - t) + z * t));
            map.draw();
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
            MM.addEvent(map.parent, 'dblclick', this.getDoubleClick());
        },

        doubleClickHandler: null,

        getDoubleClick: function() {

            // Ensure that this handler is attached once.
            if (!this.doubleClickHandler) {
                var theHandler = this;
                this.doubleClickHandler = function(e) {
                    // Get the point on the map that was double-clicked
                    var point = MM.getMousePoint(e, theHandler.map);
                    var n = 0;

                    easey.slowZoom(theHandler.map, (e.shiftKey ? -1 : 1), point);

                    return MM.cancelEvent(e);
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
            MM.addEvent(map.parent, 'mousewheel', this.getMouseWheel());
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
                        var point = MM.getMousePoint(e, theHandler.map);
                        easey.slowZoom(theHandler.map, delta > 0 ? 1 : -1, point);

                        prevTime = new Date().getTime();
                    }

                    // Cancel the event so that the page doesn't scroll
                    return MM.cancelEvent(e);
                };
            }
            return this.mouseWheelHandler;
        }
    };



    // Handle the use of mouse dragging to pan the map.
    easey.DragHandler = function(map) {
        if (map !== undefined) {
            this.init(map);
        }
    };

    easey.DragHandler.prototype = {

        init: function(map) {
            this.map = map;
            MM.addEvent(map.parent, 'mousedown', MM.bind(this.mouseDown, this));
        },

        mouseDown: function(e) {
            MM.addEvent(document, 'mouseup', this._mouseUp = MM.bind(this.mouseUp, this));
            MM.addEvent(document, 'mousemove', this._mouseMove = MM.bind(this.mouseMove, this));

            this.lastMouse = new MM.Point(e.clientX, e.clientY);
            this.prevMouse = new MM.Point(e.clientX, e.clientY);
            this.map.parent.style.cursor = 'move';

            return MM.cancelEvent(e);
        },

        mouseMove: function(e) {
            if (this.prevMouse) {
                this.map.panBy(
                    e.clientX - this.prevMouse.x,
                    e.clientY - this.prevMouse.y);

                this.lastMouse = new MM.Point(this.prevMouse.x, this.prevMouse.y);
                this.prevMouse = new MM.Point(e.clientX, e.clientY);

                this.prevMouse.t = +new Date();
            }

            return MM.cancelEvent(e);
        },

        mouseUp: function(e) {
            MM.removeEvent(document, 'mouseup', this._mouseUp);
            MM.removeEvent(document, 'mousemove', this._mouseMove);

            var angle = Math.atan2(
                this.lastMouse.y - this.prevMouse.y,
                this.lastMouse.x - this.prevMouse.x);
            var distance = MM.Point.distance(this.lastMouse, this.prevMouse);

            var speed = Math.max(2, distance / ((+new Date()) - this.prevMouse.t)) / 2;

            if (isNaN(angle) || speed < 5) return;

            var xDir = Math.max(-50, Math.min(50, Math.cos(angle) * speed));
            var yDir = Math.max(-50, Math.min(50, Math.sin(angle) * speed));

            easey.slowPan(this.map, xDir, yDir, 200);
            this.prevMouse = null;
            this.map.parent.style.cursor = '';

            return MM.cancelEvent(e);
        }
    };

    this.easey = easey;
})(this, com.modestmaps);
