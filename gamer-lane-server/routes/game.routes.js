import express from "express";

import {
    createGame,
    deleteGame,
    getAllGames,
    getGameDetail,
    updateGame,
} from "../controllers/game.controller.js";

const router = express.Router();

router.route("/").get(getAllGames);
router.route("/:id").get(getGameDetail);
router.route("/").post(createGame);
router.route("/:id").patch(updateGame);
router.route("/:id").delete(deleteGame);

export default router;