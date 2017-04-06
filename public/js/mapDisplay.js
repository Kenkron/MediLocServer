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
function BeaconMap(floors, broadcasters, beacons) {
	var beaconMap = this;
	this.canvas = canvas;
	this.floors = floors;
	this.beacons = beacons;
	this.broadcasters = broadcasters;
	this.currentFloor = floors[0];

	this.render = function(context) {
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
function BeaconFloor(floorName, image, rect, broadcasters, beacons) {
	this.floorName = floorName;
	this.image = image;
	this.rect = rect;
	this.beacons = beacons;
	this.boradcasters = broadcasters;

	//Stores the locations each beacon was last rendered at by uid
	this.beaconViewLocations = {};
	this.broadcasterViewLocations = {};

	this.render = function(context) {
		context.save();
		var width = context.canvas.width;
		var height = context.canvas.height;
		context.drawImage(this.image, 0, 0, width, height);

		//clear beacon locations
		beaconLocations = {};
		//clear broadcaster locations
		broadcasterViewLocations = {};

		//render broadcaster by broadcaster
		for (var i = 0; i < Object.keys(broadcasters).length; i++){
			var broadcaster = broadcasters[Object.keys(broadcasters)[i]];
			if (broadcaster.floor === floorName) {
				renderBroadcaster(broadcaster, context);
			}
		}

		context.restore();
	};

	/**
	 * Renders a broadcaster and its corresponding beacons onto a given context
	 */
	this.renderBroadcaster = function(broadcaster, context){
		context.save();
		var x = (broadcasters[key].x - this.rect.x) * width / this.rect.width;
		var y = (boradcasters[key].y - this.rect.y) * height / this.rect.height;

		//render broadcaster as black square
		context.strokeStyle = 'black';
		context.beginPath();
		context.rect(DOT_RADIUS*2, DOT_RADIUS*2, x-DOT_RADIUS, y-DOT_RADIUS);
		context.stroke();

		localBeacons = [];
		for (var i = 0; i < Object.keys(beacons).length; i++){
			var beacon = beacons[Object.keys(beacons)[i]];
			if (beacon.broadcaster === broadcaster.id) {
				localBeacons.push(beacon);
			}
		}
		var radius = Math.max(localBeacons.length * 4 * DOT_RADIUS/3.1416,
			8*DOT_RADIUS/3.1416);
		for (var i = 0; i < localBeacons.length; i++) {
			var angle = Math.PI * 2 * i / localBeacons.length;
			var x2 = x + radius * Math.cos(angle);
			var y2 = y + radius * Math.sin(angle);
			context.beginPath();
			context.ellipse(x, y, DOT_RADIUS, DOT_RADIUS, 0, 0, Math.PI * 2, false);
			context.fillStyle = COLORS[localBeacons[i].name.hashCode() % COLORS.length];
			context.fill();
			beaconViewLocations[localBeacons[i].uid] = {
				x: x2,
				y: y2
			};
		}
		context.restore();
	}

	this.getBeaconAt = function(x, y) {
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