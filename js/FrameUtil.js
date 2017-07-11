(function (window) {
	window.FrameUtil = Class.extend({
		init: function () {
			this.currentFrame = 0;
			this.sTime = new Date();
			this.sFrame = 0;
			this.realFps = 0;

			this.appointment = [];
		},
		update: function () {
			var i, t = new Date();
			this.currentFrame++;
			if (t - this.sTime >= 1000) {
				this.realFps = this.currentFrame - this.sFrame;
				this.sFrame = this.currentFrame;
				this.sTime = t;
			}
			for (i = 0; i < this.appointment.length; i++) {
				if (this.currentFrame == this.appointment[i].frame) {
					this.appointment[i].fn();
					this.appointment.splice(i, 1);
					i--;
				}
			}
		},
		orderDoSomethingFrameLater: function (frameNum, fn) {
			this.appointment.push({
				frame: this.currentFrame + frameNum,
				fn: fn
			});
		}
	});
})(window);