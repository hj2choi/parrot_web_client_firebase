//*******************************************************************************
//   Author: CHOI, Hong Joon
//   Ver : 2015.12.23
//   Description:
//                1) include this file in the html code ex): <script src="runtimeLogger.js"></script>
//                2) Call liveLog(string);
//
//*******************************************************************************

var ENABLE_LOG = true;

var MAX_LOG_LENGTH = 10;
var MAX_MESSAGE_LENGTH = 40;
var AUTOHIDE_IN_MILLIS = 5000;

var messagesList = [];
var prevTimeoutID = -1;

// private routine: create CSS object for debugConsole, just once
function createConsoleBoxStyle() {
  var style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = ".debugConsoleDiv { " +
                    "position: fixed; " +
                    "z-index: -1;" +
                    "background-color: rgba(0,0,0,0.6); " +
                    "border-style: ridge;" +
                    "border-color: #FFFFFF;" +
                    "border-width: 2px;" +
                    "margin-top:50px;" +
                    "right:50px;" +
                    "height: "+(22*MAX_LOG_LENGTH+50)+"px;" +
                    "width: "+(11*MAX_MESSAGE_LENGTH+20)+"px;" +
                    "display: inline-block;" +
                    "transition: opacity .35s ease-in-out; }";
  document.getElementsByTagName('head')[0].appendChild(style);
}


// private routine: create HTML element, just once
function initConsole() {
  // create temporary element
  var htmlFragment = document.createDocumentFragment(),
  temp = document.createElement('div');
  temp.innerHTML = "<div id=\"debugConsoleDiv\" class=\"debugConsoleDiv\">"+
                    "<p style=\"color: white;\" id=\"debugConsole\"></p>"+
                    "</div>";
  while (temp.firstChild)
    htmlFragment.appendChild(temp.firstChild);
  //insert htmlFragment into <body>
  document.body.insertBefore(htmlFragment, document.body.childNodes[0]);
  createConsoleBoxStyle();
}

//public
function toggleLog(enable) {
  ENABLE_LOG=enable;
}

function liveLog(message) {
  if (!ENABLE_LOG)
    return;
  if (!document.getElementById("debugConsole")) {
    try{initConsole();}
    catch(err){return;}
  }
  // delete old messages and push new one
  message = message.substring(0,MAX_MESSAGE_LENGTH);
  if (messagesList.length>=MAX_LOG_LENGTH)
		messagesList.splice(0, 1);
	messagesList.push(message);
  // display messages
  var htmlString = "";
	for (var i=0; i<messagesList.length; ++i)
		htmlString += ": "+messagesList[i]+"<br>";
  document.getElementById("debugConsole").innerHTML=htmlString;
  // set visibility, and autohide after 5 seconds
  document.getElementById("debugConsoleDiv").style.opacity = "1";
  if (prevTimeoutID!=-1)
    clearTimeout(prevTimeoutID);
  prevTimeoutID = setTimeout( function(){document.getElementById("debugConsoleDiv").style.opacity = "0";}, AUTOHIDE_IN_MILLIS );
}

//debugLog("test"); // it will throw error on initConsole() and terminate
