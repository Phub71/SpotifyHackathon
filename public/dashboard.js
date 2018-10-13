import {get, post} from "./network.js";

async function run() {
  const songs = await get('/listSongs');
  songs.tracks.map(track => {
    const trackName = $('<li>' + track.name + '</li>');
    trackName.appendTo('#top-tracks-container');
  });
}

run();
