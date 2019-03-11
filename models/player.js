/**
 * Data model for an arcade customer (player).
 *
 * @author Ben Prisby (@BenPrisby).
 */

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var PlayerSchema = new Schema( {
    firstName : { type : String, required : true },
    lastName : { type : String, required : true },
    screenName : { type : String, required : true, unique: true },
    tickets : { type : Number, required : true },
    gameStats : [ { gameId : ObjectId, ticketsEarned : Number, gamesPlayed : Number, highScore : Number } ]
} );

module.exports = mongoose.model( 'Player', PlayerSchema );

