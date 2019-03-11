/**
 * Routes for an arcade game.
 *
 * @author Ben Prisby (@BenPrisby).
 */

const express = require( 'express' );
const router = express.Router();

const gameController = require( '../controllers/game' );

router.post( '/create', gameController.createGame );
router.get( '/', gameController.getAllGames );
router.get( '/:id', gameController.getGame );
router.put( '/:id/update', gameController.updateGame );
router.delete( '/:id/delete', gameController.deleteGame );

module.exports = router;

