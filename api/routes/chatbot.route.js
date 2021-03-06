const express = require('express');
const app = express();
const chatbotRoute = express.Router();
const fs = require('fs');
const https = require("https");
const http = require('http');
const querystring = require('querystring');
const request = require('request');
const { parse, stringify } = require('node-html-parser');
const path = require('path');
const nodemailer = require('nodemailer');

// Require Chatbot model in our routes module
let Models = require('../models/Chatbot');
var spellings;

// For writing scripts
var punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
var regex = new RegExp('[' + punctuation + ']', 'g');
let firstLine = "\n\n+ start\n";
let lastLine = "\n\n+ finish \n- End of Script!";
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

  let writetofile = fs.createWriteStream(filename, {flags: 'a'});
  writetofile.write(chatSetup);
  writetofile.write(firstLine);

  let keys = Object.keys(content);

  for(var key of Object.keys(content)){
    let nextKey = keys[keys.indexOf(key) + 1];
    let trigger = "";

    //- Q1 
    let line = "- " + key + "\n\n";
    //+ *
    //% q1
    //- Nope Wrong <call>chatSetup ans1w</call>
    line += "+ *\n% " + key.toLowerCase().replace(regex, '');
    if(nextKey == undefined){
      line += "\n- Nope Wrong! <call>chatSetup finish</call>\n\n";
    }
    else{
      line += "\n- Nope Wrong! <call>chatSetup " + content[key][0].toLowerCase().replace(regex, '') + "w</call>\n\n";
    }

    if(nextKey != undefined){
      line += "+ " + content[key][0].toLowerCase().replace(regex, '') + 'w\n';
      line += "- " + nextKey + '\n\n';
    }
    
    // + Ans1 OR + (Ans1|Ans2)
    if(content[key].length > 1){
      trigger += "(";
      for(let ans of content[key]){
        trigger += ans.toLowerCase().replace(regex, '') + "|"
      }
      trigger = trigger.slice(0, -1);
      trigger += ")";
    }
    else{
      trigger = content[key][0].toLowerCase().replace(regex, '');
    }
    // % q1
    line += "+ " + trigger + "\n% " + key.toLowerCase().replace(regex, '') + "\n";
    
    writetofile.write(line);
  }
  writetofile.write('- script done');
  writetofile.write(lastLine);
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

chatbotRoute.route('/getAudio/').post(function(req, res){
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
        'Host' : 'www.abair.ie',
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      //uri: 'https://www.abair.tcd.ie/webreader/synthesis',
      uri: 'https://abair.ie/webreader/synthesis',
      body: formData,
      method: 'POST'
    }, function(err, resp, body){
      if(err){
        console.log("ERROR");
        res.send(err);
      } 
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
  if(transcription){
    res.json({status: 200, text: transcription});
  }
  else{
    res.json({status: 404, error: 'no transcription found'});
  }
});

chatbotRoute.route('/getDNNAudio').post(function(req, res){
  let input = encodeURIComponent('Dia Dhuit, Is mise Taidhg??n. Cad a thabharfaidh m?? ort?');
  let voice = '&voice=' + encodeURIComponent('ga_MU_nnc_nnmnkwii');
  let speed = '&speed=' + encodeURIComponent(1);
  let encoding = '&audioEncoding=' + encodeURIComponent('MP3');
  let url = 'https://www.abair.ie/api2/synthesise?input=' + input + voice + speed + encoding;
  https.get(url, (resp) => {
    let data = '';
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      let thing = JSON.parse(data);
      const type = 'audio/mp3';
      const audioURI = 'data:' + type + ';base64,' + thing.audioContent;
      res.send(audioURI);
      console.log('done');
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

chatbotRoute.route('/sendScriptVerification').post(function(req, res){  
  let rive_dir = __dirname.substr(0, __dirname.length-10) + "src\\assets\\rive\\";
  const mailObj = {
    from: "gilsenci@tcd.ie",
    recipients: ["gilsenci@tcd.ie"],
    subject: 'Taidhg??n Script Verification + (user id?)',
    message: "Attatched is the script to be verified",
    attatchment: [
        {
            filename: req.body.name + '.rive',
            path: rive_dir + req.body.name + '.rive'
        }
    ]
  };
  sendEmail(mailObj).then((response) => {
    console.log(response);
    if(response){
      res.send("Email sent");
    }
  });
});

const sendEmail = async (mailObj) => {
  let dir = __dirname.substr(0, __dirname.length-6);
  let data = fs.readFileSync(path.join(dir, 'sendinbluekey.json'));
  let sendinblue_key = JSON.parse(data);

  //code from: https://schadokar.dev/posts/how-to-send-email-in-nodejs/  
  const {from, recipients, subject, message, attatchment} = mailObj;

  try {
      // create transporter
      let transporter = nodemailer.createTransport({
          host: "smtp-relay.sendinblue.com",
          port: 587, 
          auth: {
              user: sendinblue_key.user,
              pass: sendinblue_key.pass
          },
      });

      //send mail
      let mailStatus = await transporter.sendMail({
          from: from, 
          to: recipients,
          subject: subject,
          text: message,
          attachments: attatchment,
      });
      
      return `Message sent: ${mailStatus.messageId}`;
  } catch (error) {
      console.log(error);
      throw new Error(
          `Something went wrong in the sendmail method. Error: ${error.message}`
      );
  }
};

module.exports = chatbotRoute;
