// HELPER FUNCTIONS

/*
User database should have the following format:
const users = {
  userA: {
    id:'userA',
    email:'a@email.com',
    password:'hashedPassword'
  },
  userB: {
    id:'userB',
    email:'B@email.com',
    password:'hashedPassword'
  }
};

URL database should have the following format:
const urlDatabase = {
  uniqueIdA: {
    longURL: "https://www.tsn.ca",
    userID: "userA"
  },
  uniqueIdB: {
    longURL: "https://www.google.ca",
    userID: "userA"
  },
};
*/

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,5);
};

//lookup user by ID, return user object
const userLookupById = (user_id, users) => {
  return users[user_id];
};

//lookup user by email, return user object
const findUserByEmail = (email, users) => {
  const allKeys = Object.keys(users);
  for (let id of allKeys) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

// Filter for all URLs created by a user, return an object containing those URL objects.
const urlsForUser = (user_id, urlDatabase) => {
  const allKeys = Object.keys(urlDatabase);
  const userURLs = {};
  for (let entry of allKeys) {
    if (urlDatabase[entry].userID === user_id) {
      userURLs[entry] = urlDatabase[entry];
    }
  }
  return userURLs;
};

// Checks to see if a user created a particular URL. Returns boolean.
const validateURLForUser = (URLid, user_id, urlDatabase) => {
  const userURLs = urlsForUser(user_id, urlDatabase);
  if (!userURLs[URLid]) {
    return false;
  }
  return true;
};

module.exports = {
  generateRandomString,
  userLookupById,
  findUserByEmail,
  urlsForUser,
  validateURLForUser
};