import {get, post} from "./network.js";
import {play,pause} from "./player.js";

angular.module('spotifyApp')
    .controller('MainController', ['$timeout', '$scope',
        function ($timeout, $scope) {
            var self = this;
            $scope.isPlaying = false;

            self.refresh = function(){
                $scope.loading = true;
              $scope.get('/listSongs').then(function(res){
                    $scope.tracks = res;
                    $scope.loading = false;
                });
            };
          $scope.get = function(url) {
            return get(url).then((data)=>{
              $timeout(1, ()=>$scope.apply());
              return data
            })
          };
          $scope.post = function(url, data) {
            return post(url, data).then((data)=>{
              $timeout(1, ()=>$scope.apply());
              return data
            })
          };
            $scope.searchForSong = function(){
                $scope.findTracks();
            };

            $scope.findTracks = function () {
                $scope.loading = true;
              $scope.post('search-track', {name: $scope.newSong}).then(function(res){
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

            $scope.playStop = function(item){
                if ($scope.isPlaying){
                    $scope.pause(item);
                }else{
                    $scope.play(item);
                }
            };

            $scope.play = function(item){
                play(item.track.id);
                $scope.isPlaying = true;
            };

            $scope.pause = function (item) {
                pause(item.track.id);
                $scope.isPlaying = false;
            };

            self.refresh();
        }

    ]);