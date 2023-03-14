
import Game from '../mongodb/models/game.js';
import User from "../mongodb/models/user.js";

import mongoose from "mongoose";

import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllGames = async (req, res) => {
    const {
        _end,
        _order,
        _start,
        _sort,
        title_like = "",
        gameType = "",
    } = req.query;

    const query = {};

    if (gameType !== "") {
        query.gameType = gameType;
    }

    if (title_like) {
        query.title = { $regex: title_like, $options: "i" };
    }


    try {
        const count = await Game.countDocuments({ query });

        const game = await Game.find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order });

        res.header("x-total-count", count);
        res.header("Access-Control-Expose-Headers", "x-total-count");

        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGameDetail = async (req, res) => {
    const { id } = req.params;
    const gameExists = await Game.findOne({ _id: id }).populate(
        "creator",
    );

    if (gameExists) {
        res.status(200).json(gameExists);
    } else {
        res.status(404).json({ message: "Game not found" });
    }
};

const createGame = async (req, res) => {
    try {
        const {
            title,
            description,
           gameType,
            price,
            photo,
            email,
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ email }).session(session);

        if (!user) throw new Error("User not found");

        const photoUrl = await cloudinary.uploader.upload(photo);

        const newGame = await Game.create({
            title,
            description,
           gameType,
            price,
            photo: photoUrl.url,
            creator: user._id,
        });

        user.allGames.push(newGame._id);
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Game created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description,gameType,  price, photo } =
            req.body;

        const photoUrl = await cloudinary.uploader.upload(photo);

        await Game.findByIdAndUpdate(
            { _id: id },
            {
                title,
                description,
               gameType,
            
                price,
                photo: photoUrl.url || photo,
            },
        );

        res.status(200).json({ message: "Game updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteGame = async (req, res) => {
    try {
        const { id } = req.params;

        const gameToDelete = await Game.findById({ _id: id }).populate(
            "creator",
        );

        if (!gameToDelete) throw new Error("Game not found");

        const session = await mongoose.startSession();
        session.startTransaction();

       gameToDelete.remove({ session });
       gameToDelete.creator.allGames.pull(gameToDelete);

        await gameToDelete.creator.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: "Game deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllGames,
    getGameDetail,
    createGame,
    updateGame,
    deleteGame,
};