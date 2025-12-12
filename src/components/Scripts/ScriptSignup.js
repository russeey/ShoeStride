// ./Scripts/ScriptSignup.js
import { ref } from 'vue'
import { auth, db } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export const firstName = ref('')
export const lastName = ref('')
export const email = ref('')
export const password = ref('')
export const confirmPassword = ref('')
export const gender = ref('')
export const birthdate = ref('')
export const age = ref('')

export const error = ref('')
export const success = ref('')

export const signup = async () => {
  try {
    // clear old messages
    error.value = ''
    success.value = ''

    // simple validation
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match.'
      return
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )
    const user = userCredential.user

    await setDoc(doc(db, 'users', user.uid), {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      gender: gender.value,
      birthdate: birthdate.value,
      age: age.value,
      createdAt: new Date().toISOString()
    })

    console.log('✅ User signed up & data saved:', user.uid)

    success.value = 'Signup successfully!'

    // reset fields
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    gender.value = ''
    birthdate.value = ''
    age.value = ''

  } catch (err) {
    console.error(err)

    if (err.code === 'auth/email-already-in-use') {
      error.value = 'This email is already registered. Please log in instead.'
    } else if (err.code === 'auth/weak-password') {
      error.value = 'Password should be at least 6 characters.'
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Please enter a valid email address.'
    } else {
      error.value = err.message || 'Signup failed. Please try again.'
    }

    success.value = ''
  }
}
