FB.init({
  appId      : '156408871493935',
  cookie     : true,  // enable cookies to allow the server to access the session
  xfbml      : true,  // parse social plugins on this page
  version    : 'v2.8' // use graph api version 2.8
});

/*
  checkAndHandleLoginState


*/
function checkAndHandleLoginState(callback) {
  console.log("checkLoginState()");
  FB.getLoginStatus(function(response) {
    console.log("fbAuth.getLoginStatus() response");
    console.log(response);
    var current_userID=null;
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      current_userID = response.authResponse.userID;
      //console.log("logged in as facebook: "+current_userID);
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      //liveLog("authentication denied by user");
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      //liveLog("NOT CONNECTED TO FACEBOOK");
    }
    callback(current_userID);
  });
}

function fbLogin(callback) {
  FB.login(function(response) {
    liveLog("logging in with facebook");
    console.log("log in successful");
    console.log(response);
    checkAndHandleLoginState(callback);
  }, {scope: 'email'});
}

function fbLogout(callback) {
  FB.logout(function(response) {
    liveLog("logging out from facebook");
    console.log("logout successful");
    console.log(response);
    checkAndHandleLoginState(callback);
  })
}

function retrieveFBUserData(uid, callback) {
  return firebase.database().ref(USERS_REF+uid).on('value', function(snapshot) {
    var result = snapshot.val();
    callback(result);
    // ...
  });
}
