const express = require('express')
const app = express()

app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

/** Middleware */
const morgan = require('morgan')
// app.use(morgan('tiny'))

const newPerson = (req, res, next) => {
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


// let persons = [
//     {
//         "name": "Arto Hellas",
//         "number": "222-555",
//         "id": 1
//       },
//       {
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523",
//         "id": 2
//       },
//       {
//         "name": "Dan Abramov",
//         "number": "12-43-234345",
//         "id": 3
//       },
//       {
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122",
//         "id": 4
//       },
// ]

app.get('/api/persons', morgan('tiny'), (req, res) => {
    Person.find({}).then(people => {
        res.json(people.map(p => p.toJSON()))
    })
})

app.get('/info', morgan('tiny'), (req, res) => {
    // Person.countDocuments({}).then(result => {
    //     const response = {
    //         count: `Phonebook has info for ${result} people`,
    //         date: new Date().toString()
    //     }

    //     JSON.stringify(response)

        // res.toString(result.toString())
        // res.json(response.toJSON())
        // res.write(`Phonebook has info for ${result} people\n\n`)
        // res.write(new Date().toString())
        // res.send()
    // })

})

app.get('/api/persons/:id', morgan('tiny'), (req, res) => {

    Person.findById(req.params.id).then(person => {
        res.json(person.toJSON())
    })
    .catch((e) => {
        console.log('Not found error:', e.message)
        res.status(404).end()
    })
})

app.delete('/api/persons/:id', morgan('tiny'), (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
            .then(result => {
                res.status(204).end()
            })
            .catch(error => next(error))
})

app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :personToken'), (req, res) => {
    const body = req.body

    if (body.name === undefined) {
        return res.status(400).json({
            error: 'name cannot be empty'
        })
    } else if (body.number === undefined) {
        return res.status(400).json({
            error: 'number cannot be empty'
        })
    }

    Person.find({}, (error, people) => {
        if (people.find(p => p.name === body.name)) {
            return res.status(400).json({
                error: 'Name must be unique.'
            })
        } else {
            const newPerson = new Person({
                name: body.name,
                number: body.number
            })

            newPerson.save().then(savedPerson => {
                res.json(savedPerson.toJSON())
            })
        }
    })
})


/** Error handler middleware*/
const errorHandler = (error, req, res, next) => {
    console.log('Error message:', error.message)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).send({error: 'malformatted id'})
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
