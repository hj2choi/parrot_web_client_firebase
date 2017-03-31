
// Jay's firebase
var config = {
  apiKey: "AIzaSyCN4VE64n2J8MvaaN1xpaRLN8G9dNXhQZI",
  authDomain: "alexa-parrot.firebaseapp.com",
  databaseURL: "https://alexa-parrot.firebaseio.com",
  storageBucket: "alexa-parrot.appspot.com"
};

var  DB_REF = "/settings/";

console.log("settings.js");

var settingsController = function($scope, $firebaseObject) {
  console.log("settings controller");

  var ref = new Firebase(config.databaseURL+DB_REF);
  $scope.settings = $firebaseObject(ref);
  console.log($scope.settings);

  $scope.resetSettings = function() {
    console.log("resetSettings()");
    console.log($scope.settings);
    $scope.settings.accuracy_pass = 70;
    $scope.settings.level_num_check = 5;
    $scope.settings.level_num_pass = 3;
    $scope.settings.player_max_num = 5;
  }

  $scope.saveSettings = function() {
    console.log("saveSettings");
    console.log($scope.settings);
    if (parseFloat($scope.settings.accuracy_pass)>0 && parseFloat($scope.settings.accuracy_pass)<=100) {
      if (parseInt($scope.settings.level_num_check)>=1 && parseInt($scope.settings.level_num_pass)>=1 && parseInt($scope.settings.player_max_num)>=1) {
        console.log("passed validation");
        firebase.database().ref(DB_REF+"accuracy_pass/").set(parseFloat($scope.settings.accuracy_pass));
        firebase.database().ref(DB_REF+"level_num_check/").set(parseFloat($scope.settings.level_num_check));
        firebase.database().ref(DB_REF+"level_num_pass/").set(parseFloat($scope.settings.level_num_pass));
        firebase.database().ref(DB_REF+"player_max_num/").set(parseFloat($scope.settings.player_max_num));
        $scope.error_msg = "Successfully saved current settings";
        return;
      }
    }
    $scope.error_msg = "ERROR: validation failed";
    console.log("error");
  }

}


firebase.initializeApp(config);
var myApp = angular.module("myModule", ["firebase"])
                  .controller("settingsController", settingsController);
