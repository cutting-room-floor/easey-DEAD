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

    easey.cancel = function() {
        if (i) { window.clearInterval(i); }
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

    this.easey = easey;
})(this, com.modestmaps);
