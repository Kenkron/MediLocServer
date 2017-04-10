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

function colorAlpha(color, alpha){
	colors = [
		'rgba(255,0,0,',
		'rgba(255,255,0,',
		'rgba(0,255,0,',
		'rgba(0,255,255,',
		'rgba(0,0,255,'
		];
	return colors[color] + alpha + ')';
}

hashString = function(str) {
	var hash = 0,
		i, chr;
	if (str.length === 0) return hash;
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

function getColor() {
	return COLORS[colorCounter++];
}

function beaconMatches(beacon, text){
	return !text || 
		(beacon.name && beacon.name.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0) || 
		beacon.id.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0;
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
	this.floors = floors;
	this.broadcasters = broadcasters;
	this.beacons = beacons;
	this.currentFloor = floors[0];
	this.filter = null;
	this.showUnnamed = false;

	this.render = function(context) {
		context.save();
		context.fillStyle = 'white';
		this.currentFloor.render(context, this.filter, this.showUnnamed);
		//any additional chrome goes here
		var cursor = this.cursor;
		if (cursor) {
			context.strokeStyle = 'black';
			context.beginPath();
			context.moveTo(cursor.x, cursor.y - DOT_RADIUS);
			context.lineTo(cursor.x, cursor.y + DOT_RADIUS);
			context.moveTo(cursor.x - DOT_RADIUS, cursor.y);
			context.lineTo(cursor.x + DOT_RADIUS, cursor.y);
			context.stroke();
		}
		context.restore();
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
	this.beaconLocations = {};
	this.broadcasterLocations = {};

	this.render = function(context, filter, showUnnamed) {
		context.save();
		var width = context.canvas.width;
		var height = context.canvas.height;
		context.rect(0, 0, width, height);
		context.fill();
		context.drawImage(this.image, 0, 0, width, height);

		//clear beacon locations
		this.beaconLocations = {};
		//clear broadcaster locations
		this.broadcasterLocations = {};

		//render broadcaster by broadcaster
		for (var i = 0; i < Object.keys(broadcasters).length; i++) {
			var broadcaster = broadcasters[Object.keys(broadcasters)[i]];
			if (broadcaster.floor === floorName) {
				this.renderBroadcaster(broadcaster, context, filter, showUnnamed);
			}
		}

		context.restore();
	};

	/**
	 * Renders a broadcaster and its corresponding beacons onto a given context
	 *
	 * @param filter if provided, only beacons that 'match' this string will be rendered
	 */
	this.renderBroadcaster = function(broadcaster, context, filter, showUnnamed) {
		context.save();

		var width = context.canvas.width;
		var height = context.canvas.height;
		var x = (broadcaster.x - this.rect.x) * width / this.rect.width;
		var y = (broadcaster.y - this.rect.y) * height / this.rect.height;
		this.broadcasterLocations[broadcaster.id] = {
			x: x,
			y: y
		};

		//render broadcaster as black square
		context.strokeStyle = 'black';
		context.beginPath();
		context.rect(x - DOT_RADIUS, y - DOT_RADIUS, DOT_RADIUS * 2, DOT_RADIUS * 2);
		context.stroke();

		localBeacons = [];
		for (var i = 0; i < Object.keys(beacons).length; i++) {
			var beacon = beacons[Object.keys(beacons)[i]];
			if (showUnnamed || (beacon.name && beacon.name.length > 0)){
				if (beacon.broadcaster === broadcaster.id) {
					localBeacons.push(beacon);
				}
			}
		}
		var radius = Math.max(localBeacons.length * 2 * DOT_RADIUS / 3.1416,
			8 * DOT_RADIUS / 3.1416);
		for (var i = 0; i < localBeacons.length; i++) {
			var beacon = localBeacons[i];
			if (!beaconMatches(beacon, filter)){
				continue;
			}
			
			var angle = Math.PI * 2 * i / localBeacons.length;
			var x2 = x + radius * Math.cos(angle);
			var y2 = y + radius * Math.sin(angle);
			context.beginPath();
			context.ellipse(x2, y2, DOT_RADIUS, DOT_RADIUS, 0, 0, Math.PI * 2, false);
			var col = hashString(beacon.id) % COLORS.length;
			var alpha = 0.33 + 0.67 * Math.max(0, 1 - (new Date().getTime() - beacon.lastSeen)/600000);
			context.fillStyle = colorAlpha(col, alpha);
			context.fill();
			this.beaconLocations[beacon.id] = {
				x: x2,
				y: y2
			};
		}
		context.restore();
	};

	this.getBeaconAt = function(x, y) {
		var id;
		for (var i = 0; i < Object.keys(this.beaconLocations).length; i++) {
			var key = Object.keys(this.beaconLocations)[i];
			var dx = x - this.beaconLocations[key].x;
			var dy = y - this.beaconLocations[key].y;
			if (Math.sqrt(dx * dx + dy * dy) < DOT_RADIUS) {
				return beacons[key];
			}
		}
		return null;
	};

	this.getBroadcasterAt = function(x, y) {
		var id;
		for (var i = 0; i < Object.keys(this.broadcasterLocations).length; i++) {
			var key = Object.keys(this.broadcasterLocations)[i];
			var dx = Math.abs(x - this.broadcasterLocations[key].x);
			var dy = Math.abs(y - this.broadcasterLocations[key].y);
			if (dx < DOT_RADIUS && dy < DOT_RADIUS) {
				return broadcasters[key];
			}
		}
		return null;
	};
}