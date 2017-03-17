// // Initialize Firebase config
// var config = {
//   apiKey: "AIzaSyC5-ireu5x6zNiaLUyZyId2kJ5Chge7dDs",
//   authDomain: "parrot-db.firebaseapp.com",
//   databaseURL: "https://parrot-db.firebaseio.com",
//   storageBucket: "parrot-db.appspot.com",
//   messagingSenderId: "8731713390"
// };

// Jay's firebase
var config = {
  apiKey: "AIzaSyCN4VE64n2J8MvaaN1xpaRLN8G9dNXhQZI",
  authDomain: "alexa-parrot.firebaseapp.com",
  databaseURL: "https://alexa-parrot.firebaseio.com",
  storageBucket: "alexa-parrot.appspot.com"
};

var ADMIN_NAME_TEMP = "Hong Joon CHOI"; // need to use actual account in the future
var DB_REF = "/users/";

var unwatch;  // function used to unregister data event listener
var data_load_progress = 1;

var sort_col = 1;
var sort_ascending_order = true;
var SORT_LIST = ["level", "sentence", "used", "correct", "accuracy"];

/*
  add sentence to firebase

  returns true if there is an error
*/
function addSentence(input_address) {
  liveLog("register new email ('"+input_address+"')");

  // input validation
  if (!input_address) {
    return -2;
  }

  var processed_input_address = input_address.replace(/[^\w]/gi, "_");

  var new_user = {};
  new_user[processed_input_address] = "null";
  console.log(new_user);

  firebase.database().ref(DB_REF).update(new_user);
  return 0;
}

function removeSentence (key) {
  if (confirm("remove user, id "+key+"?")) {
    if (confirm("REMOVING USER IS IRREVERTIBLE. CONFIRM?")) {
      liveLog("unregistered user ('"+key+"')");
      firebase.database().ref(DB_REF+key).remove();
      firebase.database().ref("/levelhistory/"+key).remove();
      firebase.database().ref("/sentencetostudy/"+key).remove();
    }
  }
}


function searchFilter($scope, item){
  //console.log(item);
  if (!$scope.searchValue) {
    return true;
  }
  var sentenceFlag = item.$id.toLowerCase().indexOf($scope.searchValue.toLowerCase())!=-1;

  if (sentenceFlag) {
    return true;
  }
  return false;
}

var databaseViewController = function($sce, $scope, $firebaseArray, $firebaseObject) {
  //liveLog("pulling data from firebase");
  //pullSentencesDataByLevel($scope,$firebaseObject);
  var ref = firebase.database().ref().child(DB_REF);
  $scope.data = $firebaseArray(ref);

  $scope.levelValue = "1";
  $scope.list_length = 0;

  $scope.onLevelChange = function(){
    pullSentencesDataByLevel($scope.levelValue, $scope,$firebaseObject);
  }

  $scope.filterByString = function(item) {
    return searchFilter($scope, item);
  }

  $scope.update = function(node, sentence) {
    if (updateSentence(node, sentence)) {
      liveLog("updateSentence(): failed to validate input.");
    }
  }

  $scope.remove = function(node) {
    removeSentence(node.$id);
  }
}

var sentencesSortFilter = function(input, optional1, optional2) {
  if (!input) {
    return input
  }
  input.sort(function(a,b) {
    if (a[SORT_LIST[sort_col]]>b[SORT_LIST[sort_col]]) {
      return sort_ascending_order?1:-1;
    }
    if (a[SORT_LIST[sort_col]]<b[SORT_LIST[sort_col]]) {
      return sort_ascending_order?-1:1;
    }
    return 0;
  });
  return input;
}

var sentencesSortController = function($scope) {
  function updateSortUI() {
    $scope.sort_arrow_0 = (sort_col!=0?"--":(!sort_ascending_order?'▲':'▼'));
    $scope.sort_arrow_1 = (sort_col!=1?"--":(!sort_ascending_order?'▲':'▼'));
    $scope.sort_arrow_2 = (sort_col!=2?"--":(!sort_ascending_order?'▲':'▼'));
    $scope.sort_arrow_3 = (sort_col!=3?"--":(!sort_ascending_order?'▲':'▼'));
    $scope.sort_arrow_4 = (sort_col!=4?"--":(!sort_ascending_order?'▲':'▼'));
  }
  updateSortUI();

  $scope.changeSortRule = function(_sort_col) {
    //liveLog("changeSortRule("+sort_col+")");
    if (sort_col == _sort_col) {
      sort_ascending_order = !sort_ascending_order;
    } else {
      sort_col = _sort_col;
      sort_ascending_order = true;
    }
    updateSortUI();
  }
}

var sentenceSubmitController = function($scope) {

  $scope.submitSentence = function() {
    console.log("register new user()");
    var err = addSentence($scope.sentence);
    if (err == -2) {
      liveLog("register new user(): failed to validate input.");
      $scope.sentence="";
    }
    else {
      alert("new user successfully added: "+$scope.sentence);
      $scope.sentence="";
    }
  }

}

function loadMsgUI () {
  //console.log("loadMsgUI("+data_load_progress+")");
  var msgHTML = "";
  for (var i=0; i<data_load_progress%4; ++i)
    msgHTML+="..";
  data_load_progress++;
  $("#loadMsg").html(msgHTML+"");
  if (data_load_progress < 0) {
    $("#loadMsg").html("");
    return;
  }
  setTimeout(loadMsgUI, 200);
}


firebase.initializeApp(config);
var myApp = angular.module("myModule", ["firebase"])
                  .controller("databaseViewController", databaseViewController)
                  .controller("sentencesSortController", sentencesSortController)
                  .controller("sentenceSubmitController", sentenceSubmitController)
                  .filter("sentencesSortFilter", function(){return sentencesSortFilter;});
