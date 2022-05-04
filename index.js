import express from 'express'
import {dirname} from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { create } from 'express-handlebars'
import session from 'express-session'

//Express objekto inicijavimas
const app = express()
//Handlebars variklio sukurimas
const hbs = create({ /* config */ });
//Esamos direktorijos susigrazinimas
const __dirname = dirname(fileURLToPath(import.meta.url))
//Hardkodinti prisijungimo duomenys
const credentials = {
  login: 'gedas11@gmail.com',
  password: '12345'
}
//Bazinio adreso konstravimas
const port = 3000
const url  = 'http://localhost:' + port

//Handlebars variklio prijungimas
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')
app.set('views', './templates')

//POST metodu perduodamu duomenu  
app.use( express.urlencoded({
  extended: false
}))

//Sesijos prijungimas ir konfiguracija
app.use( session({
  secret: 'authentification',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 86400000 //Laikas kiek galioja issaugotas sausainelis (cookie)
  }
}))

app.use('/assets', express.static('assets'))

app.get('/', (req, res) => {
  if(req.session.loggedin != undefined && req.session.loggedin) {
    res.redirect(url + '/clients')
    return
  } 

  res.render('login')
})

app.post('/login-submit', (req, res) => {
  // req.query - tai kas yra perduodama adrese uz zenklo ?
  // req.params - tai kas yra perduodama uz kiekvieno slasho
  // req.body - tai kas yra perduodama post metodu
  // req.session - tai kas yra issaugota sausaineliuose

  if(parseInt( Object.keys(req.body).length ) > 0) {
    if(
      req.body.username != '' &&
      req.body.password != '' &&
      req.body.username === credentials.login &&
      req.body.password === credentials.password
    ) {
      req.session.loggedin = true
      res.redirect(url + '/clients')
    } else {
      res.send('Neteisingi prisijungimo duomenys')
    }

  } else {
    res.redirect(url) //Peradresavimas
  }

})

app.get('/clients', async (req, res) => {
  if(req.session.loggedin != undefined && req.session.loggedin) {

    let parsedJson = false
    let message = ''

    try {
      const data = await fs.readFile('./database.json', 'utf8')

      parsedJson = JSON.parse(data)
  
  } catch {
      message = 'Nera issaugota jokiu klientu'
  }

    res.render('clients', {parsedJson, message})
  } else {
    res.redirect(url)
  }
})

const auth = (req, res) => {
  if(req.session.loggedin === undefined || !req.session.loggedin) {
    res.redirect(url)
    return false
  }

  return true
}

app.get('/new-client', (req, res) => {
  if( !auth(req, res) )
    return 

  res.render('newclient')
})

app.post('/client-submit', async (req, res) => {
  if(parseInt( Object.keys(req.body).length ) > 0) { 

    let json = []

    try {
        const data = await fs.readFile('./database.json', 'utf8')

        let parsedJson = JSON.parse(data)

        parsedJson.push(req.body)

        json = parsedJson
    
    } catch {
        json.push(req.body)

        console.log('Duomenu bazes failas sukurtas')
    }
    
    //Informacijos issaugojimas faile
    
    await fs.writeFile('./database.json', JSON.stringify(json))

    res.redirect(url + '/clients')

  } else {
    res.send('Negauti duomenys')
  }
})

//Sukuria serveri priskiriant jam routerius
app.listen(port)