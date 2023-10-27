const mongoose = require("mongoose");

const GamedataSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [
      true,
      "GamedataID not correctly assigned. User gamedata could not be correctly created",
    ],
  },
  iron: {
    type: [Number],
    default: [1, 2, 3],
    immutable: true,
  },
  stone: {
    type: [Number],
    default: [5, 10, 15],
    immutable: true,
  },
});

const Gamedata = mongoose.model("UserGamedata", GamedataSchema);
module.exports = Gamedata;
