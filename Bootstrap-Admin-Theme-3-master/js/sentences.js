// Initialize Firebase config
var config = {
  apiKey: "AIzaSyC5-ireu5x6zNiaLUyZyId2kJ5Chge7dDs",
  authDomain: "parrot-db.firebaseapp.com",
  databaseURL: "https://parrot-db.firebaseio.com",
  storageBucket: "parrot-db.appspot.com",
  messagingSenderId: "8731713390"
};

// Initialize Firebase config
// var config = {
//   apiKey: "AIzaSyCN4VE64n2J8MvaaN1xpaRLN8G9dNXhQZI",
//   authDomain: "alexa-parrot.firebaseapp.com",
//   databaseURL: "https://alexa-parrot.firebaseio.com",
//   storageBucket: "alexa-parrot.appspot.com"
// };

var dataLoad = 1;

function addSentence(input_level, input_sentence) {
  liveLog("addSentence ('"+input_level+"', '"+input_sentence+"')");
  // input validation
  if (isNaN(input_level) || (parseInt(input_level)<1) || parseInt(input_level)>9) {
    return -1;
  }

  firebase.database().ref('/DB/sentences').push({
    level: input_level,
    sentence: input_sentence,
    used: 0,
    correct:0,
    accuracy:0
  });
  return 0;
}

function updateSentence(key, input_level, input_sentence) {
  liveLog("update sentence["+key+"] with ("+input_level+", "+input_sentence+")");
  // input validation
  if (isNaN(input_level) || (parseInt(input_level)<1) || parseInt(input_level)>9) {
    return -1;
  }

  firebase.database().ref('/DB/sentences/'+key).update({
    level: input_level,
    sentence: input_sentence
  });
  return 0;
}

function removeSentence (key) {
  if (confirm("delte sentence id "+key+"?")) {
    liveLog("removeSentence ('"+key+"')");
    firebase.database().ref('/DB/sentences/' + key).remove();
  }
}

var databaseViewController = function($scope, $firebaseObject) {
  liveLog("pulling data from firebase");
  var ref = new Firebase(config.databaseURL+"/DB/sentences");
  var firebaseObj = $firebaseObject(ref);

  // For three-way data bindings, use bind()
  firebaseObj.$watch(function() {
    dataLoad=-5; // signals the completion of load
    liveLog("watching for data change");
    var nodes = new Array();
    angular.forEach(firebaseObj, function(value, key) {
      value.key = key;
      nodes.push(value);
    });
    console.log(nodes);
    $scope.data = nodes;
  });

  $scope.search = function(item) {
    if (!$scope.searchValue) {
      return true;
    }
    var sentenceFlag = item.sentence.toLowerCase().indexOf($scope.searchValue.toLowerCase())!=-1;
    var idFlag = item.key.toLowerCase() == ($scope.searchValue.toLowerCase());
    var levelFlag = (""+item.level).toLowerCase() == ($scope.searchValue.toLowerCase());

    if (idFlag || levelFlag || sentenceFlag) {
      return true;
    }
    return false;
  }

  $scope.update = function(node, level, sentence) {
    if (updateSentence(node.key, level, sentence)) {
      liveLog("updateSentence(): failed to validate input.");
    }
  }

  $scope.remove = function(node) {
    removeSentence(node.key);
  }
}

var sentenceSubmitController = function($scope) {
  $scope.submitSentence = function() {
    if (addSentence($scope.level, $scope.sentence)) {
      liveLog("addSentence(): failed to validate input.");
    }

  }
}

firebase.initializeApp(config);
var myApp = angular.module("myModule", ["firebase"])
                  .controller("databaseViewController", databaseViewController)
                  .controller("sentenceSubmitController", sentenceSubmitController);


function loadMsg () {
  var msgHTML = "";
  for (var i=0; i<dataLoad%4; ++i)
    msgHTML+="..";
  dataLoad++;
  $("#loadMsg").html(msgHTML+"");
  if (dataLoad < 0) {
    $("#loadMsg").html("");
    return;
  }
  setTimeout(loadMsg, 200);
}
setTimeout(loadMsg, 200);
