import { Component, OnInit } from '@angular/core';
import { ChatbotComponent } from '../chatbot/chatbot.component';


@Component({
  selector: 'app-create-quiz',
  templateUrl: './create-quiz.component.html',
  styleUrls: ['./create-quiz.component.css']
})
export class CreateQuizComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  test(){
    let chatbot = new ChatbotComponent();    
    chatbot.testCreate();
  }

}
