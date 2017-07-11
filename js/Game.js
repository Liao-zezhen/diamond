(function (window) {
	window.Game = Class.extend({
		init: function (params) {
			var self = this;

			// A表示静默，等待用户操作。
			// B表示进行消除判断。
			// C表示能消除，进行消除动画，元素下落，补新的元素。
			this.state = 'B';

			this.canvas = document.getElementById(params.canvasId);
			this.ctx = this.canvas.getContext('2d');
			this.fps = params.fps;
			this.timer = null;

			this.ua = /(iPhone|iPad|iPod|Android|ios)/i.test(navigator.userAgent);
			this.down = this.ua ? 'touchstart' : 'mousedown';
			this.move = this.ua ? 'touchmove' : 'mousemove';
			this.up = this.ua ? 'touchend' : 'mouseup';

			// 静态资源管理。
			this.sr = new StaticResourceUtil();
			this.sr.loadImages('./r.json', function (alreadyLoadNum, allNum, imagesObj) {
				self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
				self.ctx.fillStyle = '#fff';
				self.ctx.fillText(alreadyLoadNum + 'of ' + allNum, 230, 30);
				if (alreadyLoadNum == allNum) {
					self.images = imagesObj;
					// 加载完静态资源后执行程序。
					self.run();
				}
			});
		},
		run: function () {
			var self = this;
			// 帧工具类。
			this.frameUtil = new FrameUtil();

			this.map = new Map();

			self.widthScale = parseInt(getComputedStyle(this.canvas, false).width) / 450;
			self.heightScale = parseInt(getComputedStyle(this.canvas, false).height) / 800;
			window.onresize = function () {
				self.widthScale = parseInt(getComputedStyle(this.canvas, false).width) / 450;
				self.heightScale = parseInt(getComputedStyle(this.canvas, false).height) / 800;
			}

			// 开启主程序。
			this.timer = setInterval(function () {
				self.mainLoop();
			}, 1000 / this.fps);
		},
		// 主程序。
		mainLoop: function () {
			var canBeBomb = null, i, self = this;
			this.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

			// 更新和绘制帧率和帧数。
			this.frameUtil.update();
			this.ctx.fillStyle = '#fff';
			this.ctx.fillText('FPS / ' + this.frameUtil.realFps, 360, 760);
			this.ctx.fillText('FNO / ' + this.frameUtil.currentFrame, 360, 780);

			this.map.renderAllDiamond();

			if (this.state == 'B') {
				canBeBomb = this.map.check();
				if (canBeBomb.length) {
					this.state = 'C';

					for (i = 0; i < canBeBomb.length; i++) {
						canBeBomb[i].bomb();
					}

					this.frameUtil.orderDoSomethingFrameLater(12, function () {
						var item = null, r, c, downRowNmber, i, newAirscape;
						for (i = 0; i < canBeBomb.length; i++) {
							item = canBeBomb[i];
							self.map.diamondArray[item.row][item.col] = null;
							self.map.airscape[item.row][item.col] = NaN;
						}
						newAirscape = [
							[NaN, NaN, NaN, NaN, NaN],
							[NaN, NaN, NaN, NaN, NaN],
							[NaN, NaN, NaN, NaN, NaN],
							[NaN, NaN, NaN, NaN, NaN],
							[NaN, NaN, NaN, NaN, NaN],
							[NaN, NaN, NaN, NaN, NaN]
						];
						for (r = 0; r < 6; r++) {
							for (c = 0; c < 5; c++) {
								// 计算当前元素当前列下面有多少空。
								downRowNmber = 0;
								for (i = r + 1; i < 6; i++) {
									if (isNaN(self.map.airscape[i][c])) {
										downRowNmber++;
									}
								}
								item = self.map.diamondArray[r][c];
								item && item.moveTo(r + downRowNmber, c);
								item && (newAirscape[r + downRowNmber][c] = item.color);
							}
						}

						self.map.airscape = newAirscape;

					});

					this.frameUtil.orderDoSomethingFrameLater(22, function () {
						var r, c, color;
						self.map.updateDiamondByAirscape();

						for (r = 0; r < 6; r++) {
							for (c = 0; c < 5; c++) {
								color = Math.round(Math.random() * 3);
								if (isNaN(self.map.airscape[r][c])) {
									self.map.diamondArray[r][c] = new Diamond(-3, c, color);
									self.map.airscape[r][c] = color;
									self.map.diamondArray[r][c].moveTo(r, c);
								}
							}
						}

						self.frameUtil.orderDoSomethingFrameLater(10, function () {
							self.map.updateDiamondByAirscape();
							self.state = 'B';
						});

					});

				} else {
					this.state = 'A';
				}
			}

		},
		stop: function () {
			clearInterval(this.timer);
		}
	});
})(window);