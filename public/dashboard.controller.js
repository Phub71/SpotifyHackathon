import {get, post} from "./network.js";

angular.module('spotifyApp')
    .controller('MainController', ['$timeout', '$scope',
        async function ($timeout, $scope) {
            var self = this;
            $scope.loading = true;

            self.refresh = function(){
                get('/listSongs').then(function(res){
                    $scope.tracks = res;
                    $scope.loading = false;
                });
            };

            $scope.addSong = function () {
                console.log(798)
            };

            $scope.findTracks = async function () {
                post('search-track', {name: $scope.newSong}).then(function(res){
                    $scope.newTracks = res;
                });
            };

            $scope.postSong = function(id){
                $scope.loading = true;
                post('/addSong', {trackId: id}).then(
                    function(){
                        $scope.loading = true;
                        $scope.newTracks = [];
                        self.refresh();
                    }
                );
            };


            self.refresh();
        }

    ]);