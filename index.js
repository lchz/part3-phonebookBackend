const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

let persons = [
    {
        "name": "Arto Hellas",
        "number": "222-555",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 4
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      },
]

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    res.write(`Phonebook has info for ${persons.length} people\n\n`)
    res.write(new Date().toString())
    res.send()
})

const PORT = 3001
app.listen(PORT)