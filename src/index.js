var glMatrix = window.glMatrix = require('gl-matrix');
var matrix = window.matrix = glMatrix.mat2d.create();

var invertedMatrix = glMatrix.mat2d.create();
var topLeftCorner = glMatrix.vec2.create();
var bottomRightCorner = glMatrix.vec2.create();

var startPosition = glMatrix.vec2.create();
var position = glMatrix.vec2.create();

var lastDistance = 0;

window.Plot = function Plot(selector, func) {
	this.canvas = document.querySelector(selector);
	this.context = this.canvas.getContext('2d');

	glMatrix.mat2d.translate(matrix, matrix, [this.canvas.width * 0.5, this.canvas.height * 0.5]);
	glMatrix.mat2d.scale(matrix, matrix, [50, -50]);

	var self = this;
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

		self.render();
	});

	this.func = func;

	this.render();
}
Plot.prototype.clear = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
}
Plot.prototype.updateMatrix = function() {
	glMatrix.mat2d.invert(invertedMatrix, matrix);
	glMatrix.vec2.transformMat2d(topLeftCorner, glMatrix.vec2.fromValues(0, 0), invertedMatrix);
	glMatrix.vec2.transformMat2d(bottomRightCorner, glMatrix.vec2.fromValues(this.canvas.width, this.canvas.height), invertedMatrix);
}
Plot.prototype.renderAxis = function() {
	this.context.strokeStyle = "gray";
	this.context.beginPath();
	this.context.moveTo(0, matrix[5]);
	this.context.lineTo(this.canvas.width, matrix[5]);
	this.context.stroke();

	this.context.beginPath();
	this.context.moveTo(matrix[4], 0);
	this.context.lineTo(matrix[4], this.canvas.height);
	this.context.stroke();
};
Plot.prototype.render = function() {
	this.clear();

	this.updateMatrix();
	this.renderAxis();	

	this.context.strokeStyle = "black";
	this.context.beginPath();
	for(var x = topLeftCorner[0]; x < bottomRightCorner[0]; x += 1 / matrix[0]) {
		var p = glMatrix.vec2.fromValues(x, this.func(x));
		glMatrix.vec2.transformMat2d(p, p, matrix);
		this.context.lineTo(p[0], p[1]);
	}
	this.context.stroke();
};