/**
 * Routes for an arcade player.
 *
 * @author Ben Prisby (@BenPrisby).
 */

var express = require( 'express' );
var router = express.Router();

var playerController = require( '../controllers/player' );

router.post( '/create', playerController.createPlayer );
router.get( '/', playerController.getAllPlayers );
router.get( '/:id', playerController.getPlayer );
router.put( '/:id/update', playerController.updatePlayer );
router.post( '/:id/publishstats', playerController.publishStats );
router.delete( '/:id/delete', playerController.deletePlayer );

module.exports = router;

