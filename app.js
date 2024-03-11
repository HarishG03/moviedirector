const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
app.use(express.json()); 
const connectServerAndDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('SERVER HAS STARTED!!!')
    })
  } catch (e) {
    console.log(`Error DB : ${e.message}`)
    process.exit(1)
  }
}
connectServerAndDatabase()
express.json()

app.get('/movies/', async (request, response) => {
  let query = `SELECT movie_name AS movieName FROM movie`
  const movieArray = await db.all(query)
  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  let query = `INSERT INTO movie (director_id,movie_id,lead_actor) VALUES (${directorId},${movieName},${leadActor})`
  await db.run(query)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  let movieId = request.params
  let query = `SELECT * FROM movie WHERE movie_id = ${movieId}`
  const result = await db.get(query)
  response.send(result)
})

app.put('/movies/:movieId/', async (request, response) => {
  const movieId = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  let query = `UPDATE movie_table
              SET 
              director_id = ${directorId},
              movie_name = ${movieName},
              lead_actor = ${leadActor}
              WHERE movie_id = ${movieId}`
  await db.run(query)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  let movieId = request.params
  const query = `DELETE FROM movie WHERE movie_id = ${movieId}`
  await db.run(query)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  let query = `SELECT * FROM director`
  const result = await db.all(query)
  response.send(result)
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  let directorId = request.params
  let query = `SELECT movie_name AS movieName FROM movie_table LEFT JOIN director_table ON movie.director_id = director.director_id`
  const moviesArray = await db.all(query)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
