import {AngularFireDatabase, AngularFireObject} from "@angular/fire/database";
import {Observable, Subscription} from "rxjs";
import {queries} from "../../environments/queries";
import {NavController} from "ionic-angular";
import {EventDetails} from "../eventdetails/eventdetails";

export abstract class MapEntry {
  private item: AngularFireObject<any>;
  private obs: Observable<any>;

  protected constructor(private name: string, private key: string, private db: AngularFireDatabase){
    this.item = db.object(queries.entrypath + key);
  }

  protected subscribe() {
    this.obs = this.item.valueChanges();
  }
  protected unsubcribe() {
    this.obs = null;
  }

  public getKey(): string {
    return this.key;
  }

  public getItem(): Observable<any> {
    return this.obs;
  }


  public getName() {
    return this.name;
  }
  public abstract showDetails(navCtl: NavController);
}

export class EventMapEntry extends MapEntry {
  constructor(name: string, key: string, db: AngularFireDatabase) {
    super(name, key, db);
  }

  showDetails(navCtl: NavController) {
    this.subscribe();
    console.log(navCtl);
    navCtl.push(EventDetails, this.getItem())
      .then( () => {
        console.log("page loaded");
      })
      .catch( (error) => {
        console.log("error loading page", error);
      });
  }
}

export class FacilityMapEntry extends MapEntry{
  constructor(name: string, key: string, db: AngularFireDatabase) {
    super(name, key, db);
  }

  showDetails(navCtl: NavController) {
  }

}

export class Address {
  constructor(private _name: string, private _street: string, private _zip: number, private _city: string,
              private _country: string) {

  }


  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get street(): string {
    return this._street;
  }

  set street(value: string) {
    this._street = value;
  }

  get zip(): number {
    return this._zip;
  }

  set zip(value: number) {
    this._zip = value;
  }

  get city(): string {
    return this._city;
  }

  set city(value: string) {
    this._city = value;
  }

  get country(): string {
    return this._country;
  }

  set country(value: string) {
    this._country = value;
  }
}
