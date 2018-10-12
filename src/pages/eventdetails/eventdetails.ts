import {Component, Pipe, PipeTransform} from "@angular/core";
import {NavParams} from "ionic-angular";
import {AngularFireDatabase} from "@angular/fire/database";
import {Observable} from "rxjs";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'page-eventdetails',
  templateUrl: 'eventdetails.html'
})
export class EventDetails {
  private event: Observable<any> = null;


  constructor(private navParams: NavParams, private db: AngularFireDatabase) {
    this.event = this.navParams.data;
  }
}
