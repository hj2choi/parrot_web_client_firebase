var config = {
  apiKey: "AIzaSyCN4VE64n2J8MvaaN1xpaRLN8G9dNXhQZI",
  authDomain: "alexa-parrot.firebaseapp.com",
  databaseURL: "https://alexa-parrot.firebaseio.com",
  storageBucket: "alexa-parrot.appspot.com"
};

var USERS_REF = "/users/";
var USERS_LEVELHISTORY_REF = "/levelhistory/";
var USERS_PRONOUNCEHISTORY_REF = "/pronouncehistory/";
var USERS_MISSPELLEDWORDS_REF = "/usermissingwords/"

var UID = "amzn1_ask_account_AFP3ZWPOS2BGJR7OWJZ3DHPKMOMEGLTJVCHXOEVR34VSARGWN23CW6U7R3VZQ6U47AMNCUZRRUEB3UPWFAAGMXL3BCL3CCFZV5SI2S5RBOCQWN4N5Z46ZYN4CDRYCFDASVTLUXBMFPYFNSR32Q62HLKQ3L4TFZCGOWYGTBSV5OBZKCENYL6CP4QPHI53AZ6IMR4OLGEDOQ4JD2I";
var curr_user = "jay"

firebase.initializeApp(config);


function createSampleUser(user, uid) {

  console.log("createSampleUser");
  //user
  var user_obj= {};
  user_obj[user] = {
    "level":1,
    "play":0,
    "accuracy":0,
    "lastplay":0,
    "total":0,
    "success":0
  };
  firebase.database().ref(USERS_REF+uid).update(user_obj);
  // firebase.database().ref(USERS_REF+uid).update(obj);
  //levelhistory
  /*var user_levelhistory_obj={};
  user_levelhistory_obj[user] = {
    1:{
      "play":12,
      "correct":12
    },
    2:{
      "play":25,
      "correct":16
    },
    3:{
      "play":24,
      "correct":13
    },
    4:{
      "play":12,
      "correct":8
    },
    5:{
      "play":4,
      "correct":1
    },
    6:{
      "play":2,
      "correct":0
    },
    7:{
      "play":0,
      "correct":0
    },
    8:{
      "play":0,
      "correct":0
    },
    9:{
      "play":0,
      "correct":0
    }
  }
  firebase.database().ref(USERS_LEVELHISTORY_REF+uid).update(user_levelhistory_obj);
  //pronouncehistory
  firebase.database().ref(USERS_PRONOUNCEHISTORY_REF+uid+"/"+user).push({
    "sentence":"When do you expect to leave work?",
    "level":1,
    "accuracy":0.72,
    "sentence_diff":"When do you $expect$ to leave $work$?",
    "when":Date.now()
  });
  firebase.database().ref(USERS_PRONOUNCEHISTORY_REF+uid+"/"+user).push({
    "sentence":"I'm in a situation that doesn't allow me a moment to blink",
    "level":3,
    "accuracy":0.81,
    "sentence_diff":"I'm in a $situation$ that doesn't allow me a moment to $blink$",
    "when":Date.now()
  });
  //misspelledwords
  var user_misspelledwords_obj = {};
  user_misspelledwords_obj[user] = {
    "expect": {
      "level":1,
      "when":Date.now()
    },
    "work": {
      "level":1,
      "when":Date.now()
    },
    "situation": {
      "level":3,
      "when":Date.now()
    },
  };

  firebase.database().ref(USERS_MISSPELLEDWORDS_REF+uid).update(user_misspelledwords_obj);*/
}
//createSampleUser("someone","amzn1_ask_account_AFP3ZWPOS2BGJR7OWJZ3DHPKMOMEGLTJVCHXOEVR34VSARGWN23CW6U7R3VZQ6U47AMNCUZRRUEB3UPWFAAGMXL3BCL3CCFZV5SI2S5RBOCQWN4N5Z46ZYN4CDRYCFDASVTLUXBMFPYFNSR32Q62HLKQ3L4TFZCGOWYGTBSV5OBZKCENYL6CP4QPHI53AZ6IMR4OLGEDOQ4JD2I");

function retrieveUserData(callback) {
  return firebase.database().ref(USERS_REF+UID+"/"+"jay").on('value', function(snapshot) {
    var result = snapshot.val();
    callback(result);
    // ...
  });
}
retrieveUserData(function(result) {
  console.log("retrieved");
  console.log(result);
});








var app = angular.module("TalkInEnglish", ["firebase"]);

app.controller("MainCtrl", function($sce, $scope, $firebaseArray, $firebaseObject) {
  $scope.loadInfo = function(user,uid) {
    if (uid=="" || !uid) {
      uid = UID;
    }

    var ref = firebase.database().ref().child(USERS_REF+UID);
    var user_pronouncehistory_ref = firebase.database().ref().child(USERS_PRONOUNCEHISTORY_REF+UID+"/");
    var user_misspelledwords_ref = firebase.database().ref().child(USERS_MISSPELLEDWORDS_REF+UID+"/");
    var user_levelhistory_ref = firebase.database().ref().child(USERS_LEVELHISTORY_REF+UID+"/");
    //console.log($firebaseObject(ref));

    // create a synchronized array
    // click on `index.html` above to see it used in the DOM!
    $scope.amazon_id = UID;
    $scope.user = $firebaseObject(ref.child(user));
    $scope.users_list = $firebaseObject(ref);
    $scope.results = $firebaseArray(user_pronouncehistory_ref.child(user).limitToLast(20));
    $scope.level_stats = $firebaseObject(user_levelhistory_ref.child(user));
    $scope.incorrect_words = $firebaseArray(user_misspelledwords_ref.child(user).orderByValue().limitToFirst(10));
  };

  // default
  $scope.loadInfo(curr_user,"amzn1_ask_account_AFP3ZWPOS2BGJR7OWJZ3DHPKMOMNWY4AY66FUR7ILBWANIHQN73QHTPZBMVWMNVZHDMMC6XXPEXLEV6NIS6NZ2E673ZIGSDGVYIM6GONZ72SUEC32UT6VA2LYXFDSQBWTMNBJHQDVKGK4HZ5WVIZAN5WXFDMBYLRXRZZM3ZHWR5YMGDP56RXVWURYRVMN4AJRTNPSJS5FHOHWNY");
});


app.filter("del2html", ['$sce', function($sce) {
  return function(str){
    htmlCode = str.replace(/\[/g, "<strike>").replace(/\]/g, "</strike>");
    return $sce.trustAsHtml(htmlCode);
  }
}]);
