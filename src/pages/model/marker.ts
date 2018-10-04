import {AngularFireDatabase, AngularFireList} from "@angular/fire/database";
import {EventMapEntry, FacilityMapEntry, MapEntry} from "./mapentry";
import {GoogleMap, GoogleMapsEvent, HtmlInfoWindow, LatLng, Marker, MarkerOptions} from "@ionic-native/google-maps";
import {Subscription} from "rxjs-compat";
import {NavController} from "ionic-angular";
import {markDirty} from "@angular/core/src/render3";

interface Dictionary<T> {
  [Key: string]: T;
}

abstract class MarkerContainer {
  protected markerDict: Dictionary<CustomMarker> = {};
  protected readonly ENTRYPATH: string = "MapEntries";
  protected list: AngularFireList<any[]>;

  protected abstract addMarker(entry: CustomMarkerOptions);
  protected abstract removeMarker(key: string);
  protected abstract updateMarker(key: string, coords: LatLng, name: string);

  public getData(): Dictionary<CustomMarker> {
    return this.markerDict;
  }

}

export class GoogleMarkerContainer extends MarkerContainer {
  private static markerContainer: GoogleMarkerContainer = null;
  private subscription: Subscription = null;

  public static newInstance(db: AngularFireDatabase, map: GoogleMap, navCtrl: NavController) {
    if (this.markerContainer === null)
      return new GoogleMarkerContainer(db, map, navCtrl);
    return this.markerContainer;
  }

  private constructor(private db: AngularFireDatabase, private map: GoogleMap, private navCtrl: NavController) {
    super();
    this.list = db.list(this.ENTRYPATH);
  }

  public subscribe() {
    this.subscription = this.list.snapshotChanges().subscribe( (actions) => {
      actions.forEach( (action) => {
        let value: CustomMarkerOptions = {
          key: action.key,
          position: action.payload.val()['coords'],
          title: action.payload.val()['name'],
          type: action.payload.val()['type'],
        };
        switch (action.type) {
          case ListActions.VALUE:
            let marker = this.addMarker(value);
            marker.detailsClicked(this.navCtrl);
            break;
          case ListActions.ADDED:
            marker = this.addMarker(value);
            marker.detailsClicked(this.navCtrl);
            break;
          case ListActions.REMOVED:
            this.removeMarker(action.key);
            break;
          case ListActions.CHANGED:
            this.updateMarker(value.key, value.position, value.title);
            break;
          default:
            console.error("Unknown list action", action.type);
        }
      });
    });
  }

  public unsubcribe() {
    this.subscription.unsubscribe();
  }

  protected addMarker(entry: CustomMarkerOptions) {
    let marker: GoogleMarker = new GoogleMarker(entry.key, entry, this.db);
    marker.addToMap(this.map);
    this.markerDict[entry.key] = marker;
    return marker;
  }

  protected removeMarker(key: string) {
    this.markerDict[key].removeFromMap();
    delete this.markerDict[key];
  }

  protected updateMarker(key: string, coords: CustomLatLng, name: string) {
    console.log(key);
    let marker: GoogleMarker = (<GoogleMarker>this.markerDict[key]);
    console.log(marker);
    marker.payload.position = coords;
    marker.payload.title = name;
    marker.updateMarker(coords, name);
  }

}

export abstract class CustomMarker {
  protected item: MapEntry;
  protected infoWindow: HtmlInfoWindow = new HtmlInfoWindow();
  protected content: HTMLElement = document.createElement('div');

  protected constructor(private _markerKey: string, private _payload: CustomMarkerOptions) {}


  public get markerKey(): string {
    return this._markerKey;
  }

  public get payload(): CustomMarkerOptions {
    return this._payload
  }

  public set markerKey(key: string) {
    this._markerKey = key;
  }

  public set payload(payload: CustomMarkerOptions) {
    this._payload = payload;
  }

  abstract addToMap(map: any);
  abstract removeFromMap();
  abstract updateMarker(newPos: LatLng, newName: string);
  abstract detailsClicked(navCtl: NavController);
}

export class GoogleMarker extends CustomMarker{
  private options: MarkerOptions;
  private marker: Marker;

  public constructor(markerKey: string, payload: CustomMarkerOptions, private db?: AngularFireDatabase) {
    super(markerKey, payload);

    this.options = {
      position: payload.position,
    };

    this.content.innerHTML = [
      '<h5>' + payload.title + '</h5>',
      '<button>Details</button>'
    ].join("<br>");

    this.infoWindow.setContent(this.content, {width: (window.innerWidth - 10) + "px"});

    if (db != null) {
      switch (payload.type) {
        case MarkerTypes.EVENT:
          this.item = new EventMapEntry(payload.title, payload.key, db);
          break;
        case MarkerTypes.FACILLITY:
          this.item = new FacilityMapEntry(payload.title, payload.key, db);
          break;
      }
    }
  }

  addToMap(map: GoogleMap) {
    map.addMarker(this.options)
      .then( (marker) => {
        this.marker = marker;
        this.marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          map.moveCamera({target: this.options.position, zoom: 15});
          if (!this.marker.isInfoWindowShown())
            this.infoWindow.open(this.marker);
          else
            this.infoWindow.close();
        });
      })
      .catch( (error) => {
        console.error("Marker could not be added to the map!", error);
        throw error;
      });
  }

  removeFromMap() {
    this.marker.remove();
  }

  detailsClicked(navCtl: NavController) {
    this.content.getElementsByTagName("button")[0].addEventListener("click", () => {
      console.log("ajeif");
      this.item.showDetails(navCtl);
    });
  }

  updateMarker(newPos: CustomLatLng, newName: string) {
    this.marker.setPosition(newPos);
    this.marker.setTitle(newName);
  }
}

enum ListActions {
  ADDED = "child_added",
  REMOVED = "child_removed",
  CHANGED = "child_changed",
  VALUE = "value"
}

interface CustomMarkerOptions {
  key: string;
  position: CustomLatLng;
  title: string;
  type: MarkerTypes;
  zoom?: number;
  starttime?: number;
}

interface CustomLatLng {
  lat: number;
  lng: number;
}

enum MarkerTypes {
  EVENT = 'event',
  FACILLITY = 'facillity',
}
