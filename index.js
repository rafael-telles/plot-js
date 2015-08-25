window.Plot = function Plot(selector, func) {
	var self = this;

	var canvas = this.canvas = document.querySelector(selector);
	var context = canvas.getContext('2d');
	var clientRect = canvas.getBoundingClientRect();

	this.func = func;

	var scale = 100;
	var dx = canvas.width * 0.5;
	var dy = canvas.height * 0.5;

	var currentX = 0;
	var lastX = 0, lastY = 0;
	var mouseDown = false;

	var lastDistance;

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
		context.font = "10px Arial";
		context.textBaseline = 'middle';
		context.textAlign="center"; 

		var step = Math.pow(2, ~~(Math.log(100 / scale)/Math.log(2))) * scale;

		for(var x = dx % step; x <= canvas.width; x += step) {
			if(x == dx) continue;

			context.fillStyle = 'lightgray';
			context.fillRect(x, 0, 1, canvas.height);
			context.fillStyle = 'black';
			context.fillRect(x, dy - 2, 1, 4);
			
 			context.fillText(((x - dx)/scale).toPrecision(3), x, dy + 10);
		}

		context.textAlign = "right"; 
		for(var y = dy % step; y <= canvas.height; y += step) {
			if(y == dy) continue;

			context.fillStyle = 'lightgray';
			context.fillRect(0, y, canvas.width, 1);
			context.fillStyle = 'black';
			context.fillRect(dx - 2, y, 4, 1);
			
 			context.fillText(((dy - y)/scale).toPrecision(3), dx - 6, y);
		}

		context.fillRect(0, dy, canvas.width, 1);
		context.fillRect(dx, 0, 1, canvas.height);
	}
	function renderTip() {
		context.beginPath();
		context.arc(currentX, -scale * self.func((currentX - dx) / scale) + dy, 3, 0, 2 * Math.PI);
		context.fill();
	}
	function renderCoords() {
		context.textAlign = "left"; 
 		context.fillText('x: ' + (currentX - dx)/scale, 5, 10);
 		context.fillText('y: ' + self.func((currentX - dx) / scale), 5, 22);
	}
	self.render = function render() {
		clear();

		renderAxis();

		context.lineWidth = 1.5;
		context.strokeStyle = 'black';
		context.beginPath();
		for(var x = 0; x < canvas.width; x++) {
			context.lineTo(x, -scale * self.func((x - dx) / scale) + dy);
		}
		context.stroke();

		renderTip();
		renderCoords();
	}
	canvas.addEventListener('mousedown', function(e) {
		mouseDown = true;
		lastX = e.clientX;
		lastY = e.clientY;
	});
	canvas.addEventListener('mouseup', function(e) {
		mouseDown = false;
	})
	canvas.addEventListener('mousemove', function(e) {
		currentX = e.clientX;

		if(mouseDown) {
			dx += e.clientX - lastX;
			dy += e.clientY - lastY;

			lastX = e.clientX;
			lastY = e.clientY;
		}
		
		self.render();
	});
	
	canvas.addEventListener('touchstart', function(e) {
		currentX = lastX = e.touches[0].clientX;
		lastY = e.touches[0].clientY;

		if(e.touches.length == 2) {
			lastDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
		
			var averageX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5;
			var averageY = (e.touches[0].clientY + e.touches[1].clientY) * 0.5;
			
			lastX = averageX;
			lastY = averageY;
		}
	});
	
	canvas.addEventListener('touchmove', function(e) {
		currentX = e.touches[0].clientX;

		if(e.touches.length == 2) {
			var distance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
			var multiplier = distance / lastDistance;

			var averageX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5;
			var averageY = (e.touches[0].clientY + e.touches[1].clientY) * 0.5;
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

	canvas.addEventListener('touchend', function(e) {
		if(e.touches.length == 1) {
			lastX = e.touches[0].clientX;
			lastY = e.touches[0].clientY;
		}
	});

	canvas.addEventListener('wheel', function(e) {
		var multiplier = 0.9;
		if(e.deltaY < 0) {
			multiplier = 1.1;
		}
		zoom(multiplier, e.clientX - clientRect.left, e.clientY - clientRect.top);
		self.render();
	});

	self.render();
};