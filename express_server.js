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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  goober: {
    longURL: "https://www.youtube.com",
    userID: "abcd",
  },
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
  aJ48lW: {
    id: "aJ48lW",
    email: "a@a.com",
    password: "b",
  },
  abcd: {
    id: "abcd",
    email: "b@b.com",
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

const findUserByEmail = (email) => {
  const allKeys = Object.keys(users);
  for (let id of allKeys) {
    if (users[id].email === email) {
      return users[id];
    };
  };
  return null;
};

const urlsForUser = (user_id) => {
  const allKeys = Object.keys(urlDatabase);
  const userURLs ={};
  for (let entry of allKeys) {
    if (urlDatabase[entry].userID === user_id) {
      userURLs[entry] = urlDatabase[entry];
    };
  };
  return userURLs;
}

const validateURLForUser = (URLid, user_id) => {
  const userURLs = urlsForUser(user_id);
  if (!userURLs[URLid]){
    return false;
  };
  return true
}


// SERVER /////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GETS ////////////////

// Go to summary/ home page.
app.get('/', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  }
  res.redirect('/urls')
})

app.get('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  }
  
  const userURLs = urlsForUser(req.cookies.user_id);
  const templateVars = { urls: userURLs, user_id: userLookupById(req.cookies.user_id) };
  res.render('urls_Index', templateVars);
});

// Go to new URL page
app.get('/urls/new', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  }

  const templateVars = { user_id: userLookupById(req.cookies.user_id) };
  res.render('urls_new', templateVars);
});

// Go to individual short URL page
app.get('/urls/:id', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  }

  const URLid = req.params.id;
  const user_id = req.cookies.user_id;
  if (!validateURLForUser(URLid, user_id)){
    return res.status(404).send('404 - Not Found');
  }

  const longURL = urlDatabase[URLid].longURL;
  const templateVars = { URLid, longURL, user_id: userLookupById(req.cookies.user_id)  };
  res.render('urls_show', templateVars);
});

// Redirect to long URL page.
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    res.redirect('/urls_error');
  }
});

// Error Page
app.get('/urls_error', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  }
  const templateVars = { urls: urlDatabase, user_id: userLookupById(req.cookies.user_id) };
  res.render('urls_Index_error', templateVars);
});

// Register Page
app.get('/register', (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls')
  }
  const templateVars = {user_id: null};
  res.render('register', templateVars);
});

// Login Page
app.get('/login', (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls')
  }
  const templateVars = {user_id: null};
  res.render('login',templateVars);
});



// POSTS /////////////////

// Create new url
app.post('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('403 - Forbidden <br> Login to view content')
  }
  const URLid = generateRandomString();
  urlDatabase[URLid] ={};
  urlDatabase[URLid].longURL = req.body.longURL;
  urlDatabase[URLid].userID = req.cookies.user_id;
  res.redirect(`/urls/${URLid}`);
});

// Delete Entry
app.post('/urls/:id/delete', (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('403 - Forbidden <br> Login to view content')
  }

  const URLid = req.params.id;
  if (!validateURLForUser(URLid, req.cookies.user_id)){
    return res.status(404).send('404 - Not Found');
  }
  
  delete urlDatabase[URLid];
  res.redirect(`/urls`);
});

// Edit Entry
app.post('/urls/:id', (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('403 - Forbidden <br> Login to view content')
  }
  
  const URLid = req.params.id;
  const user_id = req.cookies.user_id;
  if (!validateURLForUser(URLid, user_id)){
    return res.status(404).send('404 - Not Found');
  }
  const newURL = req.body.longURL;
  urlDatabase[URLid].longURL = newURL;
  res.redirect(`/urls`);
});

// Login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const targetUser = findUserByEmail(email);

   // Edge case - user does not exist or wrong password
   if (!targetUser || targetUser.password !== password) {
    return res.status(403).send('403 - Forbidden <br> Invalid username and password combination')
  };

  res.cookie('user_id', targetUser.id);
  res.redirect(`/urls/`);
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/login`);
});

// Register new user
app.post('/register',(req, res) =>{
  const email = req.body.email;
  const password = req.body.password;

  // Edge case - user already exists
  if (findUserByEmail(email)) {
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


