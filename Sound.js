var Sound = {
    _files: {
        'hit': 'hit.mp3',
        'score': 'score.mp3'
    },
    _sounds: {},
    // Convert the listing of files to Audio objects.
    init: function () {
        for( var soundName in this._files ) {
            if( this._files.hasOwnProperty( soundName ) ) {
                this._sounds[ soundName ] = new Audio( this._files[ soundName ] );
            }
        }
    },
    // Plays the sound of a given name if it is not already playing.
    play: function ( soundName ) {
        var sound = this._sounds[ soundName ];
        if( !sound.paused || !sound.currentTime ) {
            sound.currentTime = 0;
            sound.play();
        }
    }
};

Sound.init();