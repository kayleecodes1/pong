var VIEWPORT_WIDTH = 1920,
    VIEWPORT_HEIGHT = 1080,
    PADDLE_WIDTH = 40,
    PADDLE_HEIGHT = 200,
    PADDLE_SPEED = 600,     // px/sec
    PADDLE_PADDING = 20,
    BALL_SIZE = 50,
    BALL_SPEED = 700,       // px/sec
    BALL_WAIT = 1000;       // ms

var PongPaddle = function ( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.speed = PADDLE_SPEED;
};
PongPaddle.prototype = {
    // Takes a direction (-1 up or 1 down) and a delta time (in ms) and moves
    // this paddle's position based on its speed. Cannot move beyond the edge
    // of the screen + padding.
    move: function ( direction, dt ) {
        var newY = this.y + direction * this.speed * ( dt / 1000 );
        var upperBound = this.height / 2 + PADDLE_PADDING;
        var lowerBound = VIEWPORT_HEIGHT - this.height / 2 - PADDLE_PADDING;
        if( newY < upperBound ) {
            this.y = upperBound;
        } else if( newY > lowerBound ) {
            this.y = lowerBound;
        } else {
            this.y = newY;
        }
    },
    // Given a ball, returns whether this paddle is colliding with that ball.
    checkCollision: function ( ball ) {
        return (Math.abs(this.x - ball.x) * 2 < (this.width + ball.size)) &&
            (Math.abs(this.y - ball.y) * 2 < (this.height + ball.size));
    },
    // Render this paddle in the given context.
    render: function ( context ) {
        context.fillStyle = '#ffffff';
        context.fillRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
    }
};

var PongBall = function ( x, y ) {
    this.waiting = 0;
    this.x = x || 0;
    this.y = y || 0;
    this.size = BALL_SIZE;
    this.speed = BALL_SPEED;
    this.xVel = this.speed;
    this.yVel = this.speed;
};
PongBall.prototype = {
    wait: function () {
        this.waiting = BALL_WAIT;
    },
    // Updates the ball's position based on its speed.
    update: function ( dt ) {
        // Waiting.
        if( this.waiting ) {
            this.waiting = Math.max( 0, this.waiting - dt );
            return;
        }
        // Movement.
        var mod = dt / 1000;
        this.x += this.xVel * mod;
        this.y += this.yVel * mod;
    },
    // Check if this ball is colliding with the bounds of the screen. Top = 1,
    // Right = 2, Bottom = 3, Left = 4. Left and right collisions are considered
    // to be offscreen while top and bottom collisions are upon contact.
    checkBoundsCollision: function () {
        if( this.waiting ) { return 0; }
        // Top.
        if( this.y <= this.size / 2 ) {
            return 1;
        // Right side
        } else if( this.x >= VIEWPORT_WIDTH + this.size / 2 ) {
            return 2;
        // Bottom.
        } else if( this.y >= VIEWPORT_HEIGHT - this.size / 2 ) {
            return 3;
        // Left side.
        } else if( this.x <= -( this.size / 2 ) ) {
            return 4;
        }
        // No collision.
        return 0;
    },
    // Render this ball in the given context.
    render: function ( context ) {
        context.fillStyle = '#ffffff';
        context.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
    }
};

