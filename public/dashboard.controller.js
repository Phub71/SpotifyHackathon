import {get, post} from "./network.js";

angular.module('spotifyApp')
    .controller('MainController', [
        async function () {

            var self = this;
            self.tracks = [];
            self.tracks = await get('/listSongs');
            console.log(self.tracks)

        }

    ]);