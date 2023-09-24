const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
const convertDbObjectToResponseObjectTotal = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDbObjectToResponseObjectdir = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
//getting list of all movies

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT * FROM movie;`;
  const moviesArray = await db.all(getAllMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//creating a new movie entry

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) values ('${directorId}','${movieName}','${leadActor}') `;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

//gettina a single movie

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id= ${movieId};`;
  const movie_ = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObjectTotal(movie_));
});

//update

app.put("/movies/:movieId", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `UPDATE movie SET director_id='${directorId}',movie_name='${movieName}',lead_actor='${leadActor}'  WHERE movie_id = ${movieId}; `;
  await db.run(createMovieQuery);
  response.send("Movie Details Updated");
});

//delete
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `DELETE FROM movie WHERE movie_id= ${movieId};`;
  const movie_ = await db.run(getMovieQuery);
  response.send("Movie Removed");
});

//get all directors
app.get("/directors/", async (request, response) => {
  const getAllDirectorQuery = `SELECT * FROM director;`;
  const directorArray = await db.all(getAllDirectorQuery);
  response.send(
    directorArray.map((eachMovie) =>
      convertDbObjectToResponseObjectdir(eachMovie)
    )
  );
});

//movies directed by specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAQuery = `SELECT * FROM movie where director_id=${directorId};`;
  const moviesArraydir = await db.all(getAQuery);
  response.send(
    moviesArraydir.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

module.exports = app;
