var app_fireBase = {};

(function(){
    var firebaseConfig = {
        apiKey: "AIzaSyChooR4-GjU5fYxJoi7UgWUabY0H4NlXBU",
        authDomain: "js-contacts-book.firebaseapp.com",
        databaseURL: "https://js-contacts-book.firebaseio.com",
        projectId: "js-contacts-book",
        storageBucket: "js-contacts-book.appspot.com",
        messagingSenderId: "339643414732",
        appId: "1:339643414732:web:796a666ad1af7289c76a69",
        measurementId: "G-FHE3HMRBKC"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    app_fireBase = firebase;
})();

(function(){
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: 'contacts.html',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
        //   firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
        //   firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: 'contacts.html',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>'
    };
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
})();


  