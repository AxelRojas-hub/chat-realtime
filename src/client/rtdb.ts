import { log } from 'console'
import firebase from 'firebase'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: 'nivel2-apx',
    databaseURL: import.meta.env.VITE_DB_URL,
}

// Initialize Firebase only if no apps exist
const app = firebase.default.apps.length 
    ? firebase.default.app() 
    : firebase.default.initializeApp(firebaseConfig)

export const database = app.database()