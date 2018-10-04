import {
  GoogleMaps,
  GoogleMap,
  GoogleMapOptions,
  Marker,
  CameraPosition,
  LatLng
} from '@ionic-native/google-maps';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, NavParams, ToastController} from 'ionic-angular';
import { Geolocation } from "@ionic-native/geolocation";
import {TranslateService} from "@ngx-translate/core";
import {AngularFireDatabase} from "@angular/fire/database";
import leaflet from 'leaflet';
import {GoogleMarkerContainer} from "../model/marker";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  // camera defaults
  readonly zoom : number = 4;
  readonly lat: number = 50.110924;
  readonly lng: number = 8.682127;

  @ViewChild('map') mapElement: ElementRef;
  private map: GoogleMap;
  private options: GoogleMapOptions;
  private myLocation: Marker = null;
  private markerContainer: GoogleMarkerContainer;

  constructor(public navCtrl: NavController, public navParams: NavParams, private geoLocation: Geolocation,
              private toastCtrl: ToastController, private translateService: TranslateService, private db: AngularFireDatabase) {
  }

  ionViewDidLoad() {
    this.loadMap();
    this.markerContainer = GoogleMarkerContainer.newInstance(this.db, this.map, this.navCtrl);
    this.markerContainer.subscribe();
  }

  loadMap() {
    this.options = {
      camera: {
        target: {
          lat: this.lat,
          lng: this.lng,
        },
        zoom: this.zoom,
      }
    };
    this.map = GoogleMaps.create(this.mapElement.nativeElement, this.options);
  }

  locateMe() {
    this.geoLocation.getCurrentPosition({timeout: 30000, enableHighAccuracy: true} )
      .then( (res) => {
        console.log("lat: " + res.coords.latitude + " lng; " + res.coords.longitude);
        let location = new LatLng(res.coords.latitude, res.coords.longitude);
        this.moveCamera(location);
        if (this.myLocation != null) {
          this.myLocation.remove();
        }
        this.myLocation = this.setMarker(location);
    })
      .catch( (error) => {
        this.showToast("Your position could not be determined", 5000, 'bottom');
        console.log('Error getting location', error);
      });

  }

  moveCamera(location: LatLng, mapSource: MapType = MapType.GOOGLE) {
    switch (mapSource) {
      case MapType.GOOGLE:
        let options: CameraPosition<any> = {
          target: location,
          zoom: 15,
          tilt: 10
        };

        this.map.moveCamera(options)
          .catch(error => {
            console.log(error.toString());
          })
          .then(res => {
            console.log("promise rejected");
          });
        break;
      case MapType.OSM:
        // this.map.setView([location.lat, location.lng], 15);
        leaflet.marker([location.lat, location.lng]).addTo(this.map);
        break;
    }
  }

  showToast(msg: string, duration: number, pos: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: duration,
      position: pos
    });

    toast.present();
  }

  loadLeaflet() {
    this.map = leaflet.map(this.mapElement.nativeElement).setView([this.lat, this.lng], this.zoom);
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'www.tphangout.com',
      maxZoom: 18
    }).addTo(this.map);
  }

  setMarker(pos: LatLng): Marker {
    this.map.addMarker({position: {lat: pos.lat, lng: pos.lng}})
      .then(marker => {
        this.myLocation = marker;
      });
    return;
  }
}

enum MapType {
  GOOGLE,
  OSM
}
