const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  dest:"public/uploads/"
});

const artifactsController = require("../controllers/artifacts");
const { ensureAuth } = require("../middleware/auth");
const Artifact = require("../models/Artifact");
const PointType = require("../models/PointType");

router.get("/", ensureAuth, artifactsController.getArtifacts);


// upload.single() handles image upload. req.file contains uploaded image. req.body contains state and length, Artifact.crete() saves Mongo document.//
router.post(
  "/",
  upload.single("artifactImage"),
  async (req, res) => {

    try {
      
      const artifact =
        await Artifact.create({

          state: req.body.state,

          estimatedLength:
            req.body.estimatedLength,

          image: req.file
            ? req.file.filename
            : null

        });
const length = Number(artifact.estimatedLength);

const matches = await PointType.find({
  states: artifact.state,
  "averageLength.min": { $lte: length },
  "averageLength.max": { $gte: length }
});
    // averageLength: {
    //   $gte: artifact.estimatedLength - 1,
    //   $lte: artifact.estimatedLength + 1
    // }


  

      res.render("show", {

  artifact,

  matches

});

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);




router.get("/:id", async (req, res) => {

  try {

    const artifact =
      await Artifact.findById(req.params.id);
  
      if(!artifact){
        return res.status(404).send("Artifact not found");
      }
const length = Number(artifact.estimatedLength);
const matches = await PointType.find({
  states: artifact.state,
  "averageLength.min": { $lte: length },
  "averageLength.max": { $gte: length }
});

    res.render("show", {artifact,matches});

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

router.put("/:id", async (req, res) => {
  try {

    const updatedArtifact =
      await Artifact.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(updatedArtifact);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

router.delete("/:id", async (req, res) => {
  try {

    await Artifact.findByIdAndDelete(req.params.id);

    res.json({
      message: "Artifact deleted"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
});

module.exports = router;