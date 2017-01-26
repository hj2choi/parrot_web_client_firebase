////////////////////////////////////////////
//      configurations
///////////////////////////////////////////
var express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');
var app = express();
var path = require("path");

/////////////// on heroku or local

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node (heroku & local) app is running on port', app.get('port'));
});
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


////////////////////////////////////////////
//      page views
///////////////////////////////////////////
app.get('/', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/index.html'));
});
app.get('/index.html', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/index.html'));
});
app.get('/sentences.html', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/sentences.html'));
});
app.get('/test_sentences.html', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/test_sentences.html'));
});
app.get('/trial_sentences.html', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/trial_sentences.html'));
});
app.get('/users.html', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/users.html'));
});
app.get('/settings.html', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/settings.html'));
});
app.get('/client_index.html', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/client_index.html'));
});
app.get('/authTest.html', function(request, res) {
  console.log("get /");
  res.sendFile(path.join(__dirname+'/views/authTest.html'));
});
