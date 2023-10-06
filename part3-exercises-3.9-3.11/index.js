const express = require('express') //imports express
const morgan = require('morgan')  //imports morgan
const cors = require('cors')  //imports cors
require('dotenv').config()

const Person = require('./models/person')




const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))


//* know this!
/*
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body'))
*/


morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(
  morgan(':method :url :status :response-time ms - :res[content-length] :body', {
    skip: (req, res) => req.method !== 'POST', // Skip the 'body' token for non-POST requests
  })
)


let persons = [

]

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})



app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })
  .catch(error => next(error))
})


//* if you want to use line breaks, use backticks ``
app.get('/info', (request, response) => {
  const currentTime = new Date().toString()
  
  Person.countDocuments({})
    .then(count => {
      response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${currentTime}</p>
      `)
    })
})


/*
const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(p => p.id))
    : 0
  return maxId + 1
}
*/

//adding
app.post('/api/persons', (request, response) => {
  const body = request.body

  
  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ //! calling return is crucial here otherwise, the note will end up getting added
      error: 'content missing'
    })
  } else if (Person.find({ name: body.name})) {   //mongoose syntax: if Person object found with the same name as the current body.name then...
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})


//deleting
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


//functionality for updating numbers in exercise 3.17
//  HERE...
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.use(errorHandler)
app.use(unknownEndpoint)

//! must specify PORT
//* NOTE: for Fly.io and Render, we need to change the port definition like so:
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})