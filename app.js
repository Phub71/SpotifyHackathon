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

var SpotifyWebApi = require('spotify-web-api-node');

// The object we'll use to interact with the API
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET
});

// Using the Client Credentials auth flow, authenticate our app
spotifyApi.clientCredentialsGrant()
  .then(function(data) {

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);

  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });

//-------------------------------------------------------------//
//------------------------- API CALLS -------------------------//
//-------------------------------------------------------------//

app.get ('/addSong', async function (request, response){
  const body = JSON.parse(request.body);
  await db.addSong(body.user_id, body.track_id);
  response.send('ok');
});

app.get ('/removeSong', async function (request, response){
    var user_id = await spotifyApi.getUser('jy0brm5nucctbr6sp5v2mjc64');
    var track_id = await spotifyApi.getTrack('3kpYJjvM8Ja6btr5hEJLWc');
    let removeSong = await db.removeSong(user_id, track_id);
    response.send(removeSong);
});

app.get ('reactHappy', async function (){
    var user_id = await spotifyApi.getUser('jy0brm5nucctbr6sp5v2mjc64');
    var track_id = await spotifyApi.getTrack('3kpYJjvM8Ja6btr5hEJLWc');
    let reactHappy = await db.reactHappy(user_id,track_id);
    response.send(reactHappy);
});

app.get ('reactSad', async function (){
    var user_id = await spotifyApi.getUser('jy0brm5nucctbr6sp5v2mjc64');
    var track_id = await spotifyApi.getTrack('3kpYJjvM8Ja6btr5hEJLWc');
    let reactSad = await db.reactSad(user_id,track_id);
    response.send(reactSad);
});

app.get ('/listSongs', async function (request, response){
  let listSongs = await db.listSongs();

  const users = await Promise.all(listSongs.map(async song => (await spotifyApi.getUser(song.user_id)).body));
  const tracks = (await spotifyApi.getTracks(listSongs.map(song => song.track_id))).body.tracks;
  const result = {
    users, tracks
  };
  response.send(result);
  response.end();
});

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
  await db.addSong('jy0brm5nucctbr6sp5v2mjc64', '3kpYJjvM8Ja6btr5hEJLWc');
  const songs = await db.listSongs();
  console.log(songs);
  console.log(songs.map(song => song.track_id));

}

db.create();

testDb();
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// db.close();
