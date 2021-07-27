const express = require('express');
const app = express();
const chatbotRoute = express.Router();
const fs = require('fs');
const https = require("https");
const http = require('http');
const querystring = require('querystring');
const request = require('request');
const { parse, stringify } = require('node-html-parser');

// Require Chatbot model in our routes module
let Models = require('../models/Chatbot');
let spellings;

// For writing scripts
let firstLine = "\n\n+ start\n";
let chatSetup = "> object chatSetup javascript\nif(args[1] == 'nowait') return chatSetup(args[0]);\nsetTimeout(function(){\n" +
  "  return chatSetup(args[0], args[1]);\n}, 2500);\nreturn '';\n< object";


//Create-Quiz Framwork
//store questions and answers in rive file
chatbotRoute.route('/SaveQandA').post(function(req, res){
  let path = '../src/assets/rive/';
  let content = req.body;
  let filename = path + content['topic-name'] + '.rive';
  delete content['topic-name'];
  console.log(filename);
  console.log(content);
  fs.appendFileSync(filename, chatSetup, (err) => {if(err) console.log(err);});
  fs.appendFileSync(filename, firstLine, (err) => {if(err) console.log(err);});
  for(var key of Object.keys(content)){
    let trigger = "";
    let line = "- " + key + "\n\n";

    line += "+ *\n% " + key.toLowerCase().replaceAll("[?]", "") + "\n- Nope Wrong! <call>chatSetup " + content[key] + "</call>\n\n";

    if(content[key].length > 1){
      trigger += "(";
      for(let ans of content[key]){
        trigger += ans.toLowerCase() + "|"
      }
      trigger = trigger.slice(0, -1);
      trigger += ")";
    }
    else{
      trigger = content[key].toLowerCase();
    }
    line += "+ " + trigger + "\n% " + key.toLowerCase().replaceAll("%3f", "").replaceAll("[?]", "") + "\n";
    //console.log(line);
    
    fs.appendFileSync(filename, line, (err) => {
      if(err) throw err;
    });
  }
  res.status(200).send("Success sending questions");
});

chatbotRoute.route('/deleteScript').post(function(req, res){
  console.log(req.body);
});

chatbotRoute.route('/saveSpellings').post(function(req, res){
  if(req.body){
    spellings = req.body;
    console.log(spellings);
    res.status(200).send("Spellings Saved");
  }
});

chatbotRoute.route('/getWords').get(function(req, res){
  console.log(spellings);
  if(spellings != []) res.send(spellings);
});

chatbotRoute.route('/getAudio').post(function(req, res){
  let bubble = new Models.AudioBubble(req.body);
  console.log(bubble);
  if(bubble.text){
    var form = {
      Input: bubble.text,
      Locale: "ga_" + bubble.dialect,
      Format: 'html',
      Speed: '1',
    };

    var formData = querystring.stringify(form);
    var contentLength = formData.length;

    request({
      headers: {
        'Host' : 'www.abair.tcd.ie',
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      uri: 'https://www.abair.tcd.ie/webreader/synthesis',
      body: formData,
      method: 'POST'
    }, function(err, resp, body){
      if(err) res.send(err);
      if(body){
        let audioContainer = parse(body.toString()).querySelectorAll('.audio_paragraph');
        let paragraphs = [];
        let urls = [];
        for(let p of audioContainer) {
            let sentences = [];
            for(let s of p.childNodes) {
                if(s.tagName === 'span') {
                    sentences.push(s.toString());
                } else if(s.tagName === 'audio') {
                    urls.push(s.id);
                }
            }
            paragraphs.push(sentences);
        }
        console.log("Success!");
        res.json({ html : paragraphs, audio : urls });
      } else {
        console.log("Fail");
        res.json({status: '404', message: 'No response from synthesiser'});
      }
    });
  } else {
    res.json({status: '404', message: 'Text not found'});
  }
});

var multer = require('multer');
var upload = multer();
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

chatbotRoute.route('/sendRecordedAnswer').post(upload.single("file"), async function(req, res){
  let audioBytes = req.file.buffer.toString('base64');
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
});

chatbotRoute.route('/getDNNAudio').post(function(req, res){
  let url = 'https://www.abair.tcd.ie/api2/synthesise?input=dia%20dhuit&voice=ga_UL';
  let voice = 'ga_MU';
  https.get(url, (resp) => {
    let data = '';
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data));
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});

//AIML Chit-Chat
chatbotRoute.route('/aiml-message').post(function(req, res){
  let path = 'http://demo.vhost.pandorabots.com/pandora/talk-xml?botid=da387bedce347878&input=';
  path += encodeURI(req.body.message);
  http.get(path, (resp) => {
    let data = '';
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(data);
      if(data) res.json({status: '200', reply: data});
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});

module.exports = chatbotRoute;
