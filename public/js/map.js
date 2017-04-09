(function() {
    'use strict';

    function mapController($scope) {
    	var canvas = $('#mapCanvas')[0];
    	var context = canvas.getContext('2d');

    	var groundFloor = new BeaconFloor('ground', $('#ground')[0], {x:0,y:0,width:640,height:400}, broadcasterRegistry, beaconRegistry);
    	var beaconMap  = new BeaconMap([groundFloor], broadcasterRegistry, beaconRegistry);

        $scope.localCopy = null;

        renderCallback = function() {
            beaconMap.render(context);
        };
        console.log('set renderCallback');

        $scope.canvasClick = function(evt){
            var x = evt.offsetX;
            var y = evt.offsetY;
            $scope.clickX = x;
            $scope.clickY = y;

            //see if anything was clicked on
            $scope.selectedBeacon = null;
            $scope.selectedBroadcaster = null;
            $scope.selectedBeacon = beaconMap.currentFloor.getBeaconAt(x,y);
            if (!$scope.selectedBeacon) {
                $scope.selectedBroadcaster = beaconMap.currentFloor.getBroadcasterAt(x,y); 
            }

            if ($scope.selectedBeacon){
                console.log($scope.selectedBeacon);
            } else if ($scope.selectedBroadcaster){
                console.log($scope.selectedBroadcaster);
            }
        };

    	beaconMap.render(context);
    }

    angular.module('app').controller('mapController', [
        '$scope',
        mapController
    ]);
})();