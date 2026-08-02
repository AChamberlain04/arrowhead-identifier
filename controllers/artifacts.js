const Artifact = require('../models/Artifact')

// GET /artifacts
exports.getArtifacts = async (req, res) => {
  try {
    const artifacts = await Artifact.find()

    res.render('artifacts', {
      title: 'Artifacts',
      artifacts: artifacts
    })

  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
}