var Pong = function ( element ) {

    // Create a canvas and add it to the element.
    this.canvas = document.createElement('canvas');
    element.appendChild( this.canvas );

    //TODO: use this as width and height

    this.canvas = canvas;   // The canvas element.
    this.canvas.width = this.canvas.style.width = VIEWPORT_WIDTH;
    this.canvas.height = this.canvas.style.height = VIEWPORT_HEIGHT;

    this.context = this.canvas.getContext('2d');

    this.init();
};
Pong.prototype = {

    // Set up for a new game.
    init: function () {
        this.frameRequest = null;   // The handle for the current animation frame request.
        this._dte = null;           // The time of the last update.
        this._dt = null;            // The delta time since the last update.
        this.paddle1 = new PongPaddle( PADDLE_WIDTH / 2 + PADDLE_PADDING, VIEWPORT_HEIGHT / 2 );
        this.paddle2 = new PongPaddle( VIEWPORT_WIDTH - PADDLE_WIDTH / 2 - PADDLE_PADDING, VIEWPORT_HEIGHT / 2 );
        this.ball = new PongBall( VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2 );
        this.score1 = 0;
        this.score2 = 0;
        this.start();
    },

    // Start the game loop.
    start: function () {
        if( !this.frameRequest ) {
            this._dte = Date.now();
            this._dt = 0.0001;
            this.loop();
        }
    },

    // Kill the game loop.
    kill: function () {
        if( this.frameRequest ) {
            cancelAnimationFrame( this.frameRequest );
            this.frameRequest = null;
        }
    },

    // Restart the game.
    restart: function () {
        kill();
        init();
    },

    // The game loop.
    loop: function () {

        var now = Date.now();
        this._dt = now - this._dte;
        this._dte = now;

        this.update();
        this.render();

        this.frameRequest = requestAnimationFrame( this.loop.bind( this ), this.canvas );
    },

    update: function () {

        Input.Key.update();

        // Paddle movement.
        if( Input.Key.isPressed( 'w' ) ) {
            this.paddle1.move( -1, this._dt );
        } else if( Input.Key.isPressed( 's' ) ) {
            this.paddle1.move( 1, this._dt );
        }
        if( Input.Key.isPressed( 'up arrow' ) ) {
            this.paddle2.move( -1, this._dt );
        } else if( Input.Key.isPressed( 'down arrow' ) ) {
            this.paddle2.move( 1, this._dt );
        }

        // Update the ball.
        this.ball.update( this._dt );
        // Bounds collision.
        var boundsCollision = this.ball.checkBoundsCollision();
        if( boundsCollision ) {
            if( boundsCollision === 1 || boundsCollision === 3 ) {
                this.ball.yVel = ( boundsCollision === 1 ? 1 : -1 ) * Math.abs( this.ball.yVel );
                Sound.play( 'hit' );
            } else if( boundsCollision === 2 ) {
                this.score1 += 1;
                this.ball.xVel = -Math.abs( this.ball.xVel );
                this.ball.x = VIEWPORT_WIDTH / 2;
                this.ball.y = VIEWPORT_HEIGHT / 2;
                this.ball.wait();
                Sound.play( 'score' );
            } else if( boundsCollision === 4 ) {
                this.score2 += 1;
                this.ball.xVel = Math.abs( this.ball.xVel );
                this.ball.x = VIEWPORT_WIDTH / 2;
                this.ball.y = VIEWPORT_HEIGHT / 2;
                this.ball.wait();
                Sound.play( 'score' );
            }
        }
        // Paddle collision.
        if( this.paddle1.checkCollision( this.ball ) ) {
            this.ball.xVel = Math.abs( this.ball.yVel );
            Sound.play( 'hit' );
        } else if( this.paddle2.checkCollision( this.ball ) ) {
            this.ball.xVel = -Math.abs( this.ball.yVel );
            Sound.play( 'hit' );
        }
    },

    render: function () {

        // Background
        this.context.fillStyle = '#000000';
        this.context.fillRect( 0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT );
        var DASH_WIDTH = 20,
            DASH_HEIGHT = 40,
            DASH_SPACING = 20;
        this.context.fillStyle = '#ffffff';

        var maxHeight = DASH_HEIGHT;
        while( maxHeight < VIEWPORT_HEIGHT ) { maxHeight += DASH_SPACING + DASH_HEIGHT; }

        for( var y = ( VIEWPORT_HEIGHT - maxHeight ) / 2; y < VIEWPORT_HEIGHT; y += DASH_HEIGHT + DASH_SPACING ) {
            this.context.fillRect( VIEWPORT_WIDTH / 2 - DASH_WIDTH / 2, y, DASH_WIDTH, DASH_HEIGHT );
        }
        // Paddles
        this.paddle1.render( this.context );
        this.paddle2.render( this.context );

        // Ball
        this.ball.render( this.context );

        // Score
        var PXSQR = 24;
        var score1_x = VIEWPORT_WIDTH / 2 - DASH_WIDTH / 2 - 6 * PXSQR * ( ( '' + this.score1 ).length );
        var score2_x = VIEWPORT_WIDTH / 2 + DASH_WIDTH / 2 + PXSQR;
        var score_y = PXSQR;
        drawNumber( score1_x, score_y, this.context, PXSQR, this.score1 );
        drawNumber( score2_x, score_y, this.context, PXSQR, this.score2 );
    }
};

var NUM_GRIDS = {
    0: [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    1: [[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    2: [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,1,0],[0,1,1,0,0],[1,1,1,1,1]],
    3: [[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1]],
    4: [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1]],
    5: [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1]],
    6: [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1]],
    7: [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1]],
    8: [[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1]],
    9: [[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1]]
};
var drawNumber = function ( x, y, context, pxSq, num ) {
    var nums = ('' + num ).split('');
    var accumX = x;
    var accumY = y;
    for( var i = 0; i < nums.length; i++ ) {
        var numGrid = NUM_GRIDS[ nums[ i ] ];
        for( var y = 0; y < numGrid.length; y++ ) {
            for( var x = 0; x < numGrid.length; x++ ) {
                if( numGrid[ y ][ x ] ) {
                    context.fillRect( accumX + x * pxSq, accumY + y * pxSq, pxSq, pxSq );
                }
            }
        }
        accumX += pxSq * 6;
    }
};

var element = document.getElementById( 'viewport' );
var game = new Pong( element );


/*x.directive( 'pong', function () {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            canvas: '@'
        }
    }
});*/