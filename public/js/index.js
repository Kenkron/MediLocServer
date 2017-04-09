//a list of clients that might report populations on the 'map'
var socket = io();

broadcasterRegistry = {};
beaconRegistry = {};

var renderCallback = null;

// Handle socket events here
//--------------------------
// Adds to the debug list
socket.on('broadcaster', data => {
    console.log('broadcaster ' + data.id);
    data = JSON.parse(data);
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
    console.log('beacon '+data.id);
    data = JSON.parse(data);
    beaconRegistry[data.id] = data;
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
            $state.go('broadcasters');
        }
    ]);
})();