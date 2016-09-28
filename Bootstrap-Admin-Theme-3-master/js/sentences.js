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

function addRecord(input_level, input_sentence) {
  liveLog("addSentence ('"+input_level+"', '"+input_sentence+"')");
  firebase.database().ref('/DB/sentences').push({
    level: input_level,
    sentence: input_sentence,
    used: 3,
    correct:0,
    accuracy:0
  });
}

function updateRecord(key, input_level, input_sentence) {
  liveLog("update sentence["+key+"] with ("+input_level+", "+input_sentence+")");
  firebase.database().ref('/DB/sentences/'+key).update({
    level: input_level,
    sentence: input_sentence
  });
}

function removeRecord (key) {
  liveLog("removeSentence ('"+key+"')");
  firebase.database().ref('/DB/sentences/' + key).remove();
}


var databaseViewController = function($scope, $firebaseObject) {
  var ref = new Firebase(config.databaseURL+"/DB/sentences");
  var firebaseObj = $firebaseObject(ref);

  // For three-way data bindings, use bind()
  firebaseObj.$watch(function() {
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
    updateRecord(node.key, level, sentence);
  }

  $scope.remove = function(node) {
    if (confirm("delte sentence id "+node.key+"?")) {
      removeRecord(node.key);
    }
  }
}

var sentenceSubmitController = function($scope) {
  $scope.submitRecord = function() {
    addRecord($scope.level, $scope.sentence);
  }
}


firebase.initializeApp(config);
var myApp = angular.module("myModule", ["firebase"])
                  .controller("databaseViewController", databaseViewController)
                  .controller("sentenceSubmitController", sentenceSubmitController);

$(document).ready(function() {
  //$('#example').dataTable();
} );
