const express = require('express')
const path = require('path')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const db_path = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDB = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log(`DB Error :${e.message}`)
    process.exit(1)
  }
}

initializeDB()

app.get('/movies/', async (request, response) => {
  const query = `
        SELECT movie_name
        FROM movie;
    `
  let temp = await db.all(query)
  let movieNames = temp.map(a => {
    return {
      movieName: a.movie_name,
    }
  })
  response.send(movieNames)
})

app.post('/movies/', async (request, response) => {
  let {directorId, movieName, leadActor} = request.body
  let query = `
        INSERT INTO movie(director_id, movie_name, lead_actor)
        VALUES (${directorId},"${movieName}","${leadActor}");
    `
  await db.run(query)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const query = `
        SELECT * 
        FROM movie
        WHERE movie_id = ${movieId};
    `
  let m = await db.get(query)
  const response_obj = {
    movieId: m.movie_id,
    directorId: m.director_id,
    movieName: m.movie_name,
    leadActor: m.lead_actor,
  }
  response.send(response_obj)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  let {directorId, movieName, leadActor} = request.body
  const query = `
        UPDATE movie
        SET director_id = ${directorId},
            movie_name = "${movieName}",
            lead_actor = "${leadActor}"
        WHERE movie_id = ${movieId};
    `
  await db.run(query)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const query = `
        DELETE FROM movie
        WHERE movie_id = ${movieId}
    `
  await db.run(query)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const query = `
        SELECT * 
        FROM director;
    `
  const directorNames = await db.all(query)
  const names = directorNames.map(x => {
    return {
      directorId: x.director_id,
      directorName: x.director_name,
    }
  })
  response.send(names)
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const query = `
        SELECT movie_name
        FROM movie
        WHERE director_id =${directorId};
    `
  const d = await db.all(query)

  const names = d.map(x => {
    return {
      movieName: x.movie_name,
    }
  })
  response.send(names)
})

module.exports = app
