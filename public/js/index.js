//a list of clients that might report populations on the 'map'
var socket = io();

broadcasterRegistry = {};
beaconRegistry = {};

var renderCallback = null;

// Handle socket events here
//--------------------------
// Adds to the debug list
socket.on('broadcaster', data => {
    data = JSON.parse(data);
    console.log('broadcaster ' + data.id);
    broadcasterRegistry[data.id] = data;
    if (renderCallback) {
        renderCallback();
    }
});

// Handle socket events here
//--------------------------
// Adds to the debug list
socket.on('deleteBroadcaster', data => {
    console.log('deleting broadcaster ' + data);
    delete broadcasterRegistry[data];
    if (renderCallback) {
        renderCallback();
    }
});

// Handle socket events here
//--------------------------
// Adds to the debug list
socket.on('beacon', data => {
    data = JSON.parse(data);
    console.log('beacon ' + data.id);
    beaconRegistry[data.id] = data;
    if (renderCallback) {
        renderCallback();
    }
});

socket.on('deleteBeacon', data => {
    console.log('deleting beacon ' + data);
    delete beaconRegistry[data];
    if (renderCallback) {
        renderCallback();
    }
});


function hostUrl() {
    var pathArray = location.href.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    return protocol + '//' + host;
}

(function() {
    'use strict';

    var app = angular.module('app', [
        'ui.router',
        'ngMaterial'
    ]);

    app.config(['$stateProvider', function($stateProvider) {

        //Not implemented right now
        // $stateProvider.state('login', {
        //     url: '/login',
        //     templateUrl: 'login.html',
        //     controller: 'loginController'
        // });

        $stateProvider.state('map', {
            url: '/map',
            templateUrl: 'map.html',
            controller: 'mapController'
        });

        $stateProvider.state('broadcasters', {
            url: '/broadcasters',
            templateUrl: 'broadcasters.html',
            controller: 'broadcastersController'
        });
    }]);

    app.run([
        '$state',
        function($state) {
            $state.go('map');
        }
    ]);
})();