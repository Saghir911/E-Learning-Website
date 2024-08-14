// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClkxvw4ALeZUm9jipkwPOXPrzlf_XiXQM",
  authDomain: "e-learning-plarform.firebaseapp.com",
  projectId: "e-learning-plarform",
  storageBucket: "e-learning-plarform.appspot.com",
  messagingSenderId: "792517282026",
  appId: "1:792517282026:web:419b66861704b8df3eef93",
  measurementId: "G-5573RRXRV4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase();
const auth = getAuth();
const dbref = ref(db);
auth.languageCode = "en";
const provider = new GoogleAuthProvider();

let emailInp = document.getElementById("email");
let passwordInp = document.getElementById("password");
let Fname = document.getElementById("fullName");
let loginForm = document.getElementById("loginForm");
let signUpForm = document.getElementById("signupForm");

let RegisterUser = (e) => {
  e.preventDefault();
  createUserWithEmailAndPassword(auth, emailInp.value, passwordInp.value)
    .then((credentials) => {
      set(ref(db, "UsersAuthList/" + credentials.user.uid), {
        firstname: Fname.value,
        password: passwordInp.value,
        email: emailInp.value,
      })
        .then(() => {
          sessionStorage.setItem(
            "user-info",
            JSON.stringify({
              firstname: Fname.value,
              email: emailInp.value,
            })
          );
          sessionStorage.setItem(
            "user-creds",
            JSON.stringify(credentials.user)
          );
          window.location.href = "./index.html";
        })
        .catch((error) => {
          console.error("Error setting user data: ", error);
        });
    })
    .catch((error) => {
      alert(error.message);
      console.log(error.message);
      console.log(error.code);
    });
};

if (signUpForm) {
  signUpForm.addEventListener("submit", RegisterUser);
}

const googleSignUpButton = document.getElementById("google-signup");
if (googleSignUpButton) {
  googleSignUpButton.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("User:", user);

        // Check if the additionalUserInfo object exists
        if (result.additionalUserInfo) {
          const isNewUser = result.additionalUserInfo.isNewUser;
          console.log("isNewUser:", isNewUser);
          if (isNewUser) {
            // Save new user info to the database
            set(ref(db, "UsersAuthList/" + user.uid), {
              firstname: user.displayName,
              email: user.email,
            })
              .then(() => {
                sessionStorage.setItem(
                  "user-info",
                  JSON.stringify({
                    firstname: user.displayName,
                    email: user.email,
                  })
                );
                sessionStorage.setItem("user-creds", JSON.stringify(user));
                window.location.href = "/index.html";
              })
              .catch((error) => {
                console.error("Error setting user data: ", error);
              });
          } else {
            // Existing user, fetch data from database
            get(child(dbref, "UsersAuthList/" + user.uid))
              .then((snapshot) => {
                if (snapshot.exists()) {
                  sessionStorage.setItem(
                    "user-info",
                    JSON.stringify({
                      firstname: snapshot.val().firstname,
                      email: snapshot.val().email,
                    })
                  );
                  sessionStorage.setItem("user-creds", JSON.stringify(user));
                  window.location.href = "./index.html";
                }
              })
              .catch((error) => {
                console.error("Error fetching user data: ", error);
              });
          }
        } else {
          // Handle the case where additionalUserInfo is not available
          console.error("No additional user info available.");
          console.log(result); // Log the entire result object
          // Redirect the user to the main page or handle it accordingly
          sessionStorage.setItem("user-creds", JSON.stringify(user));
          sessionStorage.setItem(
            "user-info",
            JSON.stringify({
              firstname: user.displayName,
              email: user.email,
            })
          );
          window.location.href = "/index.html";
        }
      })
      .catch((error) => {
        console.error("Error during Google sign-in: ", error);
      });
  });
}
let SignInUser = (e) => {
  e.preventDefault();
  signInWithEmailAndPassword(auth, emailInp.value, passwordInp.value)
    .then((credentials) => {
      console.log(credentials);

      get(child(dbref, "UsersAuthList/" + credentials.user.uid))
        .then((snapshot) => {
          if (snapshot.exists()) {
            sessionStorage.setItem(
              "user-info",
              JSON.stringify({
                firstname: snapshot.val().firstname,
                email: snapshot.val().email,
              })
            );
            sessionStorage.setItem(
              "user-creds",
              JSON.stringify(credentials.user)
            );
            window.location.href = "/index.html";
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    })
    .catch((error) => {
      alert(error.message);
      console.log(error.message);
      console.log(error.code);
    });
};

if (loginForm) {
  loginForm.addEventListener("submit", SignInUser);
}

const googleSignInButton = document.getElementById("google-signin");
if (googleSignInButton) {
  googleSignInButton.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        console.log("User:", user);

        const additionalUserInfo = result.additionalUserInfo;
        if (!additionalUserInfo) {
          console.error("No additional user info available.");
          // Fallback: Check if the user exists in your database
          try {
            const snapshot = await get(
              child(dbref, "UsersAuthList/" + user.uid)
            );
            if (snapshot.exists()) {
              sessionStorage.setItem(
                "user-info",
                JSON.stringify({
                  firstname: snapshot.val().firstname,
                  email: snapshot.val().email,
                })
              );
              sessionStorage.setItem("user-creds", JSON.stringify(user));
              window.location.href = "/index.html";
            } else {
              // User does not exist in the database, consider them as new user
              await set(ref(db, "UsersAuthList/" + user.uid), {
                firstname: user.displayName,
                email: user.email,
              });
              sessionStorage.setItem(
                "user-info",
                JSON.stringify({
                  firstname: user.displayName,
                  email: user.email,
                })
              );
              sessionStorage.setItem("user-creds", JSON.stringify(user));
              window.location.href = "/index.html";
            }
          } catch (error) {
            console.error("Error checking/setting user data: ", error);
          }
          return;
        }

        const isNewUser = additionalUserInfo.isNewUser;
        console.log("Is New User:", isNewUser);

        if (isNewUser) {
          // If the user is new, set their data in the database
          try {
            await set(ref(db, "UsersAuthList/" + user.uid), {
              firstname: user.displayName,
              email: user.email,
            });
            sessionStorage.setItem(
              "user-info",
              JSON.stringify({
                firstname: user.displayName,
                email: user.email,
              })
            );
            sessionStorage.setItem("user-creds", JSON.stringify(user));
            window.location.href = "/index.html";
          } catch (error) {
            console.error("Error setting user data: ", error);
          }
        } else {
          // If the user is existing, fetch their data from the database
          try {
            const snapshot = await get(
              child(dbref, "UsersAuthList/" + user.uid)
            );
            if (snapshot.exists()) {
              sessionStorage.setItem(
                "user-info",
                JSON.stringify({
                  firstname: snapshot.val().firstname,
                  email: snapshot.val().email,
                })
              );
              sessionStorage.setItem("user-creds", JSON.stringify(user));
              window.location.href = "/index.html";
            } else {
              console.error("No user data found in the database.");
            }
          } catch (error) {
            console.error("Error fetching user data: ", error);
          }
        }
      })
      .catch((error) => {
        console.error("Error during Google sign-in: ", error);
      });
  });
}
