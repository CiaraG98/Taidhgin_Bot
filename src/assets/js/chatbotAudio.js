var request = new XMLHttpRequest();
var audio_reply = "";
var audioPlayer;
var audioCheckbox;
var showingControls = false;

// Array of bubbles in chat containing text and audio
var bubbleObjArr = [];
var thisId = 0;
var isPlaying = false;

//sets up for messages to be edited and urls to be called
function audio(newReply, id, isUser){
  audio_reply = newReply;
  thisId = id;
  let newBubble;
  var bubbleText = "";
  if(isUser == false){
    // message is from bot
    // remove html and rivescript tags
    let editedMessage = editMessageForAudio();
    // check if message from bot is a hint
    if(editedMessage[2] == "//www"){
      bubbleText = "Úsáid tearma.ie chun cabhrú leat munar thuig tú téarma ar leith.";
      newBubble = { text: bubbleText, id: thisId, url: null, isUser: isUser };
    }
    else if(editedMessage[3] == "//www"){
      bubbleText = "An bhfuil aon fhocail nár thuig tú? Féach sa bhfoclóir ag teanglann.ie.";
      newBubble = { text: bubbleText, id: thisId, url: null, isUser: isUser };
    }
    else if(editedMessage != ""){
      var notAHint = true;
      for(i = 0; i < editedMessage.length; i++){
        if(editedMessage[i].indexOf("teanglann") != -1){
          notAHint = false;
          bubbleText = "Mícheart, beagnach ceart ach féach arís air, a " + getName() + ". Hint: teanglann.ie"
          newBubble = { text: bubbleText, id: thisId, url: null, isUser: isUser };
        }
      }
      if(notAHint){
        for(i = 0; i < editedMessage.length; i++){
          bubbleText = bubbleText.concat(editedMessage[i], ".");
        }
        newBubble = { text: bubbleText , id: thisId, url: null, isUser: isUser };
      }
    }
  }
  else{
    // message is from user or bot message is not a hint
    bubbleText = audio_reply;
    newBubble = { text: audio_reply , id: thisId, url: null, isUser: isUser };
  }
  bubbleObjArr.push(newBubble);
  //console.log(bubbleObjArr);
  makeMessageObj(isUser, bubbleText);
  callAudio(bubbleText, thisId);
}

//edits messages to be played & adds them to array
function editMessageForAudio(){
  let inp = [];
  var inputString = audio_reply;
  var index = inputString.indexOf("Ceist:");
  var j = 0;
  var length;
  if(inputString.indexOf("<p") != -1){
    var i = inputString.indexOf("<");
    var j = inputString.indexOf(">");
    inputString = inputString.replace("<p style=\"display:none\">", "");
    inputString = inputString.replace("</p>", "");
    inp.push(inputString);
    return;
  }
  else{
    for(i = 0; i < inputString.length; i++){
      if(inputString[i] == "." || inputString[i] == ":" || inputString[i] == "?" || inputString[i] == "!"){
        length = i - j;
        var newString = inputString.substr(j, length);
        j = i + 1;
        if(newString != "ERR" || newString != " ")
          inp.push(newString);
      }
      if(inputString[i] == "'"){
        inputString[i] == inputString[i].replace("'", "");
      }
    }
    var currentSentence;
    for(i = 0; i < inp.length; i++){
      currentSentence = inp[i];
      for(j = 0; j < currentSentence.length; j++){
        indexOf1 = currentSentence.indexOf("<b>");
        indexOf2 = currentSentence.indexOf("<i>");
        indexOf3 = currentSentence.indexOf("</b>");
        indexOf4 = currentSentence.indexOf("</i>");
        indexOf5 = currentSentence.indexOf("<br>");
        indexOf6 = currentSentence.indexOf("-");
        if(indexOf1 != -1){
          inp[i] = inp[i].replace("<b>", "");
        }
        if(indexOf2 != -1){
          inp[i] = inp[i].replace("<i>", "");
        }
        if(indexOf3 != -1){
          inp[i] = inp[i].replace("</b>", "");
        }
        if(indexOf4 != -1){
          inp[i] = inp[i].replace("</i>", "");
        }
        if(indexOf5 != -1){
          inp[i] = inp[i].replace("<br>", "");
        }
        if(indexOf6 != -1){
          inp[i] = inp[i].replace("-", "");
        }
      }
    }
  }
  return inp;
}

function callAudio(testString, id){
  console.log(testString);
  if(currentDialect != ''){
    var messageBubble = {text: testString, dialect: currentDialect};
    request.open('POST', 'http://localhost:4000/Chatbot/getAudio', true);
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify(messageBubble));
    request.onload = function(){
      console.log(JSON.parse(this.response));
      var bubbleUrl =JSON.parse(this.response).audio[0];
      //assign audio url to message bubble
      let bubble = bubbleObjArr.find(obj => obj.id == id);
      bubble.url = bubbleUrl;
      if(audioCheckbox.checked == true && bubble.isUser == false){
        playAudio(bubble);
      }
    }
  }
}

function testDNN(){
  var messageBubble = {text: "dia dhuit", dialect: 'MU'};
  request.open('POST', 'http://localhost:4000/Chatbot/getDNNAudio', true);
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(messageBubble));
  request.onload = function(){
    audioPlayer.src = this.response;
    audioPlayer.play();
  }
}

//plays audio
function playAudio(bubble){
  if(bubble.url){
    audioPlayer.src = bubble.url;
    var playPromise = audioPlayer.play();
    if(playPromise !== undefined){
      playPromise.then(_ => {
      }).catch(error => {
        console.log(error);
      });
    }
  }
}

function manualPlay(id){
  let bubble = bubbleObjArr.find(obj => obj.id == id);
  if(bubble.url != undefined){
    if(!showingControls){
      $('#' + id + '.message_parent .bot-message').append('<div class="controls-popup"><div class="arrow-left"></div><div class="controls"><i class="fas fa-pause-circle manual-pause" onclick="audioPlayer.pause();"></i> <i class="fas fa-play-circle manual-play" onclick="audioPlayer.play();"></i></div></div>');
      showingControls = true;
    }
    playAudio(bubble);
    audioPlayer.onended = function(){
      showingControls = false;
      $('#' + id + '.message_parent .bot-message .controls-popup').remove();
    }
  }
}
