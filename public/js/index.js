//a list of clients that might report populations on the 'map'
var socket = io();

broadcasterRegistry = {};
beaconRegistry = {};

// Handle socket events here
//--------------------------
// Adds to the debug list
socket.on('broadcaster', data => {
    console.log(data);
});

(function(){
    'use strict';

    var app=angular.module('app',[
        'ui.router'
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
            temaplateUrl: 'broadcasters.html',
            controller: 'broadcastersController'
        });
    }]);

    app.run([
        '$state',
        function ($state) {
            $state.go('map');
        }]);
})();