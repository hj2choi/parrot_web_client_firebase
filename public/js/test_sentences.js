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
var DB_REF = "/test_sentences/";

var unwatch;  // function used to unregister data event listener
var data_load_progress = 1;

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
  add sentence to main DB
*/
function addToMainDB(input_level, input_sentence, original_key) {
  liveLog("addToMainDB ('"+input_level+"', '"+input_sentence+"')");
  // input validation
  if (!input_level || isNaN(input_level) || !(parseInt(input_level)>0)) {
    return -1;
  }
  if (!input_sentence) {
    return -2;
  }

  console.log("addToMainDB: "+original_key);

  firebase.database().ref("/sentences/level/"+input_level).push(sentenceObjectFactory(input_level, input_sentence, null));
  firebase.database().ref(DB_REF+original_key).remove();

  return 0;
}


/*
  add sentence to firebase

  returns true if there is an error
*/
function addSentence(input_sentence) {
  liveLog("addSentence ('"+input_sentence+"')");
  // input validation
  if (!input_sentence) {
    return -2;
  }

  firebase.database().ref(DB_REF).push(sentenceObjectFactory(1,input_sentence, null));
  return 0;
}

function updateSentence(node, input_sentence) {
  liveLog("update sentence["+node.key+"] with ("+input_sentence+")");
  // input validation
  firebase.database().ref(DB_REF).put({sentence:input_sentence});

  return 0;
}

function removeSentence (key) {
  if (confirm("delte sentence id "+key+"?")) {
    liveLog("removeSentence ('"+key+"')");
    firebase.database().ref(DB_REF+key).remove();
  }
}


/*
  parse raw firebaseObj into angularjs-repeat tag consumable array form
*/
function parseSentencesData(firebaseObj) {
  var nodes = new Array();
  angular.forEach(firebaseObj, function(value, key) {
    console.log(value);
    value.key = key;
    nodes.push(value);
  });
  return nodes;
}

/*
  pulls sentences data by level and registers new data event listener
*/
function pullSentencesDataByLevel($scope, $firebaseObject) {
  if (unwatch) {
    unwatch();
  }
  data_load_progress=1;
  loadMsgUI();

  var ref = new Firebase(config.databaseURL+DB_REF/*+level*/);
  var firebaseObj = $firebaseObject(ref);

  unwatch = firebaseObj.$watch(function() {
    data_load_progress=-5; // signals the completion of load
    liveLog("pulled up-to date data");
    $scope.data = parseSentencesData(firebaseObj).slice();

    //console.log("data = ");
    //console.log($scope.data);
    $scope.list_length = $scope.data.length;
  });

  return true;
}

function searchFilter($scope, item){
  if (!$scope.searchValue) {
    return true;
  }
  var sentenceFlag = item.sentence.toLowerCase().indexOf($scope.searchValue.toLowerCase())!=-1;

  if (sentenceFlag) {
    return true;
  }
  return false;
}

var databaseViewController = function($scope, $firebaseObject) {
  //liveLog("pulling data from firebase");
  pullSentencesDataByLevel($scope,$firebaseObject);
  $scope.levelValue = "all";
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
    removeSentence(node.key);
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
    var err = addSentence($scope.sentence);
    if (err == -2) {
      liveLog("addSentence(): failed to validate input.");
      $scope.sentence="";
    }
    else {
      alert("sentence successfully added: "+$scope.sentence);
      $scope.sentence="";
    }
  }

  $scope.addToMainDB = function(target) {
    console.log(target.node);

    var targetLevel = prompt("sentence:\n\""+target.node.sentence+"\"\nWhich level?");

    var err = addToMainDB(targetLevel, target.node.sentence, target.node.key);
    if (err == -1) {
      liveLog("addToMainDB(): failed to validate input.");
    } else if (err == -2) {
      liveLog("addToMainDB(): failed to validate input.");
      $scope.sentence="";
    }
    else {
      alert("sentence successfully added to main DB: ["+targetLevel+"] "+$scope.sentence);
      $scope.sentence="";
    }
  }

  $scope.addAllToMainDB = function() {
    console.log("addAllToMainDB()");
    console.log($scope.data);
    var sentences = $scope.data.slice();
    var targetLevel = prompt("Which level?");

    for (var i=0; i<sentences.length; ++i) {
      console.log(sentences[i]);
      var err = addToMainDB(targetLevel, sentences[i].sentence, sentences[i].key);
      if (err == -1) {
        liveLog("addToMainDB(): failed to validate input.");
      } else if (err == -2) {
        liveLog("addToMainDB(): failed to validate input.");
        $scope.sentence="";
      }
      else {
      }
    }

    alert("sentences successfully added to main DB");
  }

  $scope.batchUpload = function() {
    console.log("uploading to test sentences table");
    var file = document.getElementById('inputFile').files[0];
    var file_reader = new FileReader();
    //console.log(file_reader);
    console.log(file.type);
    if (!file.type=="text/plain") {
      liveLog("ERROR: .txt file required! ");
      return;
    }
    file_reader.onload = receivedText;
    file_reader.readAsText(file);
    function receivedText(e) {
      try {
        lines = e.target.result.split("\n");
        console.log(lines);
        for (var i=0; i<lines.length; ++i) {
          console.log(lines[i]);
          if (lines[i]=="") {
            continue;
          }
          if (addSentence(lines[i])) {
            liveLog("ERROR: addSentence()");
          }
        }
      }
      catch(err) {
        liveLog("ERROR: something went wrong reading .json file");
      }

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
