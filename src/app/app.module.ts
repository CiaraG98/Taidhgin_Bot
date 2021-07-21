import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { BunscoilComponent } from './bunscoil/bunscoil.component';
import { CreateQuizComponent } from './create-quiz/create-quiz.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatbotComponent,
    BunscoilComponent,
    CreateQuizComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
