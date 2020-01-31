const express = require('express')
const app = express()

app.use(express.json())

const morgan = require('morgan')
// app.use(morgan('tiny'))

const newPerson = (req, res, next) => {
    // console.log('req: ', req)
    const person = {
        name: req.body.name,
        number: req.body.number,
    }
    return JSON.stringify(person)
}

morgan.token('personToken', newPerson)


let persons = [
    {
        "name": "Arto Hellas",
        "number": "222-555",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
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

app.get('/api/persons', morgan('tiny'), (req, res) => {
    res.json(persons)
})

app.get('/info', morgan('tiny'), (req, res) => {
    res.write(`Phonebook has info for ${persons.length} people\n\n`)
    res.write(new Date().toString())
    res.send()
})

app.get('/api/persons/:id', morgan('tiny'), (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)

    //console.log('person: ', person)
    person ? res.json(person) : res.status(404).end()
})

app.delete('/api/persons/:id', morgan('tiny'), (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :personToken'), (req, res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            error: 'name cannot be empty'
        })
    } else if (!body.number) {
        return res.status(400).json({
            error: 'number cannot be empty'
        })
    } 
    
    const existence = persons.find(p => p.name === body.name)

    if (existence) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const newPerson = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(newPerson)
    res.json(newPerson)
})

const generateId = () => {
    let newId = Math.floor(Math.random() * Math.floor(999999))

    while (persons.find(p => p.id === newId)) {
        newId = Math.floor(Math.random() * Math.floor(999999))
    }

    return newId
}

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
