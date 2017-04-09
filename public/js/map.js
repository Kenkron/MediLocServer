(function() {
    'use strict';

    function mapController($scope, $http) {
        var canvas = $('#mapCanvas')[0];
        var context = canvas.getContext('2d');

        var groundFloor = new BeaconFloor('ground', $('#ground')[0], {
            x: 0,
            y: 0,
            width: 640,
            height: 400
        }, broadcasterRegistry, beaconRegistry);
        var beaconMap = new BeaconMap([groundFloor], broadcasterRegistry, beaconRegistry);

        //display nothing in the sidenav
        $scope.state = 'pristine';

        renderCallback = function() {
            beaconMap.render(context);
        };
        console.log('set renderCallback');

        $scope.canvasClick = function(evt) {
            var x = evt.offsetX;
            var y = evt.offsetY;
            beaconMap.cursor = {
                x: x,
                y: y
            };
            $scope.clickX = x;
            $scope.clickY = y;
            $scope.localCopy = null;
            $scope.pristine = false;

            //see if anything was clicked on
            $scope.selectedBeacon = null;
            $scope.selectedBroadcaster = null;
            $scope.selectedBeacon = beaconMap.currentFloor.getBeaconAt(x, y);
            if (!$scope.selectedBeacon) {
                $scope.selectedBroadcaster = beaconMap.currentFloor.getBroadcasterAt(x, y);
            }

            $scope.localCopy = {};
            if ($scope.selectedBeacon) {
                beaconMap.cursor = {
                    x: beaconMap.currentFloor.beaconLocations[$scope.selectedBeacon.id].x,
                    y: beaconMap.currentFloor.beaconLocations[$scope.selectedBeacon.id].y
                };
                $scope.state = 'beacon';
                jQuery.extend($scope.localCopy, $scope.selectedBeacon);
            } else if ($scope.selectedBroadcaster) {
                beaconMap.cursor = {
                    x: $scope.selectedBroadcaster.x,
                    y: $scope.selectedBroadcaster.y
                };
                $scope.state = 'broadcaster';
                jQuery.extend($scope.localCopy, $scope.selectedBroadcaster);
            } else {
                $scope.state = 'createBroadcaster';
                $scope.localCopy.x = x;
                $scope.localCopy.y = y;
                $scope.localCopy.floor = beaconMap.currentFloor.floorName;
            }
            console.log($scope.localCopy);
            beaconMap.render(context);
        };

        /**
         * Compares the target object to the local copy.
         * 
         * @return true iff the target is the same as $scope.localCopy
         * */
        $scope.wasModified = function(target) {
            if (!localCopy || !target)
                return true;
            var keys = Object.keys(localCopy);
            var i;
            for (i = 0; i < keys.length; i++) {
                if (target[keys[i]] !== localCopy[keys[i]]) {
                    return true;
                }
            }
            return false;
        };

        $scope.postBroadcaster = function(broadcaster) {
            if ($scope.localCopy.id && $scope.localCopy.id.length > 0) {
                $http.post(hostUrl() + '/broadcaster', $scope.localCopy).then(function() {
                    console.log('posted');
                }, function(e) {
                    console.log(e);
                });
            }
        }

        beaconMap.render(context);
    }

    angular.module('app').controller('mapController', [
        '$scope',
        '$http',
        mapController
    ]);
})();