const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://philipjwkim:${password}@cluster0.ha0jojo.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})


//* defined model with the name Person, so mongoose will automatically name the associated collection as 'people'
const Person = mongoose.model('Person', personSchema)



if (!name && !number) {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
      mongoose.connection.close() //! The correct place for closing the database connection is at the end of the callback function
    })
  })
} else if (name && number) {

  const person = new Person({
    name: name,
    number: number,
  })


  person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
