const mongoose = require("mongoose");

const ArtifactSchema = new mongoose.Schema({
    state: String,
    estimatedLength: Number,
    image: String});

    module.exports = mongoose.model("Artifact", ArtifactSchema);