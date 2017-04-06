(function() {
    'use strict';

    function broadcastersController($scope, $http) {
        var canvas = $('#broadcastersCanvas')[0];
    	var context = canvas.getContext('2d');

    	var groundFloor = new BeaconFloor('ground', $('#ground')[0], {x:0,y:0,width:640,height:400}, broadcasterRegistry, beaconRegistry);
    	var beaconMap  = BeaconMap([groundFloor], broadcasterRegistry, beaconRegistry);
    	beaconMap.render(context);
    }

    angular.module('app').controller('broadcastersController', [
        '$scope',
        '$http',
        broadcastersController
    ]);
})();