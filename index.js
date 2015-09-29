window.Plot = function Plot(selector, f) {
  'use strict';

  this.f = f;
  var self = this,
    canvas = this.canvas = document.querySelector(selector),
    context = canvas.getContext('2d'),
    clientRect = canvas.getBoundingClientRect(),

    scale = 100,
    dx = canvas.width * 0.5,
    dy = canvas.height * 0.5,

    currentX = 0,
    lastX = 0,

    lastY = 0,
    mouseDown = false,

    lastDistance;

  context.lineCap = 'round';

  function zoom(multiplier, x, y) {
    scale *= multiplier;
    dx = (dx - x) * multiplier + x;
    dy = (dy - y) * multiplier + y;
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function renderAxis() {
    var x,
      y,
      step = Math.pow(2, (Math.log(100 / scale) / Math.log(2)) | 0) * scale;

    context.font = '10px Arial';
    context.textBaseline = 'middle';
    context.textAlign = 'center';

    for (x = dx % step; x <= canvas.width; x += step) {
      context.fillStyle = 'lightgray';
      context.fillRect(x, 0, 1, canvas.height);
      context.fillStyle = 'black';
      context.fillRect(x, dy - 2, 1, 4);

      if (Math.abs(x - dx) >= step) {
        context.fillText(((x - dx) / scale).toPrecision(3), x, dy + 10);
      }
    }

    context.textAlign = 'right';
    for (y = dy % step; y <= canvas.height; y += step) {
      context.fillStyle = 'lightgray';
      context.fillRect(0, y, canvas.width, 1);
      context.fillStyle = 'black';
      context.fillRect(dx - 2, y, 4, 1);

      if (Math.abs(y - dy) >= step) {
        context.fillText(((dy - y) / scale).toPrecision(3), dx - 6, y);
      }
    }

    context.fillRect(0, dy, canvas.width, 1);
    context.fillRect(dx, 0, 1, canvas.height);
  }

  function renderTip() {
    context.beginPath();
    context.arc(currentX, -scale * self.f((currentX - dx) / scale) + dy, 3, 0, 2 * Math.PI);
    context.fill();
  }

  function renderCoords() {
    context.textAlign = 'left';
    context.fillText('x: ' + (currentX - dx) / scale, 5, 10);
    context.fillText('y: ' + self.f((currentX - dx) / scale), 5, 22);
  }
  self.render = function render() {
    var x;

    clear();

    renderAxis();

    context.lineWidth = 1.5;
    context.strokeStyle = 'black';
    context.beginPath();
    for (x = 0; x < canvas.width; x += 1) {
      context.lineTo(x, -scale * self.f((x - dx) / scale) + dy);
    }
    context.stroke();

    renderTip();
    renderCoords();
  };
  self.reset = function reset() {
    scale = 100;
    dx = canvas.width * 0.5;
    dy = canvas.height * 0.5;
  };

  canvas.addEventListener('mousedown', function (e) {
    mouseDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  canvas.addEventListener('mouseup', function (e) {
    mouseDown = false;
  });
  canvas.addEventListener('mousemove', function (e) {
    currentX = e.clientX;

    if (mouseDown) {
      dx += e.clientX - lastX;
      dy += e.clientY - lastY;

      lastX = e.clientX;
      lastY = e.clientY;
    }

    self.render();
  });

  canvas.addEventListener('touchstart', function (e) {
    currentX = lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;

    if (e.touches.length === 2) {
      lastDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));

      var averageX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5,
        averageY = (e.touches[0].clientY + e.touches[1].clientY) * 0.5;

      lastX = averageX;
      lastY = averageY;
    }
  });

  canvas.addEventListener('touchmove', function (e) {
    currentX = e.touches[0].clientX;

    if (e.touches.length === 2) {
      var distance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)),
        multiplier = distance / lastDistance,
        averageX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5,
        averageY = (e.touches[0].clientY + e.touches[1].clientY) * 0.5;
      zoom(multiplier, averageX, averageY);

      lastDistance = distance;

      dx += averageX - lastX;
      dy += averageY - lastY;

      lastX = averageX;
      lastY = averageY;
    } else {
      dx += e.touches[0].clientX - lastX;
      dy += e.touches[0].clientY - lastY;

      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }

    self.render();
  });

  canvas.addEventListener('touchend', function (e) {
    if (e.touches.length === 1) {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener('wheel', function (e) {
    var multiplier = 0.9;
    if (e.deltaY < 0) {
      multiplier = 1.1;
    }
    zoom(multiplier, e.clientX - clientRect.left, e.clientY - clientRect.top);
    self.render();
  });

  self.render();
};