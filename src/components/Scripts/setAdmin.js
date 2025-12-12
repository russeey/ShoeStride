const admin = require('firebase-admin')

// Path to your service account JSON file
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

// Replace with the UID of your admin user
const adminUid = 'YOUR_ADMIN_UID_HERE'

admin.auth().setCustomUserClaims(adminUid, { admin: true })
  .then(() => {
    console.log('✅ Admin claim set successfully!')
  })
  .catch((error) => {
    console.error('Error setting admin claim:', error)
  })
