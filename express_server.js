// IMPORTS AND ASSIGNMENTS ///////////////
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const morgan = require('morgan');
app.use(morgan('dev'));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const bcrypt = require('bcryptjs'); // Password hashing

const {
  generateRandomString,
  userLookupById,
  findUserByEmail,
  urlsForUser,
  validateURLForUser
} = require('./helpers.js'); //Helper functions

const PORT = 8080;


// DATABASE ////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "q94",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "q94",
  },
  goober: {
    longURL: "https://www.youtube.com",
    userID: "abcd",
  },
};

const users = {
  q94: {
    id:'q94',
    email:'a@a.com',
    password:'$2a$10$oEkHZrvX16QNiACXF8tS6uIQ2fKhreFG6PDPtboBlCt8B9md5Qkjm'}  // password: a
  // userRandomID: {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur",
  // },
  // user2RandomID: {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk",
  // },
  // aJ48lW: {
  //   id: "aJ48lW",
  //   email: "a@a.com",
  //   password: "b",
  // },
  // abcd: {
  //   id: "abcd",
  //   email: "b@b.com",
  //   password: "b",
  // },
};


// SERVER /////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GETS ////////////////

// Go to summary/ home page.
app.get('/', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
    
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: userURLs, user_id: userLookupById(req.session.user_id, users) };
  res.render('urls_Index', templateVars);
});

// Go to new URL page
app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  const templateVars = { user_id: userLookupById(req.session.user_id, users) };
  res.render('urls_new', templateVars);
});

// Go to individual short URL page
app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  const URLid = req.params.id;
  const user_id = req.session.user_id;
  if (!validateURLForUser(URLid, user_id, urlDatabase)) {
    return res.status(404).send('404 - Not Found - Short URL not in user list');
  }

  const longURL = urlDatabase[URLid].longURL;
  const templateVars = { URLid, longURL, user_id: userLookupById(req.session.user_id, users)  };
  res.render('urls_show', templateVars);
});

// Redirect to long URL page.
app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('404 - Not Found - Short URL not in user list');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    return res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    return res.redirect('/urls_error');
  }
});

// Error Page
app.get('/urls_error', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = { urls: urlDatabase, user_id: userLookupById(req.session.user_id, users) };
  res.render('urls_Index_error', templateVars);
});

// Register Page
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {user_id: null, callToAction: 'Create an account:'};
  res.render('loginRegister', templateVars);
});

// Login Page
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {user_id: null, callToAction : 'Login:'};
  res.render('loginRegister',templateVars);
});


// POSTS ////////////////////////////////////////////////////

// Create new url
app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('403 - Forbidden - Login to view content');
  }
  const URLid = generateRandomString();
  urlDatabase[URLid] = {};
  urlDatabase[URLid].longURL = req.body.longURL;
  urlDatabase[URLid].userID = req.session.user_id;
  res.redirect(`/urls/${URLid}`);
});

// Delete Entry
app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('403 - Forbidden - Login to view content');
  }

  const URLid = req.params.id;
  if (!validateURLForUser(URLid, req.session.user_id, urlDatabase)) {
    return res.status(404).send('404 - Not Found - Short URL not in user list');
  }
    
  delete urlDatabase[URLid];
  res.redirect(`/urls`);
});

// Edit Entry
app.post('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('403 - Forbidden - Login to view content');
  }
    
  const URLid = req.params.id;
  const user_id = req.session.user_id;
  if (!validateURLForUser(URLid, user_id, urlDatabase)) {
    return res.status(404).send('404 - Not Found - Short URL not in user list');
  }
  const newURL = req.body.longURL;
  urlDatabase[URLid].longURL = newURL;
  res.redirect(`/urls`);
});

// Login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Edge case - empy user or pass
  if (!email || !password) {
    return res.status(400).send('400 - Bad Request - Invalid username and password combination');
  }

  const targetUser = findUserByEmail(email, users);
  const correctPassword = bcrypt.compareSync(password, targetUser.password);

  // Edge case - user does not exist or wrong password
  if (!targetUser || !correctPassword) {
    return res.status(400).send('400 - Bad Request - Invalid username and password combination');
  }

  req.session.user_id = targetUser.id;
  res.redirect(`/urls/`);
});

// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// Register new user
app.post('/register',(req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
    
  // Edge case - empty user or pass
  if (!email || !password) {
    return res.status(400).send('400 - Bad Request - Invalid username and password combination');
  }
  // Edge case - user already exists
  if (findUserByEmail(email, users)) {
    return res.status(400).send('400 - Bad Request - Username already exists');
  }
    
  const id = generateRandomString();
  const hashPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id,
    email,
    password: hashPassword,
  };
  users[id] = newUser;
  req.session.user_id = id;
  res.redirect('/urls');
});


