npm install
add DB_STRING to .env file

Make sure there are no spaces or quotes in env file. Put the dbname after the slash.

Dont forget to add IP address on mongodb in Network Access tab. 


The first thing I did was to build the frontend. I needed a way for users to upload an image. I wanted it to only accept images and not random files. Then I decided I should add a state dropdown so users could pick the state they found the arrowhead in.

I made sure to use enctype="multiform-data" because its an encoding type for HTML forms. It lets the browser send the form as separate chunks. i.e. the image, the selected state, and any other fields. Without it everything is squished into a URL-style string and files dont get sent properly. For any upload, it must be used. For text-only it doesnt need to be used.

When making the label for length, I had to add a "min" attribute because I noticed it was allowing for negative numbers and I wanted positive only.

The pieces I need to put together. Build a simple frontend where a user can upload an image with a dropdown of what state the point was found in and an appoximate length in inches.  Then connect to mongodb. I need to successfully upload and retrieve data from the database. Eventually I would like to build a login/password for users where they can store/save their finds. Maybe have a form where they can add notes and the date they found it. This way they can have a list of what they have where they can store their images. 

From this point I created the models folder with Artifacts.js where im using mongoose and a Schema.   I also created the Routes folder with artifacts.js where I declared the router and Artifact.

Things I did wrong so far:
-When adding the schema I wrote mongoose("Artifact", ArtifactSchema) when I shouldve had mongoose.model("Artifact", ArtifactSchema).
-When I renamed the folder from todo-list-express to ArrowheadID, I accidentally created two layers of project folders. One had server.js, models, and views, the other had routes. So my folder structure was all messed up.
-Once I got the server running and working and I refreshed the page I got a Cannot Get /  message. Meaning that I dont have a route for my homepage / yet.  So in my server.js I added my GET request and called it to render my index.ejs
-More issues. I accidentally had duplicate matching logic in POST and GET and had a typo in averageLength so it was ignoring the estimated range of length and showing me all options.
