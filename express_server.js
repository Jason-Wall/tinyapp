const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// GETS ////////////////

// app.get("/", (req, res) => {
//   res.send("Hello!\n");
// });

// Go to summary/ home page.
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_Index', templateVars);
});

// Go to new URL page
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// Go to individual short URL page
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  res.render('urls_show', templateVars);
});

// Redirect to long URL page.
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(urlDatabase[req.params.id]);
  } else {
    res.redirect('/urls_error');
  }
});

// Error Page
app.get('/urls_error', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_Index_error', templateVars);
});

// POSTS /////////////////

// Create new url
app.post('/urls', (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// Delete Entry
app.post('/urls/delete/:id', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

// Edit Entry
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect(`/urls/${id}`);
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});