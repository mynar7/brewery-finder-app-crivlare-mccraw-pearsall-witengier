const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const exphbs = require('express-handlebars')

app.engine('handlebars', exphbs.engine())
app.set('view engine','handlebars')

app.listen(PORT, () => {
  console.log('listening on http://localhost:' + PORT)
})