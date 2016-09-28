// Initialize Firebase config
var config = {
  // apiKey: "AIzaSyC3f8DCf6hI8Pj6abPDEtGc2k8x-OPtJE4",
  // authDomain: "sample-2fee0.firebaseapp.com",
  // databaseURL: "https://sample-2fee0.firebaseio.com",
  // storageBucket: "sample-2fee0.appspot.com",
  apiKey: "AIzaSyCN4VE64n2J8MvaaN1xpaRLN8G9dNXhQZI",
  authDomain: "alexa-parrot.firebaseapp.com",
  databaseURL: "https://alexa-parrot.firebaseio.com",
  storageBucket: "alexa-parrot.appspot.com"
};

function addRecord(input_name, input_score) {
  liveLog("removeRecord('"+input_name+"', '"+input_score+"')");
  firebase.database().ref('record/').push({
    name: input_name,
    score: input_score
  });
}

function removeRecord(id) {
  liveLog("removeRecord('"+id+"')");
  firebase.database().ref('record/' + id).remove();
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
    $scope.data = nodes;
  });

  $scope.search = function(item) {
    if (!$scope.searchName || item.name.toLowerCase().indexOf($scope.searchName.toLowerCase())!=-1) {
      return true;
    }
    return false;
  }

  $scope.removeNode = function(node) {
    removeRecord(node.key);
  }
}

var databaseSubmitController = function($scope) {
  $scope.submitRecord = function() {
    addRecord($scope.name, $scope.score);
  }
}


firebase.initializeApp(config);
var myApp = angular.module("myModule", ["firebase"])
                  .controller("databaseViewController", databaseViewController)
                  .controller("databaseSubmitController", databaseSubmitController);
