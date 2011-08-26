(function(context, MM) {
    var easey = {},
        i; // the interval!

    var easings = {
        easeIn: function(t) { return t * t; },
        easeOut: function(t) { return Math.sin(t * Math.PI / 2); },
        linear: function(t) { return t; }
    };

    easey.cancel = function() {
        if (i) { window.clearInterval(i); }
    };

    easey.sequence = function(map, steps) {
        for (var i = 0; i < (steps.length - 1); i++) {
            var c = steps[i].callback || function() {};
            steps[i].callback = (function(j, ca) {
                return function() {
                    if (ca) ca();
                    easey.slow(map, steps[j]);
                };
            })(i + 1, c);
        }
        return easey.slow(map, steps[0]);
    };

    easey.slow = function(map, options) {
        if (i) { window.clearInterval(i); }

        var start = (+new Date()),
            startZoom = map.getZoom(),
            startCenter = map.getCenter(),
            startCoordinate = map.coordinate.copy();

        if (typeof options === 'number') {
            options = { zoom: options };
        } else if (options.lat && typeof options.lat === 'number') {
            options = { location: options };
        } else if (options.x && typeof options.x === 'number') {
            options = { coordinate: map.pointCoordinate(options) };
        }

        if (options.point) {
            options.coordinate = map.pointCoordinate(options.point);
        }

        z = options.zoom || startZoom;
        time = options.time || 1000;
        callback = options.callback || function() {};
        ease = easings[options.ease] || easings.easeOut;

        i = window.setInterval(function() {
            // use shift-double-click to zoom out
            var delta = (+new Date()) - start;
            if (delta > time) {
                console.log('done');
                map.setZoom(z);
                window.clearInterval(i);
                return callback();
            }

            var t = ease(delta / time);
            var tz = (z == startZoom) ? z : (startZoom * (1 - t) + z * t);
            if (options.location) {
                map.setCenterZoom(MM.Location.interpolate(startCenter, options.location, t),
                    tz);
            } else if (options.coordinate) {
                var a = startCoordinate.copy().zoomTo(tz);
                var b = options.coordinate.copy().zoomTo(tz);
                map.coordinate = new MM.Coordinate(
                    (a.row * (1 - t)) +    (b.row * t),
                    (a.column * (1 - t)) + (b.column * t),
                    tz);
            }
            map.draw();
        }, 1);
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
                    var map = theHandler.map,
                        point = map.pointLocation(MM.getMousePoint(e, map)),
                        z = map.getZoom() + (e.shiftKey ? -1 : 1);

                    easey.slow(map, {
                        zoom: z,
                        pan: point
                    }, 200);

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
                        var map = theHandler.map,
                            point = map.pointLocation(MM.getMousePoint(e, map)),
                            z = map.getZoom();
                        easey.slow(map, {
                            zoom: z + (delta > 0 ? 1 : -1),
                            pan: point
                        }, 100);

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

            this.lastMouse = MM.getMousePoint(e, this.map);
            this.prevMouse = MM.getMousePoint(e, this.map);
            this.map.parent.style.cursor = 'move';

            return MM.cancelEvent(e);
        },

        mouseMove: function(e) {
            if (this.prevMouse) {
                var nextMouse = MM.getMousePoint(e, this.map);
                this.map.panBy(
                    nextMouse.x - this.prevMouse.x,
                    nextMouse.y - this.prevMouse.y);

                this.lastMouse = new MM.Point(this.prevMouse.x, this.prevMouse.y);
                this.prevMouse = MM.getMousePoint(e, this.map);

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
            var speed = Math.min(Math.log(1 + (distance / ((+new Date()) - this.prevMouse.t))) * 90, 300);

            if (isNaN(angle)) return;

            var center = this.map.coordinatePoint(this.map.coordinate);
            var pan = this.map.pointLocation(new MM.Point(
                center.x + (Math.cos(angle) * speed),
                center.y + (Math.sin(angle) * speed)));

            easey.slow(this.map, {
                pan: pan
            }, speed / 100);
            this.prevMouse = null;
            this.map.parent.style.cursor = '';

            return MM.cancelEvent(e);
        }
    };

    this.easey = easey;
})(this, com.modestmaps);
