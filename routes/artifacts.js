const express = require("express");
const router = express.Router();

const multer = require("multer");
const streamifier = require("streamifier");

const cloudinary = require("../config/cloudinary");
const openai = require("../config/openai");

const artifactsController = require("../controllers/artifacts");
const { ensureAuth } = require("../middleware/auth");

const Artifact = require("../models/Artifact");
const PointType = require("../models/PointType");

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Unsupported image type"), false);
    }

    cb(null, true);
  }
});

const convert = require("heic-convert");


// ===============================
// GET ARTIFACTS
// ===============================

router.get("/", ensureAuth, artifactsController.getArtifacts);


// ===============================
// UPLOAD ARTIFACT
// ===============================

router.post(
  "/",
  upload.single("artifactImage"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          error: "No image uploaded"
        });
      }

      let imageBuffer = req.file.buffer;

      if (
        req.file.mimetype === "image/heic" ||
        req.file.mimetype === "image/heif"
      ){
        console.log("Converting HEIC/HEIF to JPEG...");

        imageBuffer = await convert ({
          buffer: req.file.buffer,
          format: "JPEG",
          quality: 0.9
        });

        console.log( `HEIC conversion conplete: ${imageBuffer.length} bytes `);
      }


      // --------------------------------
      // 1. Upload image to Cloudinary
      // --------------------------------
      

      const cloudinaryResult = await new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "arrowhead-identification",
            format: "jpg",
            resource_type: "image"
          },

          (error, result) => {

            if (error) {
              reject(error);
            } else {
              resolve(result);
            }

          }
        );

        streamifier
          .createReadStream(imageBuffer)
          .pipe(uploadStream);

      });


      // --------------------------------
      // 2. Create artifact immediately
      // --------------------------------

      const artifact = await Artifact.create({

        state: req.body.state,

        estimatedLength: req.body.estimatedLength,

        image: cloudinaryResult.secure_url,

        identification: "Analyzing artifact..."

      });


      // --------------------------------
      // 3. Send browser to analyzing page
      // --------------------------------

      res.redirect(`/artifacts/${artifact._id}/analyzing`);


      // --------------------------------
      // 4. AI processing happens AFTER
      // --------------------------------
      // We intentionally don't await this
      // before sending the response above.

      processArtifact(artifact, req.body)
        .catch(err => {

          console.error(
            "Background artifact processing error:",
            err
          );

        });


    } catch (err) {

      console.error("Artifact upload error:", err);

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// ===============================
// ANALYZING PAGE
// ===============================

router.get(
  "/:id/analyzing",
  async (req, res) => {

    try {

      const artifact = await Artifact.findById(req.params.id);

      if (!artifact) {
        return res.status(404).send("Artifact not found");
      }

      res.render("analyzing", {
        artifact
      });

    } catch (err) {

      console.error(err);

      res.status(500).send("Error loading analyzing page");

    }

  }
);


// ===============================
// CHECK AI STATUS
// ===============================

router.get(
  "/:id/status",
  async (req, res) => {

    try {

      const artifact = await Artifact.findById(req.params.id);

      if (!artifact) {
        return res.status(404).json({
          error: "Artifact not found"
        });
      }


      // AI hasn't finished yet

      if (
        !artifact.identification ||
        artifact.identification === "Analyzing artifact..."
      ) {

        return res.json({
          status: "processing"
        });

      }


      // AI finished

      res.json({
        status: "complete"
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// ===============================
// BACKGROUND AI PROCESSING
// ===============================

async function processArtifact(artifact, body) {

  try {

    console.log(
      `Starting AI identification for artifact ${artifact._id}`
    );


    // --------------------------------
    // Send image to OpenAI
    // --------------------------------

    const aiResponse = await openai.responses.create({

      model: "gpt-5",

      input: [

        {

          role: "user",

          content: [

            {

              type: "input_text",

              text: `

You are assisting with preliminary identification of a possible archaeological
projectile point.

Examine the image carefully.

Describe what you can actually observe first.

Then provide a cautious preliminary identification if the evidence supports one.

Do not claim certainty from an image alone.

Consider:

- possible projectile point type
- material
- possible cultural tradition
- approximate age range
- archaeological time period
- notable physical characteristics
- alternative possible identifications

The user reports that the artifact was found in ${body.state}
and has an estimated length of ${body.estimatedLength} inches.

Clearly distinguish observations from conclusions.

`

            },

            {

              type: "input_image",

              image_url: artifact.image

            }

          ]

        }

      ]

    });


    console.log("AI IDENTIFICATION:");
    console.log(aiResponse.output_text);


    // --------------------------------
    // Save AI response
    // --------------------------------

    artifact.identification = aiResponse.output_text;

    await artifact.save();


    console.log(
      `AI identification complete for ${artifact._id}`
    );

  } catch (err) {

    console.error(
      "AI processing failed:",
      err
    );


    // Save error so the frontend doesn't
    // stay stuck forever.

    artifact.identification =
      "Unable to analyze this artifact. Please try again.";

    await artifact.save();

  }

}


// ===============================
// VIEW COMPLETED ARTIFACT
// ===============================

router.get("/:id", async (req, res) => {

  try {

    const artifact =
      await Artifact.findById(req.params.id);

    if (!artifact) {
      return res.status(404).send("Artifact not found");
    }


    const length =
      Number(artifact.estimatedLength);


    const matches =
      await PointType.find({

        states: artifact.state,

        "averageLength.min": {
          $lte: length
        },

        "averageLength.max": {
          $gte: length
        }

      });


    res.render("show", {
      artifact,
      matches
    });


  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});


// ===============================
// UPDATE ARTIFACT
// ===============================

router.put("/:id", async (req, res) => {

  try {

    const updatedArtifact =
      await Artifact.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true
        }

      );


    res.json(updatedArtifact);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});


// ===============================
// DELETE ARTIFACT
// ===============================

router.delete("/:id", async (req, res) => {

  try {

    await Artifact.findByIdAndDelete(
      req.params.id
    );


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