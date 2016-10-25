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

//TODO: create factory function

var ADMIN_NAME_TEMP = "Hong Joon CHOI"; // need to use actual account in the future
var DB_REF = "/sentences/level/";


var unwatch;  // function used to unregister data event listener
var dataLoad = 1;

var currentLevel=1;
var reference_data=[];

var sort_col = 1;
var sort_ascending_order = true;
var SORT_LIST = ["level", "sentence", "used", "correct", "accuracy"];


var sentenceObjectFactory = function(_level, _sentence, _update_target) {
  var _update_date = Date();
  var _update_usr = ADMIN_NAME_TEMP;
  var _create_date = Date();
  var _create_usr = ADMIN_NAME_TEMP;
  var _used=0;
  var _correct=0;
  var _accuracy=0;

  if (_update_target) {
    _create_date = _update_target.created_at;
    _create_usr = _update_target.created_by;
    _used = _update_target.used;
    _correct = _update_target.correct;
    _accuracy = _update_target.accuracy;
  }

  return {
    sentence: _sentence,
    level: _level,
    used: _used,
    correct: _correct,
    accuracy: _accuracy,
    created_at: _create_date,
    created_by: _create_usr,
    updated_at: _update_date,
    updated_by: _update_usr,
  };
}


/*
  add sentence to firebase

  returns true if there is an error

*/
function addSentence(input_level, input_sentence, update_target) {
  liveLog("addSentence ('"+input_level+"', '"+input_sentence+"')");
  // input validation
  if (!input_level || isNaN(input_level) || !(parseInt(input_level)>0 && parseInt(input_level)<10)) {
    return -1;
  }
  if (!input_sentence) {
    return -2;
  }

  firebase.database().ref(DB_REF+input_level).push(sentenceObjectFactory(input_level, input_sentence, update_target));
  return 0;
}


function updateSentence(node, input_level, input_sentence) {
  //liveLog("update sentence["+node.key+"] with ("+input_level+", "+input_sentence+")");
  // input validation
  if (!input_level || isNaN(input_level) || !(parseInt(input_level)>0 && parseInt(input_level)<10)) {
    return -1;
  }
  if (!input_sentence) {
    return -2;
  }

  console.log(node);

  // remove old node
  for (var i=1; i<10; ++i) {
    firebase.database().ref(DB_REF + i+"/"+node.key).remove();
  }
  // add updated node
  addSentence(input_level, input_sentence, node);
  return 0;
}

function removeSentence (level, key) {
  if (confirm("delte sentence id "+key+"?")) {
    liveLog("removeSentence ('"+key+"')");
    firebase.database().ref(DB_REF + level+"/"+key).remove();
  }
}

function parseSentencesData(level, firebaseObj) {
  var nodes = new Array();
  angular.forEach(firebaseObj, function(value, key) {
    value.key = key;
    value["level"] = level;
    nodes.push(value);
  });
  return nodes;
}

/*
  pulls sentences data by level and registers new data event listener

  requisite:  Firebase dependency and connection to firebase
              unwatch as global variable
              reference_data as global variable
              dataLoad as global variable
              liveLog function
*/
function pullSentencesDataByLevel(level, $scope, $firebaseObject) {
  if (level <1 || level>9) {
    console.log("ERR: invalid level");
    return false;
  }

  if (unwatch) {
    unwatch();
  }
  dataLoad=1;
  setTimeout(loadMsgUI, 0);

  var ref = new Firebase(config.databaseURL+DB_REF+level);
  var firebaseObj = $firebaseObject(ref);

  unwatch = firebaseObj.$watch(function() {
    dataLoad=-5; // signals the completion of load
    liveLog("pulled up-to date data (level "+level+")");
    console.log(firebaseObj);
    reference_data = parseSentencesData(level, firebaseObj).slice(); // copy by value
    $scope.data = reference_data;
  });

  return true;
}

var databaseViewController = function($scope, $firebaseObject) {
  //liveLog("pulling data from firebase");
  pullSentencesDataByLevel(1, $scope,$firebaseObject);
  $scope.levelValue = "1";

  $scope.onLevelChange = function(){
    //liveLog("onLevelChange()");
    pullSentencesDataByLevel($scope.levelValue, $scope,$firebaseObject);
  }

  $scope.filterByString = function(item) {
    if (!$scope.searchValue || $scope.searchValue.length<=1) {
      return true;
    }
    var sentenceFlag = item.sentence.toLowerCase().indexOf($scope.searchValue.toLowerCase())!=-1;
    var levelFlag = (""+item.level).toLowerCase() == ($scope.searchValue.toLowerCase());

    if (levelFlag || sentenceFlag) {
      return true;
    }
    return false;
  }

  $scope.update = function(node, level, sentence) {
    if (updateSentence(node, level, sentence)) {
      liveLog("updateSentence(): failed to validate input.");
    }
  }

  $scope.remove = function(node) {
    removeSentence(node.level, node.key);
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
    if (addSentence($scope.level, $scope.sentence, null)) {
      liveLog("addSentence(): failed to validate input.");
    }

  }

  $scope.batchUpload = function(input_file) {
    console.log(input_file);
  }
}

function loadMsgUI () {
  //console.log("loadMsgUI("+dataLoad+")");
  var msgHTML = "";
  for (var i=0; i<dataLoad%4; ++i)
    msgHTML+="..";
  dataLoad++;
  $("#loadMsg").html(msgHTML+"");
  if (dataLoad < 0) {
    $("#loadMsg").html("");
    return;
  }
  setTimeout(loadMsgUI, 200);
}
setTimeout(loadMsgUI, 0);


firebase.initializeApp(config);
var myApp = angular.module("myModule", ["firebase"])
                  .controller("databaseViewController", databaseViewController)
                  .controller("sentencesSortController", sentencesSortController)
                  .controller("sentenceSubmitController", sentenceSubmitController)
                  .filter("sentencesSortFilter", function(){return sentencesSortFilter});
