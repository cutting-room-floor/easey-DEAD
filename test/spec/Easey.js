describe("Easey", function() {
  
  function Receiver() { }
  Receiver.prototype.receive = function() { };

  var map, sink;

  beforeEach(function() {
    sink = new Receiver();
    var map_div = document.createElement('div');
    map = new MM.Map(map_div, new MM.TemplatedLayer('http://b.tile.openstreetmap.org/{Z}/{X}/{Y}.png'));
  });

  it('assigns the map var correctly', function() {
    var ease = easey();
    ease.map(map);
    expect(ease.map()).toEqual(map);
  });

  it('automatically sets to and from', function() {
    var ease = easey();
    ease.map(map);
    expect(ease.from()).toEqual(map.coordinate);
    expect(ease.to()).toEqual(map.coordinate);
  });

  it('zooms the to coordinate with zoom()', function() {
    var ease = easey();
    ease.map(map);
    ease.zoom(10);
    expect(ease.to().zoom).toEqual(10);
  });

  it('correctly interpolates between two coordinates', function() {
    easey().map(map)
      .from(new MM.Coordinate(0, 10, 0))
      .to(new MM.Coordinate(0, 0, 0))
      .easing('linear')
      .t(0.5);

    expect(map.coordinate.column).toEqual(5);
    expect(map.coordinate.row).toEqual(0);
    expect(map.coordinate.zoom).toEqual(0);
  });

  it('predicts the future correctly', function() {
    var ease = easey();
    ease.map(map).from(new MM.Coordinate(0, 10, 0))
      .to(new MM.Coordinate(0, 0, 0));
    var future = ease.future(10);
    expect(future.length).toEqual(10);
    expect(future[0].column).toEqual(10);
    expect(future[9].column).toEqual(0);
  });

  it('moves the map quickly', function() {
    var ease = easey();
    ease.map(map).from(new MM.Coordinate(0, 10, 0))
      .to(new MM.Coordinate(0, 0, 0));
    runs(function() {
      ease.run(10);
    });
    waits(200);
    runs(function() {
      expect(map.coordinate.column).toEqual(0);
      expect(map.coordinate.row).toEqual(0);
      expect(map.coordinate.zoom).toEqual(0);
    });
  });

  it('calls a callback after finishing an ease', function() {
    var ease = easey();
    ease.map(map).from(new MM.Coordinate(0, 10, 0))
      .to(new MM.Coordinate(0, 0, 0));
    spyOn(sink, 'receive');
    runs(function() {
      ease.run(10, sink.receive);
    });
    waits(200);
    runs(function() {
      expect(sink.receive).toHaveBeenCalledWith(map);
    });
  });
});
