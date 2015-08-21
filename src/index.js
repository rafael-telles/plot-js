var glMatrix = window.glMatrix = require('gl-matrix');

window.Plot = function Plot(selector, func) {
	var matrix = glMatrix.mat2d.create();
	var invertedMatrix = glMatrix.mat2d.create();
	var topLeftCorner = glMatrix.vec2.create();
	var bottomRightCorner = glMatrix.vec2.create();

	var startPosition = glMatrix.vec2.create();
	var position = glMatrix.vec2.create();

	var lastDistance = 0;

	var canvas = this.canvas = document.querySelector(selector);
	var context = this.canvas.getContext('2d');

	var func = this.func = func;

	glMatrix.mat2d.translate(matrix, matrix, [this.canvas.width * 0.5, this.canvas.height * 0.5]);
	glMatrix.mat2d.scale(matrix, matrix, [50, -50]);

	context.lineCap = 'round';

	var self = this;

	function clear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	function updateMatrix() {
		glMatrix.mat2d.invert(invertedMatrix, matrix);
		glMatrix.vec2.transformMat2d(topLeftCorner, glMatrix.vec2.fromValues(0, 0), invertedMatrix);
		glMatrix.vec2.transformMat2d(bottomRightCorner, glMatrix.vec2.fromValues(canvas.width, canvas.height), invertedMatrix);
	}
	function renderAxis() {
		context.lineWidth = 1;
		context.strokeStyle = 'gray';

		context.beginPath();
		context.moveTo(0, matrix[5]);
		context.lineTo(canvas.width, matrix[5]);
		context.stroke();

		context.beginPath();
		context.moveTo(matrix[4], 0);
		context.lineTo(matrix[4], canvas.height);
		context.stroke();

		for(var x = matrix[4] % matrix[0]; x < canvas.width; x += matrix[0]) {
			context.beginPath();
			context.moveTo(x, matrix[5] - 5);
			context.lineTo(x, matrix[5] + 5);
			context.stroke();
		}

		for(var y = matrix[5] % matrix[0]; y < canvas.height; y += matrix[0]) {
			context.beginPath();
			context.moveTo(matrix[4] - 5, y);
			context.lineTo(matrix[4] + 5, y);
			context.stroke();
		}
	}
	function render() {
		clear();

		updateMatrix();
		renderAxis();	

		context.lineWidth = 2;
		context.strokeStyle = "black";
		context.beginPath();
		for(var x = topLeftCorner[0]; x < bottomRightCorner[0]; x += 1 / matrix[0]) {
			var p = glMatrix.vec2.fromValues(x, func(x));
			glMatrix.vec2.transformMat2d(p, p, matrix);
			context.lineTo(p[0], p[1]);
		}
		context.stroke();
	}

	this.canvas.addEventListener('touchstart', function(e) {
		position[0] = matrix[4];
		position[1] = matrix[5];
		startPosition[0] = e.touches[0].clientX;
		startPosition[1] = e.touches[0].clientY;

		if(e.touches.length === 2) {
			lastDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
		}
	});

	this.canvas.addEventListener('touchmove', function(e) {
		matrix[4] = position[0] + e.touches[0].clientX - startPosition[0];
		matrix[5] = position[1] + e.touches[0].clientY - startPosition[1];
		
		if(e.touches.length === 2) {
			var distance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2));
			glMatrix.mat2d.scale(matrix, matrix, [distance / lastDistance, distance / lastDistance]);

			lastDistance = distance;
		}

		render();
	});

	render();
};