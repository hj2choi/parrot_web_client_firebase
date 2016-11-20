var DEV_MODE = false; // if set to true, it will create sampe user for new account

function createSampleUser(user, uid) {
  if (!DEV_MODE) {
    return;
  }
  if (!uid || uid=="") {
    return;
  }

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
  var user_levelhistory_obj={};
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

  firebase.database().ref(USERS_MISSPELLEDWORDS_REF+uid).update(user_misspelledwords_obj);
}
//createSampleUser("jay","");
