import {get, post} from "./network.js";

async function run() {
  const songs = await get('/listSongs');
  songs.map(({track, user}) => {
    const trackName = $('<li>' + user.display_name + track.name + '</li>');
    trackName.appendTo('#top-tracks-container');
  });
}

run();
