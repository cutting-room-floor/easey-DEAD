easey.BraidHandler = function() {
    var handler = {},
        map,
        _zoomDiv,
        t = false,
        ea = easey(),
        prevTime,
        history = [],
        precise = false;

    function toggle(e) {
        t = e.shiftKey;
    }

    function mouseWheel(e) {
        var delta = 0;
        prevTime = prevTime || new Date().getTime();

        try {
            _zoomDiv.scrollTop = 1000;
            _zoomDiv.dispatchEvent(e);
            delta = 1000 - _zoomDiv.scrollTop;
        } catch (error) {
            delta = e.wheelDelta || (-e.detail * 5);
        }

        // limit mousewheeling to once every 200ms
        var timeSince = new Date().getTime() - prevTime;
        var point = MM.getMousePoint(e, map);

        if (Math.abs(delta) > 0 && (timeSince > 200) && !precise) {
            prevTime = new Date().getTime();
            if (!t) {
              map.zoomByAbout(delta > 0 ? 1 : -1, point);
            }
        }
        if (t && history.length && (timeSince > 50)) {
          map.coordinate = history.pop();
          map.draw();
        }

        // Cancel the event so that the page doesn't scroll
        return MM.cancelEvent(e);
    }

    handler.init = function(x) {
        map = x;
        _zoomDiv = document.body.appendChild(document.createElement('div'));
        _zoomDiv.style.cssText = 'visibility:hidden;top:0;height:0;width:0;overflow-y:scroll';
        var innerDiv = _zoomDiv.appendChild(document.createElement('div'));
        innerDiv.style.height = '2000px';
        MM.addEvent(map.parent, 'mousewheel', mouseWheel);
        MM.addEvent(document, 'keydown', toggle);
        MM.addEvent(document, 'keyup', toggle);

        function addhistory(m) {
          history.push(m.coordinate.copy());
          if (history.length > 10000) {
            history.shift();
          }
        }

        map.addCallback('panned', addhistory);
        map.addCallback('zoomed', addhistory);

        return handler;
    };

    handler.precise = function(x) {
        if (!arguments.length) return precise;
        precise = x;
        return handler;
    };

    handler.remove = function() {
        MM.removeEvent(map.parent, 'mousewheel', mouseWheel);
        _zoomDiv.parentNode.removeChild(_zoomDiv);
    };

    return handler;
};
