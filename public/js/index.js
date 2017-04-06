require('angular');
require('angular-material');
require('ui-router');

//a list of clients that might report populations on the 'map'
var socket = io();

// Handle socket events here
//--------------------------
// Adds to the debug list
socket.on('debug', data => {
    var time = new Date();
    $('#debugLogList').append('<div>' + time + ': ' + data.type + ' | ' + data.msg + '</div>');

    if (data.type === 'UPDATE') {
        console.log(data);
        var msg = JSON.parse(data.msg);
        if (!clients[data.client]) clients[data.client] = {};
        clients[data.client].count = msg.count;
        clients[data.client].max = msg.max;
        render();
    }
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
})();