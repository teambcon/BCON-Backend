/**
 * Controller for an arcade prize.
 *
 * @author Ben Prisby (@BenPrisby).
 */

const boom = require( 'boom' );
const ObjectId = require( 'mongoose' ).Types.ObjectId;
const Player = require( '../models/player' );
const Prize = require( '../models/prize' );

// Common error messages.
const errorBadId = 'The specified ID is invalid!';
const errorNotFound = 'Could not find a prize with the specified ID!';

exports.createPrize = ( req, res, next ) => {
    // Ensure the required properties were given.
    if ( req.body.name && req.body.ticketCost && req.body.availableQuantity )
    {
        var newPrize = new Prize(
            {
                name : req.body.name,
                ticketCost : req.body.ticketCost,
                availableQuantity : req.body.availableQuantity
            }
        );

        // Check if an optional description was supplied.
        if ( req.body.description )
        {
            newPrize.description = req.body.description;
        }

        // Check if an optional image was supplied.
        if ( req.body.image )
        {
            newPrize.image = req.body.image;
        }

        // Attempt to save the new prize to the database.
        newPrize.save( ( err ) => {
            if ( err )
            {
                // Server error.
                return next( boom.badImplementation( err ) );
            }

            // Respond with the new prize object.
            res.json( newPrize );
        } );
    }
    else
    {
        // Missing properties.
        return next( boom.badRequest( 'A name, ticket cost, and quantity are required to create a prize!' ) );
    }
};

exports.getPrize = ( req, res, next ) => {
    // Ensure the ObjectId is valid.
    if ( ObjectId.isValid( req.params.id ) )
    {
        // Attempt to look up the prize in the database with the specified ID.
        Prize.findById( req.params.id, ( err, prize ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }
            else if ( null === prize )
            {
                // No prize with this ID was found in the database.
                return next( boom.badRequest( errorNotFound ) );
            }

            // Respond with the retrieved prize object.
            res.json( prize );
        } );
    }
    else
    {
        // Invalid ObjectId.
        return next( boom.badRequest( errorBadId ) );
    }
};

exports.getAllPrizes = ( req, res, next ) => {
    // Query the database for all documents in the prizes collection.
    Prize.find( {}, ( err, prizes ) => {
        if ( err )
        {
            return next( boom.badImplementation( err ) );
        }

        // Construct an empty array to store the prizes in.
        var prizeArray = [];

        // Push each prize onto the array.
        prizes.forEach( ( prize ) => {
            prizeArray.push( prize );
        } );

        // Respond with the completed array.
        res.json( { "prizes" : prizeArray } );
    } );
};

exports.updatePrize = ( req, res, next ) => {
    if ( ObjectId.isValid( req.params.id ) )
    {
        // Attempt to find and update the game with any body parameters, returning the new document.
        Prize.findByIdAndUpdate( req.params.id, { $set : req.body }, { new : true }, ( err, prize ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }

            res.json( prize );
        } );
    }
    else
    {
        return next( boom.badRequest( errorBadId ) );
    }
};

exports.redeemPrize = ( req, res, next ) => {
    if ( ObjectId.isValid( req.params.id ) && req.body.playerId )
    {
        Prize.findById( req.params.id, ( err, prize ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }
            else if ( null === prize )
            {
                return next( boom.badRequest( errorNotFound ) );
            }

            // Ensure the prize is in stock before continuing.
            if ( 0 < prize.availableQuantity )
            {
                // Prize is in stock, look up the player redeeming the prize.
                Player.findOne( { playerId : req.body.playerId }, ( err, player ) => {
                    if ( err )
                    {
                        return next( boom.badImplementation( err ) );
                    }
                    else if ( null === player )
                    {
                        return next( boom.badRequest( errorNotFound ) );
                    }

                    // Ensure the player has earned enough tickets to get this prize.
                    if ( 0 <= ( player.tickets - prize.ticketCost ) )
                    {
                        // Enough tickets, deduct the prize cost and available quantity.
                        player.tickets -= prize.ticketCost;
                        prize.availableQuantity--;

                        // Attempt to commit the new ticket balance to the database.
                        player.save( ( err ) => {
                            if ( err )
                            {
                                return next( boom.badImplementation( err ) );
                            }

                            // Attempt to commit the prize quantity deduction to the database.
                            prize.save( ( err ) => {
                                if ( err )
                                {
                                    return next( boom.badImplementation( err ) );
                                }
                                else
                                {
                                    res.json( prize );
                                }
                            } );
                        } );
                    }
                    else
                    {
                        return next( boom.forbidden( 'Player ' + player.screenName
                            + ' does not have enough tickets to redeem prize ' + prize.name + '!' ) );
                    }
                } );
            }
            else
            {
                // Prize is out of stock.
                return next( boom.forbidden( 'Tried to redeem prize ' + prize.name + ' which is out of stock!' ) );
            }
        } );
    }
    else
    {
        return next( boom.badRequest( errorBadId ) );
    }
};

exports.deletePrize = ( req, res, next ) => {
    if ( ObjectId.isValid( req.params.id ) )
    {
        // Attempt to remove the prize with the specified ID from the database.
        Prize.findByIdAndRemove( req.params.id, ( err ) => {
            if ( err )
            {
                return next( boom.badImplementation( err ) );
            }

            // Respond with a confirmation.
            res.send( 'Deleted prize ' + req.params.id + '.' );
        } );
    }
    else
    {
        return next( boom.badRequest( errorBadId ) );
    }
};

