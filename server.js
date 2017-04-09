/*
 * Server.js
 * 
 * The main portion of this project. Contains all the defined routes for express,
 * rules for the websockets, and rules for the MQTT broker.
 * 
 * Refer to the portions surrounded by --- for points of interest
 */
var express = require('express');
var app = express();
var sockets = require('socket.io');
var path = require('path');
var http = require('pug');

var server;
var io;

var conf = require(path.join(__dirname, 'config'));
var internals = require(path.join(__dirname, 'internals'));

function bytes2String(bytes) {
    var i = 0;
    var result = '';
    while (i < bytes.length && bytes[i] != 0) {
        result = result + String.fromCharCode();
        i++;
    }
    return result;
}

function setupSocket() {
    server = require('http').createServer(app);
    io = sockets(server);

    // Setup the internals
    io.on('connection', socket => {
        //get client up to date on broadcasters
        for (var i = 0; i < Object.keys(broadcasterRegistry).length; i++){
            var key = Object.keys(broadcasterRegistry)[i];
            socket.emit('broadcaster', JSON.stringify(broadcasterRegistry[key]));
        }
        //get client up to date on beacons
        for (var i = 0; i < Object.keys(beaconRegistry).length; i++) {
            var key = Object.keys(beaconRegistry)[i];
            socket.emit('beacon', JSON.stringify(beaconRegistry[key]));
        }
    });

    server.listen(conf.PORT, conf.HOST, () => {
        console.log("Listening on: " + conf.HOST + ":" + conf.PORT);
    });
}

function setupExpress() {
    app.set('view engine', 'pug');

    // Setup the 'public' folder to be statically accessable
    var publicDir = path.join(__dirname, 'public');
    app.use(express.static(publicDir));
    app.use(express.static('views'));
    app.use(express.static('node_modules'));
    app.use('/bower',express.static('bower_components'));
    // Setup the paths (Insert any other needed paths here)
    // ------------------------------------------------------------------------
    // Home page
    app.get('/', (req, res) => {
        res.render('index', {
            title: 'MediLoc'
        });
    });

    app.post('/found', (req, res) => {
        var broadcaster = req.query.uid;
        var beacon = req.query.beacon;
        console.log("found " + beacon  + "at: " + broadcaster);
        publishBeacon(beacon);
    });

    app.post('/config', (req, res) => {
        var broadcaster = req.query.uid;
        var room = req.query.room;
        var floor = req.query.floor;
        beaconRegistry[req.query.uid] = {
            room: room,
            floor: floor
        };
    });

    // Basic 404 Page
    app.use((req, res, next) => {
        var err = {
            stack: {},
            status: 404,
            message: "Error 404: Page Not Found '" + req.path + "'"
        };

        // Pass the error to the error handler below
        next(err);
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.log("Error found: ", err);
        res.status(err.status || 500);

        res.render('error', {
            title: 'Error',
            error: err.message
        });
    });

    // Handle killing the server
    process.on('SIGINT', () => {
        internals.stop();
        process.kill(process.pid);
    });
}

// -- Socket Handler
// Here is where you should handle socket/mqtt events
// The mqtt object should allow you to interface with the MQTT broker through 
// events. Refer to the documentation for more info 
// -> https://github.com/mcollina/mosca/wiki/Mosca-basic-usage
// ----------------------------------------------------------------------------

//Hash map of (id, broadcaster) pairs
var broadcasterRegistry = {};


//some default stuff
broadcasterRegistry['175'] = {
    id: '175',
    name: 'room 1',
    floor: 'ground',
    x: 100,
    y: 100
};

broadcasterRegistry['387'] = {
    id: '387',
    name: 'room 2',
    floor: 'ground',
    x: 200, 
    y:100
};

broadcasterRegistry['615'] = {
    id: '615',
    name: 'room 3',
    floor: 'ground',
    x: 300, 
    y:100
};

broadcasterRegistry['614'] = {
    id: '614',
    name: 'room 4',
    floor: 'ground',
    x: 100, 
    y:200
};

broadcasterRegistry['026'] = {
    id: '026',
    name: 'room 5',
    floor: 'ground',
    x: 200, 
    y:200
};

//hash map of (id, beacon) pairs
var beaconRegistry = {};


beaconRegistry['587'] = {
    id: '587',
    broadcaster: '026',
    lastSeen: new Date().getTime()
};

beaconRegistry['954'] = {
    id: '954',
    broadcaster: '026',
    lastSeen: new Date().getTime()
};

function publishBeacon(uid) {
    if (typeof(beacons[uid]) === "undefined") {
        console.log('no such beacon');
        return;
    }
    io.emit('debug', {
        type: 'POST',
        client: uid,
        msg: '{"type": "ANDROID", "count": "' + beacons[uid] + '", "max": "3"}'
    });
}

// -- Setup the application
setupExpress();
setupSocket();