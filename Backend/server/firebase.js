var admin = require("firebase-admin");

var serviceAccount = require("./driver-45e9c-firebase-adminsdk-bn45v-f4647a3982.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://driver-45e9c.firebaseio.com"
});

module.exports = admin;