(function(context, MM) {
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
                    point = MM.getMousePoint(e, map),
                    z = map.getZoom() + (e.shiftKey ? -1 : 1);

                    easey.slow(map, {
                        zoom: z,
                        about: point,
                        time: 100
                    });

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

                    var timeSince = new Date().getTime() - prevTime;

                    if (Math.abs(delta) > 0 && (timeSince > 50)) {

                        if (easey.running()) {
                          easey.set({
                            time:200,
                            zoom:z + (delta > 0 ? 1 : -1)
                          });
                        } else {
                          var map = theHandler.map,
                          point = MM.getMousePoint(e, map),
                          z = map.getZoom();
                          easey.slow(map, {
                              zoom: z + (delta > 0 ? 1 : -1),
                              about: point,
                              ease: 'linear',
                              time:200
                          });
                        }

                        prevTime = new Date().getTime();
                    }

                    // Cancel the event so that the page doesn't scroll
                    return MM.cancelEvent(e);
                };
            }
            return this.mouseWheelHandler;
        }
    };

    easey.DragHandler = function() { };

    easey.DragHandler.prototype = {
        init: function(map) {
            var prevT = 0,
                acceleration = 25.0,
                speed = null,
                drag = 0.10,
                minSpeed = 0.08,
                lastMove = null,
                mouseDownPoint = null,
                mousePoint = null,
                mouseDownTime = 0;

            function mouseDown(e) {
                mousePoint = prevMousePoint = MM.getMousePoint(e, map);
                return MM.cancelEvent(e);
            }

            function mouseMove(e) {
                if (mousePoint) {
                    prevMousePoint = mousePoint;
                    mousePoint = MM.getMousePoint(e, map);
                    lastMove = +new Date();
                    return MM.cancelEvent(e);
                }
            }

            function mouseUp(e) {
                mousePoint = prevMousePoint = null;
                return MM.cancelEvent(e);
            }

            function animate(t) {
                var dir = { x: 0, y: 0 };

                var dt = Math.max(0.001,(t - prevT) / 1000.0);
                if (dir.x || dir.y) {
                    var len = Math.sqrt(dir.x*dir.x + dir.y*dir.y);
                    dir.x /= len;
                    dir.y /= len;
                    this.speed.x += dir.x * acceleration * dt;
                    this.speed.y += dir.y * acceleration * dt;
                }
                else if (mousePoint && prevMousePoint && (lastMove > (+new Date() - 50))) {
                    dir.x = mousePoint.x - prevMousePoint.x;
                    dir.y = mousePoint.y - prevMousePoint.y;
                    speed.x = dir.x;
                    speed.y = dir.y;
                } else {
                    speed.x -= speed.x * drag;
                    speed.y -= speed.y * drag;
                    if (Math.abs(speed.x) < 0.001) {
                        speed.x = 0;
                    }
                    if (Math.abs(speed.y) < 0.001) {
                        speed.y = 0;
                    }
                }
                // if (Math.abs(speed.x) < minSpeed) speed.x = 0;
                // if (Math.abs(speed.y) < minSpeed) speed.y = 0;
                if (speed.x || speed.y) {
                    map.panBy(speed.x, speed.y);
                }
                prevT = t;
                // tick every frame for time-based anim accuracy
                MM.getFrame(animate);
            }

            MM.addEvent(map.parent, 'click', function(e) {
              map.parent.focus();
            });
            MM.addEvent(map.parent, 'mousedown', mouseDown);
            MM.addEvent(map.parent, 'mousemove', mouseMove);
            MM.addEvent(map.parent, 'mouseup', mouseUp);
            // tick every frame for time-based anim
            prevT = new Date().getTime();
            speed = { x: 0, y: 0 };
            MM.getFrame(animate);
        }
    };

})(this, com.modestmaps);
