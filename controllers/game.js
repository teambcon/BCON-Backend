/**
 * Controller for an arcade game.
 *
 * @author Ben Prisby (@BenPrisby).
 */

const boom = require( 'boom' );
const Game = require( '../models/game' );
const ObjectId = require( 'mongoose' ).Types.ObjectId;
const Server = require( '../server' );

// Common error messages.
const errorBadId = 'The specified ID is invalid!';
const errorNotFound = 'Could not find a game with the specified ID!';

exports.createGame = ( req, res, next ) => {
    // Ensure the required properties were given.
    if ( req.body.name && req.body.tokenCost )
    {
        var newGame = new Game(
            {
                name : req.body.name,
                tokenCost : req.body.tokenCost
            }
        );

        // Attempt to save the new game to the database.
        newGame.save( ( err ) => {
            if ( err )
            {
                // Server error.
                return next( boom.badImplementation( err ) );
            }

            // Respond with the new game object.
            pushGames();
            res.json( newGame );
        } );
    }
    else
    {
        // Missing properties.
        return next( boom.badRequest( 'Both a name and token cost are required to create a game!' ) );
    }
};

exports.getGame = ( req, res, next ) => {
    // Ensure the ObjectId is valid.
    if ( ObjectId.isValid( req.params.id ) )
    {
        // Attempt to look up the game in the database with the specified ID.
        Game.findById( req.params.id, ( err, game ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }
            else if ( null === game )
            {
                // No game with this ID was found in the database.
                return next( boom.badRequest( errorNotFound ) );
            }

            // Respond with the retrieved game object.
            res.json( game );
        } );
    }
    else
    {
        // Invalid ObjectId.
        return next( boom.badRequest( errorBadId ) );
    }
};

exports.getAllGames = ( req, res, next ) => {
    // Query the database for all documents in the games collection.
    Game.find( {}, ( err, games ) => {
        if ( err )
        {
            return next( boom.badImplementation( err ) );
        }

        // Construct an empty array to store the games in.
        var gameArray = [];

        // Push each game onto the array.
        games.forEach( ( game ) => {
            gameArray.push( game );
        } );

        // Respond with the completed array.
        res.json( { "games" : gameArray } );
    } );
};

var pushGames = exports.pushAllGames = () => {
    // Query the database for all documents in the games collection.
    Game.find( {}, ( err, games ) => {
        if ( err )
        {
            console.log( err );
        }
        else
        {
            // Construct an empty array to store the games in.
            var gameArray = [];

            // Push each game onto the array.
            games.forEach( ( game ) => {
                gameArray.push( game );
            } );

            // Notify connected clients of the new data.
            if ( 0 < gameArray.length )
            {
                Server.io.emit( 'games', { "games" : gameArray } );
            }
        }
    } );
};

exports.updateGame = ( req, res, next ) => {
    if ( ObjectId.isValid( req.params.id ) )
    {
        // Attempt to find and update the game with any body parameters, returning the new document.
        Game.findByIdAndUpdate( req.params.id, { $set : req.body }, { new : true }, ( err, game ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }
            else if ( null === game )
            {
                return next( boom.badRequest( errorNotFound ) );
            }

            pushGames();
            res.json( game );
        } );
    }
    else
    {
        return next( boom.badRequest( errorBadId ) );
    }
};

exports.deleteGame = ( req, res, next ) => {
    if ( ObjectId.isValid( req.params.id ) )
    {
        // Attempt to remove the game with the specified ID from the database.
        Game.findByIdAndRemove( req.params.id, ( err ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }

            // Respond with a confirmation.
            pushGames();
            res.send( 'Deleted game ' + req.params.id + '.' );
        } );
    }
    else
    {
        return next( boom.badRequest( errorBadId ) );
    }
};

