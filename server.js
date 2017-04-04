/*
 * Server.js
 * 
 * The main portion of this project. Contains all the defined routes for express,
 * rules for the websockets, and rules for the MQTT broker.
 * 
 * Refer to the portions surrounded by --- for points of interest
 */
var express = require('express'),
    app = express();
var pug = require('pug');
var sockets = require('socket.io');
var path = require('path');

var conf = require(path.join(__dirname, 'config'));
var internals = require(path.join(__dirname, 'internals'));

// -- Setup the application
setupExpress();
setupSocket();

function bytes2String(bytes) {
    var i = 0;
    var result = '';
    while (i < bytes.length && bytes[i] != 0) {
        result = result + String.fromCharCode();
        i++;
    }
    return result;
}

// -- Socket Handler
// Here is where you should handle socket/mqtt events
// The mqtt object should allow you to interface with the MQTT broker through 
// events. Refer to the documentation for more info 
// -> https://github.com/mcollina/mosca/wiki/Mosca-basic-usage
// ----------------------------------------------------------------------------

//stores counters for each source
counters = {};

function socket_handler(socket, mqtt) {
    // Called when a client connects
    mqtt.on('clientConnected', client => {
        console.log("Client Connected: " + client.id);
        socket.emit('debug', {
            type: 'CLIENT',
            msg: '{"connected": "true", "clientId": "' + client.id + '"}'
        });
    });

    // Called when a client disconnects
    mqtt.on('clientDisconnected', client => {
        console.log("Client Disconnected: " + client.id);
        socket.emit('debug', {
            type: 'CLIENT',
            msg: '{"connected": "false", "clientId": "' + client.id + '"'
        });
    });

    // Called when a client publishes data
    mqtt.on('published', (data, client) => {
        console.log('client: ' + client)
        if (!client) return;
        console.log('[Publication] Client: ' + client.id + ', Published: ' + JSON.stringify(data));

        //if there isn't a counter for this client yet, make one
        if (!counters[client.id]) counters[client.id] = {
            count: 0,
            max: 0
        };

        //get the payload as a string
        message = data.payload.toString().trim();

        socket.emit('debug', {
            type: 'UPDATE',
            client: client.id,
            msg: message
        });
        return;

        socket.emit('debug', {
            type: 'PUBLISH',
            msg: '{ "client": "' + client.id + '", "published" : "' + message + '""}'
        });
    });

    // Called when a client subscribes
    mqtt.on('subscribed', (topic, client) => {
        if (!client) return;

        socket.emit('debug', {
            type: 'SUBSCRIBE',
            msg: 'Client "' + client.id + '" subscribed to "' + topic + '"'
        });
    });

    // Called when a client unsubscribes
    mqtt.on('unsubscribed', (topic, client) => {
        if (!client) return;

        socket.emit('debug', {
            type: 'SUBSCRIBE',
            msg: 'Client "' + client.id + '" unsubscribed from "' + topic + '"'
        });
    });
}
// ----------------------------------------------------------------------------

var broadcasterRegistry = {};

broadcasterRegistry['175'] = {
    room: 1,
    floor: 'ground'
};

broadcasterRegistry['387'] = {
    room: 2,
    floor: 'ground'
};

broadcasterRegistry['615'] = {
    room: 3,
    floor: 'ground'
};

broadcasterRegistry['614'] = {
    room: 4,
    floor: 'ground'
};

broadcasterRegistry['026'] = {
    room: 5,
    floor: 'ground'
};

//an object to hold the beacons
var beaconRegistry = {};


beaconRegistry['587'] = {
    broadcaster = 
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

// Helper functions
function setupExpress() {
    app.set('view engine', 'pug'); // Set express to use pug for rendering HTML

    // Setup the 'public' folder to be statically accessable
    var publicDir = path.join(__dirname, 'public');
    app.use(express.static(publicDir));

    // Setup the paths (Insert any other needed paths here)
    // ------------------------------------------------------------------------
    // Home page
    app.get('/', (req, res) => {
        res.render('index', {
            title: 'MQTT Tracker'
        });
    });

    app.post('/found', (req, res) => {
        var broadcaster = req.query.uid;
        var beacon = req.query.beacon;
        console.log("found " + beacon  + "count: "+ beacons[beacon]);
        publishBeacon(beacon);
    });

    app.post('config'){

    }

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

    // ------------------------------------------------------------------------

    // Handle killing the server
    process.on('SIGINT', () => {
        internals.stop();
        process.kill(process.pid);
    });
}

var server;
var io;

function setupSocket() {
    server = require('http').createServer(app);
    io = sockets(server);

    // Setup the internals
    internals.start(mqtt => {
        io.on('connection', socket => {
            socket_handler(socket, mqtt)
        });
    });

    server.listen(conf.PORT, conf.HOST, () => {
        console.log("Listening on: " + conf.HOST + ":" + conf.PORT);
    });
}