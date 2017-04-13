(function() {
    'use strict';

    function getFloor(id, beaconRegistry, broadcasterRegistry) {
        var image = $('#' + id)[0];
        return new BeaconFloor(id, image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height
        }, beaconRegistry, broadcasterRegistry);
    }

    /**Controls the functionality of the page displaying the map
     * (executes when the map page is loaded0
     *
     * @param $scope - Angular's hook to the webpage's namespace
     * @param $http - Angular's restful library
     * @param $mdToast - Angular's message system (for in page error displays)
     * @param $mdSidenav - Angular's responsive sidenav element callbacks*/
    function mapController($scope, $http, $mdToast, $mdSidenav) {
        var canvas = $('#mapCanvas')[0];
        var context = canvas.getContext('2d');

        var basement = new BeaconFloor('basement', $('#basement')[0], {
            x: 0,
            y: 0,
            width: 800,
            height: 800
        }, broadcasterRegistry, beaconRegistry);

        var floors = [
            getFloor('5thFloor', broadcasterRegistry, beaconRegistry),
            getFloor('4thFloor', broadcasterRegistry, beaconRegistry),
            getFloor('3rdFloor', broadcasterRegistry, beaconRegistry),
            getFloor('2ndFloor', broadcasterRegistry, beaconRegistry),
            getFloor('1stFloor', broadcasterRegistry, beaconRegistry),
            getFloor('basement', broadcasterRegistry, beaconRegistry)
        ];
        var beaconMap = new BeaconMap(floors, broadcasterRegistry, beaconRegistry);
        beaconMap.currentFloor = floors[4];
        $scope.beaconMap = beaconMap;
        //display nothing in the sidenav
        $scope.state = 'pristine';

        $scope.icons = [
            "calculator",
            "person",
            "document"
        ]

        //sets the rendering callback for restful requests to update the maps
        renderCallback = function() {
            beaconMap.render(context);
        };
        $scope.render = renderCallback;

        console.log('set renderCallback');

        /**Handles the map canvas's click events
         *
         * @param {mouseEvent} event*/
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
                beaconMap.cursor.x = beaconMap.currentFloor.broadcasterLocations[$scope.selectedBroadcaster.id].x;
                beaconMap.cursor.y = beaconMap.currentFloor.broadcasterLocations[$scope.selectedBroadcaster.id].y;
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

        /**Compares the target object to the local copy.
         * 
         * @param target - the original, unmodified copy
         *
         * @return true iff the target is different from $scope.localCopy
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

        /**Makes a post request to give server information about a detecter
         *
         * @param broadcaster - the detecter the server needs to know about*/
        $scope.postBroadcaster = function(broadcaster) {
            if (broadcaster.id && broadcaster.id.length > 0) {
                $http.post(hostUrl() + '/broadcaster', $scope.localCopy).then(function() {
                    if ($scope.selectedBeacon) {
                        $scope.selectBeacon(beaconRegistry[$scope.selectedBeacon.id]);
                    }
                }, function() {
                    $mdToast.show($mdToast.simple().textContent('Error posting, see log for details'));
                });
            }
        };

        /**Makes a post request to delete a detector from the server
         * 
         * @param {string} id - the id of the detecter the server needs to delete*/
        $scope.deleteBroadcaster = function(id) {
            $http.post(hostUrl() + '/deleteBroadcaster', {
                id: id
            }).then(function() {
                if ($scope.selectedBeacon) {
                    $scope.selectBeacon(beaconRegistry[$scope.selectedBeacon.id]);
                }
            }, function() {
                $mdToast.show($mdToast.simple().textContent('Error posting, see log for details'));
            });
        };

        /**Makes a post request to give server information about a beacon
         *
         * @param target - the beacon the server needs to know about*/
        $scope.postBeacon = function(target) {
            $http.post(hostUrl() + '/beacon', target).then(function() {
                if ($scope.selectedBeacon) {
                    $scope.selectBeacon(beaconRegistry[$scope.selectedBeacon.id]);
                }
            }, function() {
                $mdToast.show($mdToast.simple().textContent('Error posting, see log for details'));
            });
        };

        /**Makes a post request to delete a beacon from the server
         * 
         * @param {string} id - the id of the beacon the server needs to delete*/
        $scope.deleteBeacon = function(id) {
            $http.post(hostUrl() + '/deleteBeacon', {
                id: id
            }).then(function() {
                $scope.state = 'pristine';
            }, function() {
                $mdToast.show($mdToast.simple().textContent('Error posting, see log for details'));
            });
        };

        /**Updates the map to show only beacons that match a search query
         * 
         * @param {string} filter - search query*/
        $scope.setBeaconFilter = function(filter) {
            beaconMap.filter = filter;
            beaconMap.render(context);
        };

        /**Sets the state and selected beacon to show a desired beacon
         *
         * @param beacon - desired beacon*/
        $scope.selectBeacon = function(beacon) {
            $scope.selectedBeacon = beacon;
            $scope.localCopy = {};
            jQuery.extend($scope.localCopy, $scope.selectedBeacon);
            beaconMap.cursor = null;
            beaconMap.render(context);
            $scope.state = 'beacon';
        };

        /**For searching, returns true iff the beacon might match the search query
         * 
         * @param {object} beacon - The beacon to check
         * @param {object} text - Search query
         * 
         * @return {boolean} beacon matches search
         */
        function beaconMatches(beacon, text) {
            return !text ||
                (beacon.name && beacon.name.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0) ||
                beacon.id.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        };

        /**Get a list of beacons that match a given search query, using beaconMatches
         *
         * @param {string} filter - search query*/
        $scope.searchBeacons = function(filter) {
            var matches = [];
            for (var i = 0; i < Object.keys(beaconRegistry).length; i++) {
                var beacon = beaconRegistry[Object.keys(beaconRegistry)[i]];
                if (beaconMatches(beacon, filter)) {
                    matches.push(beacon);
                }
            }
            return matches;
        };

        /**Shows/hides the sidenav that controlls map interaction*/
        $scope.toggleSidenav = function() {
            $mdSidenav('left').toggle();
        };
    }

    angular.module('app').controller('mapController', [
        '$scope',
        '$http',
        '$mdToast',
        '$mdSidenav',
        mapController
    ]);
})();