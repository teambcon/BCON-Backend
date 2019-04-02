/**
 * Controller for an arcade player.
 *
 * @author Ben Prisby (@BenPrisby).
 */

const boom = require( 'boom' );
const Game = require( '../models/game' );
const ObjectId = require( 'mongoose' ).Types.ObjectId;
const Player = require( '../models/player' );

// Common error messages.
const errorBadId = 'The specified ID is invalid!';
const errorNotFound = 'Could not find a player with the specified ID!';

exports.createPlayer = ( req, res, next ) => {
    // Ensure the required properties were given.
    if ( req.body.playerId && req.body.firstName && req.body.lastName && req.body.screenName )
    {
        var newPlayer = new Player(
            {
                playerId : req.body.playerId,
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                screenName : req.body.screenName,
                tokens : 0,
                tickets : 0
            }
        );

        // Attempt to save the new player to the database.
        newPlayer.save( ( err ) => {
            if ( err )
            {
                // Server error.
                return next( boom.badImplementation( err ) );
            }

            // Respond with the new player object.
            res.json( newPlayer );
        } );
    }
    else
    {
        // Missing properties.
        return next( boom.badRequest( 'A player ID, first name, last name, and screen name are required to create a player!' ) );
    }
};

exports.getPlayer = ( req, res, next ) => {
    // Attempt to look up the player in the database with the specified ID.
    Player.findOne( { playerId : req.params.id }, ( err, player ) => {
        if ( err )
        {
            return next( boom.badImplementation( err ) );
        }
        else if ( null === player )
        {
            // No player with this ID was found in the database.
            return next( boom.badRequest( errorNotFound ) );
        }

        // Respond with the retrieved player object.
        res.json( player );
    } );
};

exports.getAllPlayers = ( req, res, next ) => {
    // Query the database for all documents in the players collection.
    Player.find( {}, ( err, players ) => {
        if ( err )
        {
            return next( boom.badImplementation( err ) );
        }

        // Construct an empty array to store the players in.
        var playerArray = [];

        // Push each game onto the array.
        players.forEach( ( player ) => {
            playerArray.push( player );
        } );

        // Respond with the completed array.
        res.json( { "players" : playerArray } );
    } );
};

exports.updatePlayer = ( req, res, next ) => {
    // Ensure game stats are not attempting to be updated.
    if ( !req.body.gameStats )
    {
        // Attempt to find and update the game with any body parameters, returning the new document.
        Player.findOneAndUpdate( { playerId : req.params.id }, { $set : req.body }, { new : true }, ( err, player ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }
            else if ( null === player )
            {
                return next( boom.badRequest( errorNotFound ) );
            }

            res.json( player );
        } );
    }
    else
    {
        // Do not allow updating game stats in this function.
        return next( boom.badRequest( 'Cannot update game stats through this request!' ) );
    }
};

exports.publishStats = ( req, res, next ) => {
    if ( req.body.gameId && req.body.ticketsEarned && req.body.highScore )
    {
        Player.findOne( { playerId : req.params.id }, ( err, player ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }
            else if ( null === player )
            {
                return next( boom.badRequest( errorNotFound ) );
            }

            // Update the ticket balance for the user.
            player.tickets += Number( req.body.ticketsEarned );

            // Check if the user already has a record for this game.
            var found = false;
            for ( var i = 0; i < player.gameStats.length; i++ )
            {
                if ( player.gameStats[ i ].gameId.equals( req.body.gameId ) )
                {
                    // Existing record for this game, append the ticket and gameplay information.
                    player.gameStats[ i ].ticketsEarned += Number( req.body.ticketsEarned );
                    player.gameStats[ i ].gamesPlayed++;

                    // Update the saved high score if it has improved.
                    if ( player.gameStats[ i ].highScore < req.body.highScore )
                    {
                        player.gameStats[ i ].highScore = req.body.highScore;
                    }

                    found = true;
                    break;
                }
            }

            // Append a new game entry if the player has no record for this game.
            if ( !found )
            {
                player.gameStats.push(
                    {
                        gameId : req.body.gameId,
                        ticketsEarned : req.body.ticketsEarned,
                        gamesPlayed : 1,
                        highScore : req.body.highScore
                    }
                );
            }

            // Attempt to commit the stats to the database.
            player.save( ( err ) => {
                if ( err )
                {
                    return next( boom.badImplementation( err ) );
                }

                res.json( player );
            } );
        } );
    }
    else
    {
        return next( boom.badRequest( 'Game ID, tickets earned, and high score are required to publish stats!' ) );
    }
};

exports.deletePlayer = ( req, res, next ) => {
    // Attempt to remove the player with the specified ID from the database.
    Player.findOneAndRemove( { playerId : req.params.id }, ( err ) => {
        if ( err )
        {
            return next( boom.badImplementation( err ) );
        }

        // Respond with a confirmation.
        res.send( 'Deleted player ' + req.params.id + '.' );
    } );
};

