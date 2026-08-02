const mongoose = require("mongoose");

const PointTypeSchema = new mongoose.Schema({

  name: String,

  states: [String],

  averageLength: {
    min: Number,
    max: Number
  },

  culture: String,

  ageRange: String,

  description: String,

  image: String

});

module.exports =
  mongoose.model("PointType", PointTypeSchema);