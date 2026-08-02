require("dotenv").config();

const mongoose = require("mongoose");

const PointType = require("./models/PointType");

mongoose.connect(process.env.DB_STRING)
  .then(() => {
    console.log("Mongo Connected");
  })
  .catch(err => {
    console.log(err);
  });


  

  const pointTypes = [

  {
    name: "Clovis",

    states: ["PA", "NM", "IL", "MD", "MT"],

    averageLength: { min: 1.5, max: 6},

    culture: "Paleo-Indian",

    ageRange: "13,500-12,700 years BP",

    description:
      "Large fluted lanceolate projectile point associated with early North American big-game hunters.",

    image: "clovis.jpg"
  },

  {
    name: "Dalton",

    states: ["AR", "MO", "TN", "IL", "KS", "OK", "TX", "LA", "AL", "FL", "NC", "SC", "GA", "KY", "MI", "MS", "IA", "OH", "VA", "WI", "MD", "NJ", "PA", "WV"],

    averageLength: { min: 1.5, max: 2.5 },

    culture: "Early Archaic",

    ageRange: "10,500 - 9,000 years ago",

    description:
      "Serrated edges and tapered stem.",

    image: "dalton.jpg"
  },

  {
    name: "Kirk",

    states: ["PA", "DE", "NC", "SC", "GA", "MD", "OH", "IN", "IL", "KY", "MS", "AL", "FL", "TN", "WV", "VA", "NY", "WI", "MO", "AR"],

    averageLength: {min:1.5, max: 6},

    culture: "Early Archaic",

    ageRange: "9,500 - 8,500 years ago",

    description:
      "Corner-notched projectile point.",

    image: "kirk.jpg"
  }

];




async function seedDatabase() {

  try {

    await PointType.deleteMany();

    await PointType.insertMany(pointTypes);

    console.log("Database Seeded");

    mongoose.connection.close();

  } catch (err) {

    console.log(err);

  }

}

seedDatabase();