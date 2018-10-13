const express = require('express');
const path = require('path');
const db = require('./server/database');

require('dotenv').config();
const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'views'),{index:false,extensions:['html']}));
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

//-------------------------------------------------------------//
//------------- AUTHORIZATION === auth-app.js -----------------//
//-------------------------------------------------------------//

const auth_app = require('./server/auth-app');
auth_app.init(app);

//-------------------------------------------------------------//
//------------------------- API CALLS -------------------------//
//-------------------------------------------------------------//


app.get('/search-track', function (request, response) {

  // Search for a track!
  spotifyApi.searchTracks('track:Hey Jude', {limit: 1})
    .then(function(data) {

      // Send the first (only) track object
      response.send(data.body.tracks.items[0]);

    }, function(err) {
      console.error(err);
    });
});


app.get('/category-playlists', function (request, response) {

  // Get playlists from a browse category
  // Find out which categories are available here: https://beta.developer.spotify.com/console/get-browse-categories/
  spotifyApi.getPlaylistsForCategory('jazz', { limit : 5 })
    .then(function(data) {

      // Send the list of playlists
      response.send(data.body.playlists);

    }, function(err) {
      console.error(err);
    });
});

app.get('/audio-features', function (request, response) {

  // Get the audio features for a track ID
  spotifyApi.getAudioFeaturesForTrack('4uLU6hMCjMI75M1A2tKUQC')
    .then(function(data) {

      //Send the audio features object
      response.send(data.body);

    }, function(err) {
      console.error(err);
    });
});

app.get('/artist', function (request, response) {

  // Get information about an artist
  spotifyApi.getArtist('6jJ0s89eD6GaHleKKya26X')
    .then(function(data) {

      // Send the list of tracks
      response.send(data.body);

    }, function(err) {
      console.error(err);
    });
});

app.get('/artist-top-tracks', function (request, response) {

  // Get an artist's top tracks in a country
  spotifyApi.getArtistTopTracks('5Wfz1wnIoo4xSsP1KQ7Gr1', 'US')
    .then(function(data) {

      // Send the list of tracks
      response.send(data.body.tracks);

    }, function(err) {
      console.error(err);
    });
});


//-------------------------------------------------------------//
//------------------------ WEB SERVER -------------------------//
//-------------------------------------------------------------//


// Listen for requests to our app
// We make these requests from client.js

async function testDb() {
  db.create();
  await db.addSong(10, 10);
  await db.reactHappy(10,10);
  const songs = await db.listSongs();
  console.log(songs);
  console.log(songs.map(song => song.track_id));

  db.close();
}

testDb();
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
