DOT_RADIUS = 8;

var COLORS = [
	'red',
	'orange',
	'green',
	'cyan',
	'blue',
	'purple'
];

var colorCounter = 0;

String.prototype.hashCode = function() {
	var hash = 0,
		i, chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

function getColor() {
	return COLORS[colorCounter++];
}

/**
 * A map on which to render beacons
 * @constructor
 * 
 * @param floors a list of BeaconFloor objects
 * @param beacons the list of beacons
 **/
function BeaconMap(floors, beacons) {
	var beaconMap = this;
	this.canvas = canvas;
	this.floors = floors;
	this.beacons = beacons;
	this.currentFloor = floors[0];

	this.render = function(canvas) {
		var context = canvas.getContext('2d');
		currentFloor.render(context);
		//any additional chrome goes here
	};

	return this;
}

/**
 * Represents the floor of a building
 * @constructor
 * @param floorName
 * @param image
 * @param rect the area covered by this floor (relative to beacons)
 * @param beacons the list of beacons
 */
function BeaconFloor(floorName, image, rect, beacons) {
	this.floorName = floorName;
	this.image = image;
	this.rect = rect;
	this.beacons = beacons;

	//Stores the locations each beacon was last rendered at by uid
	this.beaconLocations = {};

	this.render = function(context) {
		context.save();
		var width = context.canvas.width;
		var height = context.canvas.height;
		context.drawImage(this.image, 0, 0, width, height);

		//clear beacon locations
		beaconLocations = {};

		//Because there are a finite number of recievers, some beacons will have
		//identical locations.  Group these
		var locations = {};
		for (var i = 0; i < beacons.length; i++) {
			var key = JSON.stringify({
				x: beacons[i].x,
				y: beacons[i].y
			});
			if (!locations[key]) {
				locations[key] = [beacons[i]];
			} else {
				locations[key].push(beacons[i]);
			}
		}

		//Now, render the beacons at each location
		var colorCounter;
		for (var k = 0; k < Object.keys(locations); k++) {
			var key = Object.keys(locations)[k];
			var localBeacons = locations[key];
			if (localBeacons.length == 1) {
				var x = (localBeacons[0].x - this.rect.x) * width / this.rect.width;
				var y = (localBeacons[0].y - this.rect.y) * height / this.rect.height;
				context.beginPath();
				context.ellipse(x, y, DOT_RADIUS, DOT_RADIUS, 0, 0, Math.PI * 2, false);
				context.fillStyle = COLORS[localBeacons[0].name.hashCode() % COLORS.length];
				context.fill();
				beaconLocations[localBeacons[0].uid] = {
					x: x,
					y: y
				};
			} else {
				var radius = localBeacons.length * 4 * DOT_RADIUS;
				for (var i = 0; i < localBeacons.length; i++) {
					var x = (localBeacons[i].x - this.rect.x) * width / this.rect.width;
					var y = (localBeacons[i].y - this.rect.y) * height / this.rect.height;
					var angle = Math.PI * 2 * i / localBeacons.length;
					var x += radius * Math.cos(angle);
					var y += radius * Math.sin(angle);
					context.beginPath();
					context.ellipse(x, y, DOT_RADIUS, DOT_RADIUS, 0, 0, Math.PI * 2, false);
					context.fillStyle = COLORS[localBeacons[i].name.hashCode() % COLORS.length];
					context.fill();
					beaconLocations[localBeacons[i].uid] = {
						x: x,
						y: y
					};
				}
			}
		}

		context.restore();
	};

	this.getBeaconAt(x, y) {
		var uid;
		for (var i = 0; i < Object.keys(beaconLocations); i++) {
			var key = Object.keys(beaconLocations)[i];
			var dx = x - beaconLocations[key].x;
			var dy = y - beaconLocations[key].y;
			if (Math.sqrt(dx * dx + dy * dy) < DOT_RADIUS) {
				uid = key;
				break;
			}
		}
		for (var i = 0; i < beacons.length; i++) {
			if (beacons[i].uid === uid) {
				return beacons[i];
			}
			return null;
		}

		return this;
	}
}