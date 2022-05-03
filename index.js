import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { create } from "express-handlebars";
import session from "express-session";

//Express objekto inicijavimas
const app = express();
const hbs = create({
  /* config */
});
const __dirname = dirname(fileURLToPath(import.meta.url));
const credentials = {
  login: "gedas11@gmail.com",
  password: "12345",
};
const port = 3000;
const url = "http://localhost:" + port;
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./templates");

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  session({
    secret: "authentication",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 8640000, //laikas kiek galios cookies
    },
  })
);
app.use('/resources', express.static('assets'))

app.get("/", (req, res) => {
  if (req.session.loggedin != undefined && req.session.loggedin) {
    res.redirect(url + "/clients")
    return
  }
  res.render("login");
});

app.post("/login-submit", (req, res) => {
  if (parseInt(Object.keys(req.body).length) > 0) {
    if (
      req.body.username != "" &&
      req.body.password != "" &&
      req.body.username === credentials.login &&
      req.body.password === credentials.password
    ) {
      req.session.loggedin = true;
      res.redirect("http://localhost:3000/clients");
    } else {
      res.send("Neteisingi prisijungimo duomenys");
    }
  } else {
    res.redirect("http://localhost:3000/"); //Peradresavimas
  }
});

app.get("/clients", (req, res) => {
  if (req.session.loggedin != undefined && req.session.loggedin) {
    res.render("clients");
  } else {
    res.redirect(url);
  }
});

app.listen(port);
