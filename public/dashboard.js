import {get, post} from "./network.js";
import {play} from "./player.js";

async function run() {
  const songs = await get('/listSongs');
  songs.map(({track, user}) => {
    const trackName = $('<li>' + user.display_name + track.name + '</li>');
    trackName.on('click', ()=>play(track.id));
    trackName.appendTo('#top-tracks-container');
  });
}

run();
