import { Component } from '@angular/core';
import { Express } from 'express';
import { Mongoose } from 'mongoose';
import { BodyParser } from 'body-parser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'backup-chatbot';
  port = 4200;
}
