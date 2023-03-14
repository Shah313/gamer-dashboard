import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  gameType: { type: String, required: true },

  price: { type: Number, required: true },
  photo: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const gameModel = mongoose.model("Game", GameSchema);

export default gameModel;
