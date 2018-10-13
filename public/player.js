const {access_token, user_id} = document.cookie.split(';').reduce((acc, token) => {
    const [key, value] = token.split('=');
    acc[key.trim()] = value.trim();
    return acc;
}, {});

let deviceId;
let currentState;

window.onSpotifyPlayerAPIReady = () => {
    const player = new Spotify.Player({
        name: 'Web Playback SDK Template',
        getOAuthToken: cb => { cb(access_token); }
    });

    // Error handling
    player.on('initialization_error', e => console.error(e));
    player.on('authentication_error', e => console.error(e));
    player.on('account_error', e => console.error(e));
    player.on('playback_error', e => console.error(e));

    // Playback status updates
    player.on('player_state_changed', state => {
        console.log(state);
      currentState = state;
        $('#current-track').attr('src', state.track_window.current_track.album.images[0].url);
        $('#current-track-name').text(state.track_window.current_track.name);
    });

    // Ready
    player.on('ready', data => {
        console.log('Ready with Device ID', data.device_id);

        // Play a track using our new device ID
        deviceId = data.device_id;
    });

    // Connect to the player!
    player.connect();
};

// Play a specified track on the Web Playback SDK's device ID
export function play(uri) {
    if(!deviceId) {
        console.error("Awaiting device id");
        return;
    }
    const data = {};
    if(uri !== getCurrentTrackId())
        data.uris = ["spotify:track:" + uri];

    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId,
        type: "PUT",
        data: JSON.stringify(data),
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + access_token );},
        success: function(data) {
            console.log(data)
        }
    });
}

function getCurrentTrackId() {
    if(currentState && currentState.track_window && currentState.track_window.current_track) {
        const track = currentState.track_window.current_track;
        if(track.linked_from.id) return track.linked_from.id;
        return track.id;
    };
}

export function isCurrentSong(id) {
    return currentState && !currentState.paused && getCurrentTrackId() === id;
}

export function pause(uri) {
    if(!deviceId) {
        console.error("Awaiting device id");
        return;
    }


    const data = {
        uris: ["spotify:track:" + uri]
    };

    $.ajax({
        url: "https://api.spotify.com/v1/me/player/pause?device_id=" + deviceId,
        type: "PUT",
        data: JSON.stringify(data),
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + access_token );},
        success: function(data) {
            console.log(data)
        }
    });
}
