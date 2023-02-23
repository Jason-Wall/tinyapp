// HELPER FUNCTIONS

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,5);
};

const userLookupById = (user_id, users) => {
  return users[user_id];
};

const findUserByEmail = (email, users) => {
  const allKeys = Object.keys(users);
  for (let id of allKeys) {
    if (users[id].email === email) {
      return users[id];
    };
  };
  return null;
};

const urlsForUser = (user_id, urlDatabase) => {
  const allKeys = Object.keys(urlDatabase);
  const userURLs ={};
  for (let entry of allKeys) {
    if (urlDatabase[entry].userID === user_id) {
      userURLs[entry] = urlDatabase[entry];
    };
  };
  return userURLs;
}

const validateURLForUser = (URLid, user_id, urlDatabase) => {
  const userURLs = urlsForUser(user_id, urlDatabase);
  if (!userURLs[URLid]){
    return false;
  };
  return true
}

module.exports = {
  generateRandomString,
  userLookupById,
  findUserByEmail,
  urlsForUser,
  validateURLForUser
};