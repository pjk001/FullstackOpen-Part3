const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))


//* know this!
/*
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body'))
*/


morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(
  morgan(':method :url :status :response-time ms - :res[content-length] :body', {
    skip: (req, res) => req.method !== 'POST', // Skip the 'body' token for non-POST requests
  })
)



let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]



app.get('/api/persons', (request, response) => {
  response.json(persons)
})



app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})


//* if you want to use line breaks, use backticks ``
app.get('/info', (request, response) => {
  const currentTime = new Date().toString()

  response.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${currentTime}</p>
  `)
})


const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(p => p.id))
    : 0
  return maxId + 1
}


app.post('/api/persons', (request, response) => {
  const body = request.body

  
  if (!body.name || !body.number) {
    return response.status(400).json({ //! calling return is crucial here otherwise, the note will end up getting added
      error: 'content missing'
    })
  } else if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {    //! NOTE: when testing in POSTMAN, change body content-type to JSON!
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  response.json(person)
})



app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})


//! must specify PORT
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})