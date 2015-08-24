window.Plot = function Plot(selector, func) {
	var canvas = this.canvas = document.querySelector(selector);
	var context = this.canvas.getContext('2d');

	var func = this.func = func;

	var scale = 50;
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

		var coef = Math.pow(0.1, ~~(Math.log10(scale)) - 1);
		var step = coef * ([5,2,1][~~(3 * Math.log10(scale)) % 3]) * scale;

		context.strokeStyle = 'lightgray';

		for(var x = dx % step; x <= canvas.width; x += step) {
			if(x == dx) continue;
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(x, dy - 5);
			context.lineTo(x, dy + 5);
			context.stroke();
			
 			context.fillText(((x - dx)/scale).toFixed(4), x, dy + 8);

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
			
 			context.fillText(((y - dy)/scale).toFixed(4), dx - 4, y);

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
			context.lineTo(x, scale * func((x - dx) / scale) + dy);
		}
		context.stroke();
	}
	
	var startTouchX, startTouchY;
	this.canvas.addEventListener('touchstart', function(e) {
		startTouchX = dx - e.touches[0].clientX;
		startTouchY = dy - e.touches[0].clientY;

		if(e.touches.length === 2) {
			lastDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
		}
	});
	
	this.canvas.addEventListener('touchmove', function(e) {
		dx = e.touches[0].clientX + startTouchX;
		dy = e.touches[0].clientY + startTouchY;
		
		if(e.touches.length === 2) {
			var distance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
			var multiplier = distance / lastDistance;

			zoom(multiplier, e.x, e.y);

			lastDistance = distance;
		}

		render();
	});

	this.canvas.addEventListener('mousewheel', function(e) {
		var multiplier = 0.9;
		if(e.wheelDelta > 0) {
			multiplier = 1.1;
		}

		zoom(multiplier, e.x, e.y);
		render();
	});
	

	render();
};