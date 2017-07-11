(function (window) {
	window.Map = Class.extend({
		init: function () {
			this.airscape = [
				[2, 2, 3, 1, 1],
				[3, 3, 1, 2, 2],
				[2, 2, 3, 1, 3],
				[2, 3, 3, 2, 1],
				[3, 1, 0, 1, 0],
				[3, 3, 0, 2, 1]
			];
			this.diamondArray = [
				[null, null, null, null, null],
				[null, null, null, null, null],
				[null, null, null, null, null],
				[null, null, null, null, null],
				[null, null, null, null, null],
				[null, null, null, null, null]
			];
			this.updateDiamondByAirscape();
			this.bindListener();
		},
		updateDiamondByAirscape: function () {
			var r, c, item;
			for (r = 0; r < 6; r++) {
				for (c = 0; c < 5; c++) {
					item = this.airscape[r][c];
					this.diamondArray[r][c] = isNaN(item) ? null : new Diamond(r, c, this.airscape[r][c]);
				}
			}
		},
		renderAllDiamond: function () {
			var r, c;
			for (r = 0; r < 6; r++) {
				for (c = 0; c < 5; c++) {
					this.diamondArray[r][c] && this.diamondArray[r][c].update();
					this.diamondArray[r][c] && this.diamondArray[r][c].render();
				}
			}
		},
		swap: function (sourceRow, sourceCol, targetRow, targetCol) {
			var self = this;
			if (sourceRow >= 0 && sourceRow <= 5 && sourceCol >= 0 && sourceCol <= 4) {
				if (targetRow >= 0 && targetRow <= 5 && targetCol >=0 && targetCol <= 4) {
					this.diamondArray[sourceRow][sourceCol].moveTo(targetRow, targetCol);
					this.diamondArray[targetRow][targetCol].moveTo(sourceRow, sourceCol);
					game.frameUtil.orderDoSomethingFrameLater(10, function () {
						var item;
						item = self.airscape[targetRow][targetCol];
						self.airscape[targetRow][targetCol] = self.airscape[sourceRow][sourceCol];
						self.airscape[sourceRow][sourceCol] = item;
						if (self.check().length > 0) {
							self.updateDiamondByAirscape();
							game.state = 'B';
						} else {
							self.diamondArray[sourceRow][sourceCol].moveTo(sourceRow, sourceCol);
							self.diamondArray[targetRow][targetCol].moveTo(targetRow, targetCol);
							game.frameUtil.orderDoSomethingFrameLater(10, function () {		
								item = self.airscape[targetRow][targetCol];
								self.airscape[targetRow][targetCol] = self.airscape[sourceRow][sourceCol];
								self.airscape[sourceRow][sourceCol] = item;
								self.updateDiamondByAirscape();
							});
						}

					});
				}
			}
		},
		bindListener: function () {
			var self = this;
			var target = {};
			var source = {};
			var startPoint = {};
			var lock = false;
			var isTouch = false;
			game.canvas.addEventListener(game.down, function (e) {
				if (game.state != 'A') return;
				isTouch = true;
				e.preventDefault();
				startPoint.x = (game.ua ? e.changedTouches[0].pageX : e.pageX) - game.canvas.offsetLeft;
				startPoint.y = game.ua ? e.changedTouches[0].pageY : e.pageY;
				source.row = parseInt((startPoint.y - game.heightScale * 238) / (game.heightScale * 80));
				source.col = parseInt((startPoint.x - game.widthScale * 25) / (game.widthScale * 80));

				game.canvas.addEventListener(game.move, moveHandle);
				game.canvas.addEventListener(game.up, upHandle);
			});
			function moveHandle(e) {
				if (!isTouch) return;
				if (lock) return;
				if (game.state != 'A') return;
				var dis = {};
				dis.x = (game.ua ? e.changedTouches[0].pageX : e.pageX) - game.canvas.offsetLeft - startPoint.x;
				dis.y = (game.ua ? e.changedTouches[0].pageY : e.pageY) - startPoint.y;
				if (dis.x < -30) { // 向左边移动
					target.row = source.row;
					target.col = source.col - 1;
					self.swap(source.row, source.col, target.row, target.col);
					lock = true;
				} else if (dis.x > 30) { // 向右边移动
					target.row = source.row;
					target.col = source.col + 1;
					self.swap(source.row, source.col, target.row, target.col);
					lock = true;
				} else if (dis.y < -30) { // 向上边移动
					target.row = source.row - 1;
					target.col = source.col;
					self.swap(source.row, source.col, target.row, target.col);
					lock = true;
				} else if (dis.y > 30) { // 向下边移动
					target.row = source.row + 1;
					target.col = source.col;
					self.swap(source.row, source.col, target.row, target.col);
					lock = true;
				}
			}
			function upHandle() {
				lock = false;
				isTouch = false;
				game.canvas.removeEventListener('mousemove', moveHandle);
				game.canvas.removeEventListener('mouseup', upHandle);
			}
		},
		check: function () {
			var canBeBomb = [];
			var r, c, start, end, i;

			for (r = 0; r < 6; r++) {
				start = 0;
				end = 0;
				for (c = 1; c < 5; c++) {
					if (this.airscape[r][start] == this.airscape[r][c]) {
						end = c;
					} else {
						start = c;
					}
					if (end - start >= 2) {
						for (i = start; i <= end; i++) {
							canBeBomb.push(this.diamondArray[r][i]);
						}
					}
				}
			}

			for (c = 0; c < 5; c++) {
				start = 0;
				end = 0;
				for (r = 1; r < 6; r++) {
					if (this.airscape[start][c] == this.airscape[r][c]) {
						end = r;
					} else {
						start = r;
					}
					if (end - start >= 2) {
						for (i = start; i <= end; i++) {
							canBeBomb.push(this.diamondArray[i][c]);
						}
					}
				}
			}

			return unique(canBeBomb);

		}
	});
	function unique(arr) {
		for (i = 0; i < arr.length; i++) {
			for (j = i + 1; j < arr.length; j++) {
				if (arr[i] == arr[j]) {
					arr.splice(j, 1);
					j--;
				}
			}
		}
		return arr;
	}
})(window);