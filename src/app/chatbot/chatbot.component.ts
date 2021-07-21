import { Component, OnInit } from '@angular/core';
import { CreateQuizComponent } from '../create-quiz/create-quiz.component';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  title = 'An Scealai Chatbot';
  constructor() { }

  ngOnInit() {
  }

  testThis(){
    // @ts-ignore
    testType();
  }

  testCreate(){
    alert("yo from chatbot component!");
    let button = document.createElement('button');
    let contents = document.getElementById('new-contents');
    contents.append(button);
  }

}


