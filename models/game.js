/**
 * Data model for an arcade game.
 *
 * @author Ben Prisby (@BenPrisby).
 */

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var GameSchema = new Schema( {
    name : { type : String, required : true },
    tokenCost : { type : Number, required : true },
    topPlayer : { type : String }
} );

module.exports = mongoose.model( 'Game', GameSchema );

