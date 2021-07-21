import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { BunscoilComponent } from './bunscoil/bunscoil.component';
import { CreateQuizComponent } from './create-quiz/create-quiz.component';

const routes: Routes = [
  { path: 'taidhgin', component: ChatbotComponent },
  { path: '', redirectTo: '/taidhgin', pathMatch: 'full' },
  { path: 'bunscoil', component: BunscoilComponent },
  { path: 'create-quiz', component: CreateQuizComponent}
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
  ],
  exports: [ RouterModule ],
})
export class AppRoutingModule { }
