import {splash} from "./background.js";
import {get, post} from "./network.js";
import {play, pause, isCurrentSong, audio_features} from "./player.js";

function hashCode(str) {
    str = str + "";
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function random(seed) {
    seed = hashCode(seed);
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getSongPopularity(song) {
  return song.emotions.happy - song.emotions.sad;
}

function filterSongs(songs) {
  const maxSongs = 18;
  if(songs.length <= maxSongs) return songs;
  let songsByPopulaity = songs.slice();
  songsByPopulaity.sort((a,b)=>getSongPopularity(b)-getSongPopularity(a));
  songsByPopulaity = songsByPopulaity.slice(0, maxSongs);

  for(let i = 0; i < maxSongs; i++) {
    const song = songs[i];
    const isPopular = songsByPopulaity.indexOf(song) !== -1;
    if(isPopular) continue;

    for(let j = maxSongs; j < songs.length; j++) {
      const newSong = songs[j];
      const isPopular = songsByPopulaity.indexOf(newSong) !== -1;
      if(!isPopular) continue;
      songs[i] = newSong;
      songs[j] = song;
      break;
    }
  }
  return songs.slice(0,maxSongs);
}

angular.module('spotifyApp')
    .controller('MainController', ['$timeout', '$scope', '$mdToast',
        function ($timeout, $scope, $mdToast) {
            var self = this;
            self.backgroundColors = ["#19d06ea0", "#c1d019a0", "#d01919a0", "#19d03ca0", "rgba(250, 66, 167, 0.8)", "#ab0c0cc6", "#0cab8e96", "#9cf3e396", "#ea9cf396"];
            $scope.isPlaying = false;
            $scope.lastActiveTrack = null;

            self.refresh = function () {
                $scope.loading = true;
                $scope.get('/listSongs').then(function (res) {
                    res = filterSongs(res);
                    angular.forEach(res, function (value) {
                        const rotation = (random(value.track.id) - .5) * 20;
                        value['style'] = {
                            'background': self.backgroundColors[Math.floor(random(value.track.album.id) * self.backgroundColors.length)],
                            'transform': 'rotate(' + rotation + 'deg)',
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
                splash();
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
                splash();
                post('/reactHappy', {userId: item.user.id, trackId: item.track.id}).then(
                    function () {
                        self.refresh();
                    }
                );
            };

            $scope.sad = function (item) {
                splash();
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
                if (item) {
                    if ($scope.isTrackPlaying(item)) {
                        $scope.pause(item);
                    } else {
                        $scope.play(item);
                    }
                }
            };

            $scope.playerButton = function () {
                if ($scope.isPlaying) {
                    $scope.pause($scope.lastActiveTrack);
                } else {
                    $scope.play($scope.lastActiveTrack);
                }
            };

            $scope.play = function (item) {
                if (item && item.track) {
                    $scope.lastActiveTrack = item;
                    $scope.isPlaying = true;
                    play(item.track.id);
                }

            };

            $scope.pause = function (item) {
                if (item && item.track) {
                    $scope.isPlaying = false;
                    pause(item.track.id);
                }
            };

            $scope.newPlaylist = function () {
                post('/createPlaylist').then(
                    function () {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Check your library now!')
                                .position('top right')
                                .hideDelay(1000)
                        );
                    }
                );
            };

            $scope.audio_features = function (item) {
                audio_features(item.track.id);
            };

            self.refresh();
        }

    ]);