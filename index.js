const express = require('express')
const app = express()
const PORT = 3000
const exphbs = require('express-handlebars')

app.engine('handlebars', exphbs.engine())
app.set('view engine','handlebars')

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/search', (req, res) => {
  res.render('search')
})

app.get('/recipes', (req, res) => {
  res.render('recipes')
})

app.get('/favorites', (req, res) => {
  res.render('favorites')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.listen(PORT, () => {
  console.log('listening on http://localhost:' + PORT)
})