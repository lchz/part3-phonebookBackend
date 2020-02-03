const express = require('express')
const app = express()

app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

/** Middleware */
const morgan = require('morgan')
// app.use(morgan('tiny'))

/** POST morgan middleware */
const newPerson = (req) => {
  const person = {
    name: req.body.name,
    number: req.body.number
  }
  return JSON.stringify(person)
}
morgan.token('personToken', newPerson)

/** MongoDB */
require('dotenv').config()
const Person = require('./models/person')


/** Routes */
app.get('/api/persons', morgan('tiny'), (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(p => p.toJSON()))
  })
})

app.get('/info', morgan('tiny'), (req, res) => {
  Person.countDocuments({}).then(result => {
    res.write(`Phonebook has info for ${result} people\n\n`)
    res.write(new Date().toString())
    res.send()
  })

})

app.get('/api/persons/:id', morgan('tiny'), (req, res, next) => {

  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person.toJSON())
    } else {
      console.log('ID not found')
      res.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', morgan('tiny'), (req, res, next) => {

  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :personToken'), (req, res, next) => {
  const body = req.body

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  })
    .catch(e => next(e))
})

app.put('/api/persons/:id', morgan('tiny'), (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new : true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(e => next(e))
})



/** Error handler middleware*/
const errorHandler = (error, req, res, next) => {
  console.log('Error message:', error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
