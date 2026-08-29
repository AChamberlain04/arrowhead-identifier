const mongoose = require("mongoose");

const artifactSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true
  },

  estimatedLength: {
    type: Number,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  identification: {
    type: String
  }
});

module.exports = mongoose.model("Artifact", artifactSchema);