// // import {get, post} from "./network.js";
//
// angular.module('spotifyApp', ['ngMaterial', 'ngMessages', '$resourceProvider'])
//     .controller("MainController", [function($resource){
//
//        $resource.get();
//
//         var tracks = $resource('/listSongs',);
//         tracks.get().then(function(res) {
//            console.log(res)
//         });
//
//     }]);
//
//
//

angular.module('spotifyApp')
    .controller('MainController', [
        function () {
            console.log(1234)
            // $resource.get();
            //
            // var tracks = $resource('/listSongs',);
            // tracks.get().then(function (res) {
            //     console.log(res)
            // });


        }

    ]);