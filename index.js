const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
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

//added from other index.js
const form = document.getElementById('brewery-form')
const breweryURL = "https://api.openbrewerydb.org/breweries?by_postal="
const beer = document.getElementById('beer')
const search = document.getElementById('zip-search')
const lnBreak = document.createElement('br')

form.onsubmit = async e => {
    e.preventDefault()
    const searchTerm = search.value.trim()
    console.log(searchTerm)
    if(!searchTerm) return

    try {
        const res =  await fetch(`${breweryURL}${searchTerm}`) 
        if (res.status !== 200) {
            throw new Error("Location not found")
        }
        const breweryData = await res.json()
        console.log(breweryData)
        renderBreweries(breweryData, searchTerm)
        beer.appendChild(lnBreak)
        form.search.value = ""
    }
    catch (err){
        form.search.value = ""
        beer.innerHTML = err.message
    }
} 

function renderBreweries(breweryData, searchTerm){
    beer.innerHTML = `<h2>Breweries near ${searchTerm}: <br><br>`
    for (let i = 0; i < breweryData.length; i++) {
        let h3 = document.createElement('h3')
        h3.textContent = breweryData[i].name
        let p = document.createElement('p')
        p.textContent = breweryData[i].street
        beer.appendChild(h3)
        beer.appendChild(p)
        const line = document.createElement('hr')
        line.setAttribute("width", "200")
        beer.appendChild(line)
    }

}
