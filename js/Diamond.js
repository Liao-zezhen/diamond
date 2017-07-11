(function (window) {
	window.Diamond = Class.extend({
		init: function (row, col, color) {
			this.row = row;
			this.col = col;
			this.color = color;
			this.x = 25 + this.col * 80;
			this.y = 238 + this.row * 80;
			this.dX = 0;
			this.dY = 0;

			this.bombing = false;
			this.bombAnimate = 0;
		},
		update: function () {
			this.x += this.dX;
			this.y += this.dY;

			if (this.bombing && this.bombAnimate < 5 && game.frameUtil.currentFrame % 2 == 0) {
				this.bombAnimate++;
			}
		},
		render: function () {
			if (!this.bombing) {
				game.ctx.drawImage(game.images['diamond' + this.color], this.x, this.y);
			} else {
				game.ctx.drawImage(game.images['bomb' + this.bombAnimate], this.x - 20, this.y - 19);
			}
		},
		moveTo: function (row, col) {
			var targetX = 25 + col * 80;
			var targetY = 238 + row * 80;

			this.dX = (targetX - this.x) / 10;
			this.dY = (targetY - this.y) / 10;

			var self = this;
			game.frameUtil.orderDoSomethingFrameLater(10, function () {
				self.stop();
			});
		},
		stop: function () {
			this.dX = 0;
			this.dY = 0;
		},
		bomb: function () {
			this.bombing = true;
		}
	});
})(window);