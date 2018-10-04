import {Component} from "@angular/core";
import {NavParams} from "ionic-angular";
import {AngularFireDatabase} from "@angular/fire/database";
import {Observable} from "rxjs";
import {DateTime} from "ionic-angular/umd";

@Component({
  selector: 'page-eventdetails',
  templateUrl: 'eventdetails.html'
})
export class EventDetails {
  event: Observable<any> = null;

  constructor(private navParams: NavParams, private db: AngularFireDatabase) {
    this.event = this.navParams.data;
  }

  formateDate(time: number) {
    let date: Date = new Date(time);
  }
}
