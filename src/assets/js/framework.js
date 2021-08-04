//Framwork for adding content
var request = new XMLHttpRequest();
let numberofquestions = 5;
let numberofanswers = {"answer-1":1, "answer-2":1, "answer-3":1, "answer-4":1, "answer-5":1};
var currentFilename = '';

// ADD SOMETHING THAT ALLOWS ADDED QUESTIONS TO BE DELETED 

function addQuestion(){
  let questionDiv = document.getElementById('questions');
  let answerDiv = document.getElementById('answers');
  numberofquestions++;
  let newQ = document.createElement('div');
  let newA = document.createElement('div');
  newQ.setAttribute('class', 'new-Q');
  newQ.setAttribute('id', 'qdiv' + numberofquestions);
  newA.setAttribute('class', 'new-Q');
  newA.setAttribute('id', 'answer-' + numberofquestions);
  newQ.innerHTML = numberofquestions + '. ';
  newA.innerHTML = numberofquestions + '. ';
  let input1 = document.createElement('input');
  let input2 = document.createElement('input');
  input1.setAttribute('type', 'text');
  input2.setAttribute('type', 'text');
  input1.setAttribute('id', 'q' + numberofquestions);
  input2.setAttribute('id', 'a' + numberofquestions);
  input2.setAttribute('class', 'A');
  input1.setAttribute('placeholder', 'Insert Question');
  input2.setAttribute('placeholder', 'Insert Answer');

  let deletePrompt = document.createElement('button');
  deletePrompt.setAttribute('class', 'deleteQPrompt');
  deletePrompt.setAttribute('id', 'dq' + numberofquestions);
  deletePrompt.innerText = 'X';
  deletePrompt.style.display = 'none';

  deletePrompt.onclick = function(){
    console.log(deletePrompt.id);
    console.log(deletePrompt.id.charAt(2));
    $('#qdiv' + deletePrompt.id.charAt(2)).remove();
    $('#answer-' + deletePrompt.id.charAt(2)).remove();
  }

  input1.onmouseover = function(){
    deletePrompt.style.display = 'block';
  };

  input1.oninput = function(){deletePrompt.style.display = 'none';};

  newQ.appendChild(input1);
  newQ.appendChild(deletePrompt);
  newA.appendChild(input2);

  let addButton = document.createElement('button');
  addButton.innerText = 'Add Answer';
  addButton.setAttribute('class', 'add-A');
  addButton.setAttribute('type', 'submit');
  addButton.setAttribute('id', 'add' + numberofquestions);
  addButton.onclick = function(){ addAnswer(newA.id, addButton.id);}
  newA.appendChild(addButton);

  questionDiv.appendChild(newQ);
  answerDiv.appendChild(newA);
  $("#questions").animate({ scrollTop: $("#questions")[0].scrollHeight }, 200);
  $("#answers").animate({ scrollTop: $("#answers")[0].scrollHeight }, 200);

  numberofanswers['answer-' + numberofquestions] = 1;
}

function addAnswer(answer_id, button_id){
  numberofanswers[answer_id]++;
  $('#' + button_id).remove();
  let answer_number = answer_id.charAt(7);
  let answer = document.getElementById(answer_id);
  let newAnswer = document.createElement('input');
  newAnswer.setAttribute('type', 'text');
  newAnswer.setAttribute('class', 'A');
  newAnswer.setAttribute('id', 'a' + answer_number + numberofanswers[answer_id]);
  newAnswer.setAttribute('placeholder', 'add answer');
  answer.append(newAnswer);

  let button = document.createElement('button');
  button.innerText = 'Add Answer';
  button.setAttribute('class', 'add-A');
  button.setAttribute('type', 'submit');
  button.setAttribute('id', button_id);
  button.onclick = function(){ addAnswer(answer_id, button.id);}
  answer.append(button);
  
  $("#answers").animate({ scrollLeft: $("#answers")[0].scrollHeight }, 200);
}

function showVerificationStep(){
  $('#submit-container').css('top', '10%');
}

