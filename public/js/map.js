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
        $scope.beaconMap = beaconMap;
        //display nothing in the sidenav
        $scope.state = 'pristine';

        renderCallback = function() {
            beaconMap.render(context);
        };
        console.log('set renderCallback');

        $scope.canvasClick = function(evt) {
            var x = evt.offsetX;
            var y = evt.offsetY;
            beaconMap.highlight = null;
            beaconMap.cursor = {
                x: x,
                y: y,
                floor: beaconMap.currentFloor.floorName
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
                beaconMap.highlight = $scope.selectedBeacon;
                beaconMap.cursor.x = beaconMap.currentFloor.beaconLocations[$scope.selectedBeacon.id].x;
                beaconMap.cursor.y = beaconMap.currentFloor.beaconLocations[$scope.selectedBeacon.id].y;
                $scope.state = 'beacon';
                jQuery.extend($scope.localCopy, $scope.selectedBeacon);
            } else if ($scope.selectedBroadcaster) {
                beaconMap.highlight = $scope.selectedBroadcaster;
                beaconMap.cursor.x = $scope.selectedBroadcaster.x;
                beaconMap.cursor.y = $scope.selectedBroadcaster.y;
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
            if (!$scope.localCopy || !target)
                return true;
            var keys = Object.keys($scope.localCopy);
            var i;
            for (i = 0; i < keys.length; i++) {
                if (target[keys[i]] !== $scope.localCopy[keys[i]]) {
                    return true;
                }
            }
            return false;
        };

        $scope.postBroadcaster = function(broadcaster) {
            if (broadcaster.id && broadcaster.id.length > 0) {
                $http.post(hostUrl() + '/broadcaster', $scope.localCopy);
            }
        };

        $scope.deleteBroadcaster = function(id) {
            $http.post(hostUrl() + '/deleteBroadcaster', {
                id: id
            });
        };

        $scope.postBeacon = function(target) {
            $http.post(hostUrl() + '/beacon', target);
        };

        $scope.setBeaconFilter = function(filter) {
            beaconMap.filter = filter;
            beaconMap.render(context);
        }

        $scope.selectBeacon = function(beacon) {
            $scope.selectedBeacon = beacon;
            $scope.localCopy = {};
            jQuery.extend($scope.localCopy, $scope.selectedBeacon);
            beaconMap.cursor = null;
            beaconMap.render(context);
            $scope.state = 'beacon';
        }

        function beaconMatches(beacon, text){
            return !text || 
                (beacon.name && beacon.name.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0) || 
                beacon.id.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        }

        $scope.searchBeacons = function(filter) {
            var matches = [];
            for (var i = 0; i < Object.keys(beaconRegistry).length; i++) {
                var beacon = beaconRegistry[Object.keys(beaconRegistry)[i]];
                if (beaconMatches(beacon, filter)) {
                    matches.push(beacon);
                }
            }
            return matches;
        }
    }

    angular.module('app').controller('mapController', [
        '$scope',
        '$http',
        mapController
    ]);
})();