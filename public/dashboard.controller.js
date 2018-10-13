import {get, post} from "./network.js";
import {play} from "./player.js";

angular.module('spotifyApp')
    .controller('MainController', ['$timeout', '$scope',
        async function ($timeout, $scope) {
            var self = this;

            self.refresh = function(){
                $scope.loading = true;
                get('/listSongs').then(function(res){
                    $scope.tracks = res;
                    $scope.loading = false;
                });
            };

            $scope.searchForSong = function(){
                $scope.findTracks();
            };

            $scope.findTracks = function () {
                $scope.loading = true;
                post('search-track', {name: $scope.newSong}).then(function(res){
                    $scope.newTracks = res;
                    $scope.loading = false;
                });
            };

            $scope.postSong = function(id){
                post('/addSong', {trackId: id}).then(
                    function(){
                        $scope.newTracks = [];
                        $scope.newSong = '';
                        self.refresh();
                    }
                );
            };

            $scope.happy = function(item){
                post('/reactHappy', {userId: item.user.id, trackId: item.track.id}).then(
                    function(){
                        self.refresh();
                    }
                );
            };

            $scope.sad= function(item){
                post('/reactSad', {userId: item.user.id, trackId: item.track.id}).then(
                    function(){
                        self.refresh();
                    }
                );
            };

            $scope.play = function(item){
                play(item.track.id);
            };


            self.refresh();
        }

    ]);