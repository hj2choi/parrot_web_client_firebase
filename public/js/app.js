var config = {
  apiKey: "AIzaSyCN4VE64n2J8MvaaN1xpaRLN8G9dNXhQZI",
  authDomain: "alexa-parrot.firebaseapp.com",
  databaseURL: "https://alexa-parrot.firebaseio.com",
  storageBucket: "alexa-parrot.appspot.com"
};
firebase.initializeApp(config);

var USERS_REF = "/users/";
var USERS_LEVELHISTORY_REF = "/levelhistory/";
var USERS_PRONOUNCEHISTORY_REF = "/pronouncehistory/";
var USERS_MISSPELLEDWORDS_REF = "/usermissingwords/";

//var UID = "amzn1_ask_account_AFP3ZWPOS2BGJR7OWJZ3DHPKMOMEGLTJVCHXOEVR34VSARGWN23CW6U7R3VZQ6U47AMNCUZRRUEB3UPWFAAGMXL3BCL3CCFZV5SI2S5RBOCQWN4N5Z46ZYN4CDRYCFDASVTLUXBMFPYFNSR32Q62HLKQ3L4TFZCGOWYGTBSV5OBZKCENYL6CP4QPHI53AZ6IMR4OLGEDOQ4JD2I";
var uid_global = "";
var curr_user = "";

var app = angular.module("TalkInEnglish", ["firebase"]);

app.controller("MainCtrl", function($sce, $scope, $firebaseArray, $firebaseObject) {
  $scope.loadInfo = function(user,uid) {
    if (!uid || uid=="") {
      uid=uid_global;
    }
    console.log("loadinfo("+user+","+uid+");");

    var ref = firebase.database().ref().child(USERS_REF+uid);
    var user_pronouncehistory_ref = firebase.database().ref().child(USERS_PRONOUNCEHISTORY_REF+uid+"/");
    var user_misspelledwords_ref = firebase.database().ref().child(USERS_MISSPELLEDWORDS_REF+uid+"/");
    var user_levelhistory_ref = firebase.database().ref().child(USERS_LEVELHISTORY_REF+uid+"/");
    //console.log($firebaseObject(ref));
    $scope.amazon_id = uid;
    $scope.users_list = $firebaseObject(ref);
    if (user=="" || !user) {
      return;
    }
    $scope.user = $firebaseObject(ref.child(user));
    $scope.results = $firebaseArray(user_pronouncehistory_ref.child(user).limitToLast(20));
    $scope.level_stats = $firebaseObject(user_levelhistory_ref.child(user));
    $scope.incorrect_words = $firebaseArray(user_misspelledwords_ref.child(user).orderByValue().limitToFirst(10));
  };

  $scope.authenticateUserAndLoad = function() {
    checkAndHandleLoginState(function(id) {
      uid_global=id;
      $scope.loadInfo(curr_user, id);

      // create sample user
      if (!id) {
        return;
      }
      retrieveFBUserData(id, function(result){
        console.log(result);
        /*if (!result) {
          console.log("creating dummy user data....");
          createSampleUser("jay", id);
        }*/
      });
    });
  }
  $scope.fbLogin = function(){
    fbLogin(function(id){
      $scope.authenticateUserAndLoad();
    });
  }
  $scope.fbLogout = function(){
    fbLogout(function(id){
      $scope.authenticateUserAndLoad();
    });
  }
  $scope.authenticateUserAndLoad();

});


app.filter("del2html", ['$sce', function($sce) {
  return function(str){
    htmlCode = str.replace(/\[/g, "<strike>").replace(/\]/g, "</strike>");
    return $sce.trustAsHtml(htmlCode);
  }
}]);
