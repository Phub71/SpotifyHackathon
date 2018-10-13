import {get, post} from "./network.js";
import {play} from "./player.js";

async function run() {
  const songs = await get('/listSongs');
  songs.map(({track, user, emotions}) => {
    const trackName = $(`
    <li>
        <button>${user.display_name}</button>
        <button class="track">${track.name}</button>
        <button class="happy">Love: ${emotions.happy}</button>
        <button class="sad">Cry: ${emotions.sad}</button>
        <button class="remove">X</button>
    </li>`);
    trackName.find('.track').on('click', () => play(track.id));
    trackName.find('.happy').on('click', () => post('/reactHappy', {trackId: track.id, userId: user.id}));
    trackName.find('.sad').on('click', () => post('/reactSad', {trackId: track.id, userId: user.id}));
    trackName.find('.remove').on('click', () => post('/removeSong', {trackId: track.id}));
    trackName.appendTo('#top-tracks-container');
  });
}

run();
