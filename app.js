const express = require('express');
const path = require('path');
const db = require('./server/database');
const bodyParser = require('body-parser');

require('dotenv').config();
const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/', express.static(path.join(__dirname, 'views'),{index:false,extensions:['html']}));
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.use(bodyParser.json());
app.use((req, resp, next) => {
  console.log("Request body:", req.body);
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
  const userId = 'jy0brm5nucctbr6sp5v2mjc64';
  const {trackId} = request.body;
  await db.addSong(userId, trackId);
  response.send({});
  response.end();
});

app.post('/removeSong', async function (request, response) {
  const userId = 'jy0brm5nucctbr6sp5v2mjc64';
  const {trackId} = request.body;
  let removeSong = await db.removeSong(userId, trackId);
  response.send({});
  response.end();
});

app.post('reactHappy', async function (request, response) {
  const userId = 'jy0brm5nucctbr6sp5v2mjc64';
  const {trackId} = request.body;
  let reactHappy = await db.reactHappy(userId, trackId);
  response.send({});
  response.end();
});

app.post('reactSad', async function (request, response) {
  const userId = 'jy0brm5nucctbr6sp5v2mjc64';
  const {trackId} = request.body;
  let reactSad = await db.reactSad(userId, trackId);
  response.send({});
  response.end();
});

app.get('/listSongs', async function (request, response) {
  const listSongs = await db.listSongs();
  const users = await Promise.all(listSongs.map(async song => (await spotifyApi.getUser(song.user_id)).body));
  const tracks = (await spotifyApi.getTracks(listSongs.map(song => song.track_id))).body.tracks;
  const result = {users, tracks};
  response.send(result);
  response.end();
});

app.post('/search-track', async function (request, response) {
  const {name} = request.body;
  const data = await spotifyApi.searchTracks('track:' + name, {limit: 10});
  response.send(data.body.tracks.items);
  response.end();
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
