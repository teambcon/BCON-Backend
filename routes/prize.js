/**
 * Routes for an arcade prize.
 *
 * @author Ben Prisby (@BenPrisby).
 */

var express = require( 'express' );
var router = express.Router();

var prizeController = require( '../controllers/prize' );

router.post( '/create', prizeController.createPrize );
router.get( '/', prizeController.getAllPrizes );
router.get( '/:id', prizeController.getPrize );
router.put( '/:id/update', prizeController.updatePrize );
router.post( '/:id/redeem', prizeController.redeemPrize );
router.delete( '/:id/delete', prizeController.deletePrize );

module.exports = router;

