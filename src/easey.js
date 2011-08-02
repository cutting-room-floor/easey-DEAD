(function(context, MM) {
    var easey = {};
    easey.slowZoom = function (map, by, point) {
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
                map.setZoom(zs + by);
                return;
            }
            var t = delta / duration;
            // TODO: correct centerpoint
            var zb = easeIn(t) * by;
            map.zoomByAbout(zb, point);
        }, 0);
    };

    easey.slowPan = function (map, x, y, duration) {
        function easeOut(t) {
            return Math.sin(t * Math.PI / 2);
        }
        var start = +new Date();
        var zi = window.setInterval(function() {
            // use shift-double-click to zoom out
            var delta = +new Date() - start;
            if (delta > duration) {
                return window.clearInterval(zi);
            }

            var t = delta / duration;

            var xe = easeOut(t) * x;
            var ye = easeOut(t) * y;
            map.panBy(xe, ye);
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

                this.lastMouse.x = this.prevMouse.x;
                this.lastMouse.y = this.prevMouse.y;

                this.prevMouse.x = e.clientX;
                this.prevMouse.y = e.clientY;

                this.prevMouse.t = +new Date();
            }

            return MM.cancelEvent(e);
        },

        mouseUp: function(e) {
            MM.removeEvent(document, 'mouseup', this._mouseUp);
            MM.removeEvent(document, 'mousemove', this._mouseMove);

            var angle = Math.atan2(
                this.prevMouse.y - this.lastMouse.y,
                this.prevMouse.x - this.lastMouse.x);

            var speed = ((+new Date()) - this.prevMouse.t) * 1;

            if (isNaN(angle) || speed < 5) return;

            var xDir = Math.min(50, Math.cos(angle) * speed);
            var yDir = Math.min(50, Math.sin(angle) * speed);

            easey.slowPan(this.map, xDir, yDir, speed * 100);
            this.prevMouse = null;
            this.map.parent.style.cursor = '';

            return MM.cancelEvent(e);
        }
    };

    this.easey = easey;
})(this, com.modestmaps);
