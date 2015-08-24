window.Plot = function Plot(selector, func) {
	var canvas = this.canvas = document.querySelector(selector);
	var context = canvas.getContext('2d');
	var clientRect = canvas.getBoundingClientRect();

	var func = this.func = func;

	var scale = 100;
	var dx = canvas.width * 0.5;
	var dy = canvas.height * 0.5;

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
		context.font = "10px sans";
		context.textBaseline = 'middle';
		context.textAlign="center"; 

		var step = Math.pow(2, ~~(Math.log(100 / scale)/Math.log(2))) * scale;

		context.strokeStyle = 'lightgray';

		for(var x = dx % step; x <= canvas.width; x += step) {
			if(x == dx) continue;
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(x, dy - 5);
			context.lineTo(x, dy + 5);
			context.stroke();
			
 			context.fillText(((x - dx)/scale).toFixed(2), x, dy + 8);

			context.lineWidth = 0.5;
 			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, canvas.height);
			context.stroke();
		}

		context.textAlign = "right"; 
		for(var y = dy % step; y <= canvas.height; y += step) {
			if(y == dy) continue;

			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(dx - 5, y);
			context.lineTo(dx + 5, y);
			context.stroke();
			
 			context.fillText(((dy - y)/scale).toFixed(2), dx - 4, y);

			context.lineWidth = 0.5;
 			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(canvas.width, y);
			context.stroke();
		}

		context.lineWidth = 1;
		context.strokeStyle = 'gray';

		context.beginPath();
		context.moveTo(0, dy);
		context.lineTo(canvas.width, dy);
		context.stroke();

		context.beginPath();
		context.moveTo(dx, 0);
		context.lineTo(dx, canvas.height);
		context.stroke();
	}
	function render() {
		clear();

		renderAxis();

		context.lineWidth = 2;
		context.strokeStyle = "black";
		context.beginPath();
		for(var x = 0; x < canvas.width; x++) {
			context.lineTo(x, -scale * func((x - dx) / scale) + dy);
		}
		context.stroke();
	}

	var lastX = 0, lastY = 0;
	var mouseDown = false;
	canvas.addEventListener('mousedown', function(e) {
		mouseDown = true;
		lastX = e.clientX;
		lastY = e.clientY;
	});
	canvas.addEventListener('mouseup', function(e) {
		mouseDown = false;
	})
	canvas.addEventListener('mousemove', function(e) {
		if(mouseDown) {
			dx += e.clientX - lastX;
			dy += e.clientY - lastY;

			lastX = e.clientX;
			lastY = e.clientY;
			render();
		}
	});
	
	var lastDistance;
	canvas.addEventListener('touchstart', function(e) {
		lastX = e.touches[0].clientX;
		lastY = e.touches[0].clientY;

		if(e.touches.length >= 2) {
			lastDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
		}
	});
	
	canvas.addEventListener('touchmove', function(e) {
		if(e.touches.length >= 2) {
			var distance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
			var multiplier = distance / lastDistance;

			zoom(multiplier, (e.touches[0].clientX + e.touches[1].clientX) * 0.5, (e.touches[0].clientY + e.touches[1].clientY) * 0.5);

			lastDistance = distance;
		} else {
			dx += e.touches[0].clientX - lastX;
			dy += e.touches[0].clientY - lastY;

			lastX = e.touches[0].clientX;
			lastY = e.touches[0].clientY;
		}

		render();
	});

	canvas.addEventListener('touchend', function(e) {
		if(e.touches.length >= 1) {
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
		render();
	});
	

	render();
};