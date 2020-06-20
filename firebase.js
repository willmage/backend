const admin = require("firebase-admin")

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: process.env.BUCKET
})

module.exports = admin.storage().bucket()
