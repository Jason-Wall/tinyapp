// IMPORTS AND ASSIGNMENTS ///////////////
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const PORT = 8080;


// DATABASE ////////////

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "a@a.com",
    password: "b",
  },
};


// HELPER FUNCTIONS

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,5);
};

const userLookupById = (user_id) => {
  return users[user_id];
};

const findUserByEmail = (users, email) => {
  const allKeys = Object.keys(users);
  for (let id of allKeys) {
    if (users[id].email === email) {
      return users[id];
    };
  };
  return null;
};

// SERVER /////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GETS ////////////////

// Go to summary/ home page.
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: userLookupById(req.cookies.user_id) };
  res.render('urls_Index', templateVars);
});

// Go to new URL page
app.get('/urls/new', (req, res) => {
  const templateVars = { user_id: userLookupById(req.cookies.user_id) };
  res.render('urls_new', templateVars);
});

// Go to individual short URL page
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, user_id: userLookupById(req.cookies.user_id)  };
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
  const templateVars = { urls: urlDatabase, user_id: userLookupById(req.cookies.user_id) };
  res.render('urls_Index_error', templateVars);
});

// Register Page
app.get('/register', (req, res) => {
  const templateVars = { user_id: userLookupById(req.cookies.user_id) };
  res.render('register', templateVars);
});

// Login Page
app.get('/login', (req, res) => {
  const templateVars = { user_id: userLookupById(req.cookies.user_id) };
  res.render('login', templateVars);
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
});

// Login
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect(`/urls/`);
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls/`);
});

// Register new user
app.post('/register',(req, res) =>{
  const email = req.body.email;
  const password = req.body.password;

  // Edge case - user already exists
  if (findUserByEmail(users, email)) {
    return res.status(400).send('400 - Bad Request <br> Username already exists')
  };
  // Edge case - empty user or pass
  if (!email || !password){
    return res.status(400).send('400 - Bad Request <br> Invalid username and password combination');
  };
  
  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;

  res.cookie('user_id', id);
  res.redirect('/urls');
});


