/**
 * Main entry point for the backend, resposible for  startup and initilization tasks for modules, middleware, and the 
 * database connection.
 *
 * @author Ben Prisby (@BenPrisby).
 */

// Modules.
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const dotenv = require( 'dotenv' );
const mongoose = require( 'mongoose' );
const GameController = require( './controllers/game' );
const PlayerController = require( './controllers/player' );

// Configuration.
dotenv.config();
const port = process.env.DEV ? 3000 : ( process.env.PORT || 8080 );
const socketPort = process.env.DEV ? 3001 : ( process.env.SOCKET_PORT || 8081 );

// Routes.
const game = require( './routes/game' );
const player = require( './routes/player' );
const prize = require( './routes/prize' );

// Create the Express app.
const app = express();

// Set up another server for Socket.IO.
const server = require( 'http' ).createServer( app );
const io = require( 'socket.io' )( server );
exports.io = io;

// Start the socket server.
server.listen( socketPort, () => {
    console.log( 'Socket server started on port ' + socketPort + '.' );
} );

// Log client connections.
io.on( 'connection', ( client ) => {
    console.log( 'Client connected.' );

    // Push out the latest data for the new client.
    GameController.pushAllGames();
    PlayerController.pushAllStats();
} );

// Attempt to connect to the database.
mongoose.connect( process.env.MONGODB_URI, { useFindAndModify : false, useNewUrlParser : true, useCreateIndex : true } );
mongoose.Promise = global.Promise;

// Verify successful connection to the database.
mongoose.connection.on( 'connected', () => {
    console.log( 'Connected to database.' );
} );

// Log any database connection errors.
mongoose.connection.on( 'error', ( err ) => {
    console.log( 'Database error: ' + err );
} );

// Body Parser middleware.
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended : false } ) );

// Map routes.
app.use( '/games', game );
app.use( '/players', player );
app.use( '/prizes', prize );

// Error handler.
app.use( ( err, req, res, next ) => {
    if ( err.isServer )
    {
        console.log( err.stack );
    }

    return res.status( err.output.statusCode ).json( err.output.payload );
} );

// Index route.
app.get( '/', ( req, res ) => {
    res.status( 400 ).send( 'Invalid Endpoint' );
} );

// Unknown page route.
app.get( '*', ( req, res ) => {
    res.status( 404 ).send( '404 Not Found' );
} );

// Start the server on the configured port.
app.listen( port, () => {
    console.log( 'Server started on port ' + port + '.' );
} );

