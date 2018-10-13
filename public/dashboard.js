$(function() {


    $.get('/tracks', function(data) {
        // Display the audio features
        data.map(function(track, i) {
            console.log(track)
            var trackName = $('<li>' + track.name + '</li>');
            trackName.appendTo('#top-tracks-container');
        });



    });





});
