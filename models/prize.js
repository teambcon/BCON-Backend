/**
 * Data model for an arcade prize.
 *
 * @author Ben Prisby (@BenPrisby).
 */

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var PrizeSchema = new Schema( {
    name : { type : String, required : true },
    description : { type : String },
    ticketCost : { type : Number, required : true },
    availableQuantity : { type : Number, required : true },
    imageData: { type : String }
} );

module.exports = mongoose.model( 'Prize', PrizeSchema );

