const express = require('express');
const path = require('path');
const db = require('./server/database');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/', express.static(path.join(__dirname, 'views'), {index: false, extensions: ['html']}));
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.use(cookieParser())
app.use(bodyParser.json());
app.use((req, resp, next) => {
  console.log("Request body:", req.body);
  console.log("Cookies:", req.cookies);
  next();
});

//-------------------------------------------------------------//
//------------- AUTHORIZATION === auth-app.js -----------------//
//-------------------------------------------------------------//

const auth_app = require('./server/auth-app');
auth_app.init(app);

var SpotifyWebApi = require('spotify-web-api-node');

// The object we'll use to interact with the API
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Using the Client Credentials auth flow, authenticate our app
spotifyApi.clientCredentialsGrant()
  .then(function (data) {

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);

  }, function (err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });

//-------------------------------------------------------------//
//------------------------- API CALLS -------------------------//
//-------------------------------------------------------------//

app.post('/addSong', async function (request, response) {
  const userId = request.cookies.user_id;
  const {trackId} = request.body;
  try {
    await db.addSong(userId, trackId);
    response.send({});
  } catch (ex) {
    response.send({error: true});
  }
  response.end();
});

app.post('/removeSong', async function (request, response) {
  const userId = request.cookies.user_id;
  const {trackId} = request.body;
  let removeSong = await db.removeSong(userId, trackId);
  response.send({});
  response.end();
});

app.post('/reactHappy', async function (request, response) {
  const {trackId, userId} = request.body;
  let reactHappy = await db.reactHappy(userId, trackId);
  response.send({});
  response.end();
});

app.post('/reactSad', async function (request, response) {
  const {trackId, userId} = request.body;
  let reactSad = await db.reactSad(userId, trackId);
  response.send({});
  response.end();
});

app.post('/createPlaylist', async function (request, response) {
  const {user_id, access_token} = request.cookies;
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  spotifyApi.setAccessToken(access_token);
  const playlist = (await spotifyApi.createPlaylist(user_id, "Hacked!")).body;

  const songs = await db.listSongs();
  const trackIds = songs.map(song => "spotify:track:" + song.track_id);
  await spotifyApi.addTracksToPlaylist(playlist.id, trackIds);

  response.send({});
  response.end();
});

app.get('/listSongs', async function (request, response) {
  const listSongs = await db.listSongs();
  const userIds = Array.from(new Set(listSongs.map(song => song.user_id)));
  const users = await Promise.all(userIds.map(async id => (await spotifyApi.getUser(id)).body));
  const tracks = (await spotifyApi.getTracks(listSongs.map(song => song.track_id))).body.tracks;


  const result = listSongs.map(({user_id, track_id, happy_emotion, sad_emotion}) => ({
    track: tracks.find(track => track.id === track_id),
    user: users.find(user => user.id === user_id),
    emotions: {
      happy: happy_emotion,
      sad: sad_emotion
    }
  }));
  response.send(result);
  response.end();
});

app.post('/search-track', async function (request, response) {
  const {name} = request.body;
  const data = await spotifyApi.searchTracks('track:' + name, {limit: 5});
  response.send(data.body.tracks.items);
  response.end();
});

//-------------------------------------------------------------//
//------------------------ WEB SERVER -------------------------//
//-------------------------------------------------------------//


// Listen for requests to our app
// We make these requests from client.js

db.create();
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// db.close();
