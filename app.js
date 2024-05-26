const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM 
    cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray)
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `INSERT INTO cricket(playerName,jerseyNumber,role)
  VALUES (
    '${playerName}',
     ${jerseyNumber},
     ${role}
  );`

  const dbresponse = await db.run(addPlayerQuery)
  response.send('Player Added to team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT 
  * 
  FROM 
  cricket_team
  WHERE 
  player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(player)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updateQuery = `
  UPDATE cricket_team 
  SET 
  playerName = '${playerName}',
  jerseyNumber = ${jerseyNumber},
  role = ${role}
  WHERE player_id = ${playerId};`

  await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteBookQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deleteBookQuery)
  response.send('Player Removed')
})
module.exports = app
