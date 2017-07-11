(function (window) {
	window.StaticResourceUtil = Class.extend({
		init: function () {
			this.images = new Object();
		},
		loadImages: function (jsonURL, callback) {
			var self = this,
				xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				var alreadyLoadNumber,
					jsonObj = null,
					image = null,
					i;
				if (this.readyState == 4) {
					if (this.status >= 200 && this.status < 300 || this.status == 304) {
						alreadyLoadNumber = 0;
						jsonObj = JSON.parse(this.responseText);
						for (i = 0; i < jsonObj.images.length; i++) {
							image = new Image();
							image.src = jsonObj.images[i].src;
							image.index = i;
							image.onload = function () {
								alreadyLoadNumber++;
								self.images[jsonObj.images[this.index].name] = this;
								callback(alreadyLoadNumber, jsonObj.images.length, self.images);
							};
						}
					}
				}
			};
			xhr.open('get', jsonURL, true);
			xhr.send(null);
		}
	});
})(window);