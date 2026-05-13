const firebaseConfig = {
  apiKey: "AIzaSyBb1n1VqR8iXco8ByeCkze_XewNjoH6Ruk",
  authDomain: "listacompraapp-dae10.firebaseapp.com",
  projectId: "listacompraapp-dae10",
  storageBucket: "listacompraapp-dae10.firebasestorage.app",
  messagingSenderId: "68249280755",
  appId: "1:68249280755:web:e359ca073cab688f031786",
  measurementId: "G-M3Z4FJJZ4W"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
