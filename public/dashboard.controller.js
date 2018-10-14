import {get, post} from "./network.js";
import {play, pause, isCurrentSong , audio_features} from "./player.js";

angular.module('spotifyApp')
    .controller('MainController', ['$timeout', '$scope',
        function ($timeout, $scope) {
            var self = this;
            self.backgroundColors = ["#19d06e70", "#c1d01970", "#d0191970", "#19d03c70", "#2910101c", "#ab0c0c66", "#0cab8e66", "#9cf3e366", "#ea9cf366"];
            $scope.activeSongTitle = "";
            $scope.activeSongArtist = "";

            self.refresh = function () {
                $scope.loading = true;
                $scope.get('/listSongs').then(function (res) {
                    angular.forEach(res, function (value) {
                        var randomNumber = Math.floor(Math.random() * 10) + 1;
                        value['style'] = {
                            'background': self.backgroundColors[Math.floor(Math.random() * self.backgroundColors.length)],
                            '-webkit-transform': 'rotate(' + randomNumber + 'deg)',
                            '-moz-transform': 'rotate(' + randomNumber + 'deg)',
                            '-o-transform': 'rotate(' + randomNumber + 'deg)',
                            '-ms-transform': 'rotate(' + randomNumber + 'deg)',
                            'transform': 'rotate(' + randomNumber + 'deg)',
                        }
                    });
                    $scope.tracks = res;
                    $scope.loading = false;
                });
            };
            $scope.get = function (url) {
                return get(url).then((data)=> {
                    $timeout(1, ()=>$scope.apply());
                    return data
                })
            };
            $scope.post = function (url, data) {
                return post(url, data).then((data)=> {
                    $timeout(1, ()=>$scope.apply());
                    return data
                })
            };
            $scope.searchForSong = function () {
                $scope.findTracks();
            };

            $scope.findTracks = function () {
                $scope.loading = true;
                $scope.post('search-track', {name: $scope.newSong}).then(function (res) {
                    $scope.newTracks = res;
                    $scope.loading = false;
                });
            };

            $scope.postSong = function (id) {
                post('/addSong', {trackId: id}).then(
                    function () {
                        $scope.newTracks = [];
                        $scope.newSong = '';
                        self.refresh();
                    }
                );
            };

            $scope.happy = function (item) {
                post('/reactHappy', {userId: item.user.id, trackId: item.track.id}).then(
                    function () {
                        self.refresh();
                    }
                );
            };

            $scope.sad = function (item) {
                post('/reactSad', {userId: item.user.id, trackId: item.track.id}).then(
                    function () {
                        self.refresh();
                    }
                );
            };

            $scope.isTrackPlaying = function (item) {
                return isCurrentSong(item.track.id);
            };

            $scope.playStop = function (item) {
                if ($scope.isTrackPlaying(item)) {
                    $scope.pause(item);
                } else {
                    $scope.play(item);
                }
            };

            $scope.play = function (item) {
                if (item && item.track) {
                    play(item.track.id);
                    $scope.activeSongTitle = item.track.name;
                    if (item.track.hasOwnProperty('artists') && angular.isArray(item.track.artists) && item.track.artists.length > 0) {
                        $scope.activeSongArtist = item.track.artists[0]['name'];
                    }
                }

            };

            $scope.pause = function (item) {
                if (item && item.track) {
                    pause(item.track.id);
                    $scope.activeSongTitle = "";
                    $scope.activeSongArtist = "";
                }
            };

            $scope.audio_features = function (item) {
                audio_features(item.track.id);
            };

            self.refresh();
        }

    ]);