function done(){
  //current questions available
  let q1 = document.getElementById('q1');
  let q2 = document.getElementById('q2');
  let q3 = document.getElementById('q3');
  let q4 = document.getElementById('q4');
  let q5 = document.getElementById('q5');

  let a1 = document.getElementById('a1');
  let a2 = document.getElementById('a2');
  let a3 = document.getElementById('a3');
  let a4 = document.getElementById('a4');
  let a5 = document.getElementById('a5');

  //collect questions and answers including ones added with 'add Question'
  let questions = [q1.value, q2.value, q3.value, q4.value, q5.value];
  let answers = [[a1.value], [a2.value], [a3.value], [a4.value], [a5.value]];
  if(numberofquestions > 5){
    for(let i = 6; i <= numberofquestions; i++){
      let nextQuestion = document.getElementById('q' + i);
      let nextAnswer = document.getElementById('a' + i);
      questions.push(nextQuestion.value);
      answers.push([nextAnswer.value]);
    }
  }
  //add additional answers if needed
  for(let key in numberofanswers){
    if(numberofanswers[key] > 1){
      let questionNumber = key.charAt(7);
      for(let i = 2; i <= numberofanswers[key]; i++){
        if(document.getElementById('a' + questionNumber + i).value != ''){
          answers[questionNumber-1].push(document.getElementById('a' + questionNumber + i).value);
        }
      }
    }
  }
  //make sure all entries have been filled in
  if(!questions.includes('') && !answers.includes('')){
    let name = document.getElementById('topic-name').value;
    var result = {};
    questions.forEach((key, i) => result[key] = answers[i]);
    result["topic-name"] = name;
    console.log(result);  
    if(name != ''){
      //store questions & answers on the backend to be pulled again from the bot
      request.open('POST', 'http://localhost:4000/Chatbot/SaveQandA', true);
      request.setRequestHeader("Content-type", "application/json");
      request.send(JSON.stringify(result));
      request.onload = function(){
        console.log(this.response);
        // if file creation was successful
        $('#saved-message').css('display', 'block');
        $('#saved-message').text('Your script has been saved! You can now use it in Taidhgín under "Personal Topics".');
        $('#ask-publish').css('display', 'block');
        $('#ask-download').css('display', 'block');
        currentFilename = name;
      }
    }
    else{
      //remind to fill in quiz name
      showReminder("Don't forget to name your quiz.");
    }
  }
  else{
    //remind to fill in all entries
    showReminder('Fill in all entries.');
  }
  
}

function sendVerification(){
  //send new script to an scealai email
  $('#saved-message').text('Your script will be verified.');
  $('#saved-message').css('display', 'block');
  var request = new XMLHttpRequest();
  request.open('POST', 'http://localhost:4000/Chatbot/sendScriptVerification', true);
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify({name: currentFilename}));
  request.onload = function(){
    console.log(this.response);
  }
}

function addTopic(name){
  let button = document.getElementById('test-button').click();
}

function showReminder(text){
  let reminder = document.getElementById('remind-message');
  reminder.innerText = text;
  reminder.style.display = 'block';
}

function downloadNewScript(){
  setTimeout(function(){
    currentFilename = currentFilename + '.rive'
    var link = document.createElement('a');
    link.href = '../assets/rive/' + currentFilename;
    link.download = currentFilename;
    link.click();
    link.remove();
  }, 500);
}

function deleteFile(filename){
  console.log(filename);
  var request = new XMLHttpRequest();
  request.open('POST', 'http://localhost:4000/Chatbot/deleteScript', true);
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify({name: filename}));
  request.onload = function(){
    console.log(this.response);
  }
}

function closeSubmit(){
  $('#submit-container').css('top', '-100%'); 
  setTimeout(function(){
    $('#remind-message').css('display', 'none');
    $('#saved-message').css('display', 'none');
    $('#ask-publish').css('display', 'none');
    $('#ask-download').css('display', 'none');
  }, 500);
  
}

/*
- When user inputs their content, create HTML button that would load the file to the bot when clicked.
- Send button as string along with content to the backend.
- In the backend the content would be saved in a new rivescript file.
- File and button would then need to be saved to the database in that user's data
- File would be saved as blob/chunks not too sure.
- From then whenever the user opens Taidhgín, the backend would be prompted to get all content user
has added before and display on the DOM. 
- User can also be prompted to download the file, but still would be saved to DB
*/