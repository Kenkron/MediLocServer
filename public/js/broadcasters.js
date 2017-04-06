(function() {
    'use strict';

    function beaconsController($scope, $http, sessionService) {
    	var canvas = $('#mapCanvas')[0];
    	var context = canvas.getContext('2d');

    	var groundFloor = new BeaconFloor('ground', $('#ground')[0], {x:0,y:0,width:640,height:400}, broadcasterRegistry, beaconRegistry);
    	var beaconMap  = BeaconMap([groundFloor], broadcasterRegistry, beaconRegistry);
    	beaconMap.render(context);
    }

    angular.module('app').controller('beaconsController', [
        '$scope',
        '$http',
        beaconsController
    ]);
})();