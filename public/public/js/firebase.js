const firebaseConfig = {
  apiKey: "AIzaSyB" + "RzzVxMGEH0mMwzrDXvCjmdEtoqJmxJ8I",
  authDomain: "pos-system-ebcf4.firebaseapp.com",
  projectId: "pos-system-ebcf4",
  storageBucket: "pos-system-ebcf4.firebasestorage.app",
  messagingSenderId: "92385683337",
  appId: "1:92385683337:web:06b438e99cdb4e654a6358"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function loginUser(){

  const email =
    document.getElementById('login-email').value;

  const password =
    document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email,password)
    .then(()=>{
      toast('Login Success');
    })
    .catch((error)=>{
      alert(error.message);
    });
}

function logoutUser(){
  auth.signOut();
}

auth.onAuthStateChanged((user)=>{

  if(user){

    document.getElementById('login-screen')
      .style.display='none';

    document.getElementById('app')
      .style.display='block';

  }else{

    document.getElementById('login-screen')
      .style.display='flex';

    document.getElementById('app')
      .style.display='none';
  }
});