(function() {
    'use strict';

    function mapController($scope, sessionService) {
    	var canvas = $('#mapCanvas')[0];
    	var context = canvas.getContext('2d');

    	var groundFloor = new BeaconFloor('ground', $('#ground')[0], {x:0,y:0,width:640,height:400}, {}, {});
    }

    angular.module('app').controller('mapController', [
        '$scope',
        mapController
    ]);
})();