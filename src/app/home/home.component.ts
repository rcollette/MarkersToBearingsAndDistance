import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { TableModule } from "primeng/table";
import { AsyncPipe, DecimalPipe, JsonPipe } from "@angular/common";
import { Feature, FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import { ButtonModule } from "primeng/button";

const semiPi = Math.PI / 180;

interface IBearingAndDistance {
  originFeature: Feature<Point>;
  targetFeature: Feature<Point>;
  trueBearingDegrees: number;
  magneticBearingDegrees: number;
  distanceFeet: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TableModule, AsyncPipe, JsonPipe, DecimalPipe, InputGroupModule, InputTextModule, ButtonModule, ReactiveFormsModule,InputTextareaModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  public geoJsonDataControl = new FormControl<string>('');
  public declinationControl = new FormControl<number>(0);
  public formGroup = new FormGroup({ 'geoJsonData': this.geoJsonDataControl, 'declination': this.declinationControl });

  public bearingAndDistance: BehaviorSubject<IBearingAndDistance[]> = new BehaviorSubject<IBearingAndDistance[]>([]);

  ngOnInit() {
    // data.features = data.features.sort((a, b) => a.properties?.['title'] < b.properties?.['title']?-1:1);
    // this.pointsToBearingsAndDistance(data, -13.7);
  }

  public calculate() {
    if (!this.geoJsonDataControl.value || !this.declinationControl.value) {
      return;
    }
    const geoJsonData: FeatureCollection<Point> = JSON.parse(this.geoJsonDataControl.value);
    if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length < 2) {
      return;
    }
    geoJsonData.features = geoJsonData.features.sort((a, b) => a.properties?.['title'] < b.properties?.['title'] ? -1 : 1);
    this.pointsToBearingsAndDistance(geoJsonData, this.declinationControl.value);
  }

  private pointsToBearingsAndDistance(geoJsonData: FeatureCollection<Point>, declination: number) {
    const results: IBearingAndDistance[] = [];
    for (let i = 1; i < geoJsonData.features.length; i++) {
      results.push(this.calculateDistanceAndBearing(geoJsonData.features[i - 1], geoJsonData.features[i], declination));
    }
    const totalDistance = results.reduce((acc, cur) => acc + cur.distanceFeet, 0);
    console.log('Total Distance Miles: ', totalDistance / 5280);
    this.bearingAndDistance.next(results);
  }

  private calculateDistanceAndBearing(originFeature: Feature<Point, GeoJsonProperties>, targetFeature: Feature<Point, GeoJsonProperties>, declination: number): IBearingAndDistance {
    const originPosition = originFeature.geometry.coordinates;
    const targetPosition = targetFeature.geometry.coordinates;
    // Convert latitude and longitude from degrees to radians
    const lat1 = this.toRadians(originPosition[1]);
    const lon1 = this.toRadians(originPosition[0]);
    const lat2 = this.toRadians(targetPosition[1]);
    const lon2 = this.toRadians(targetPosition[0]);

    // Haversine formula to calculate the distance
    const distanceMeters = this.haversineDistance(lon2, lon1, lat2, lat1);

    // Convert distance from meters to feet
    const distanceFeet = distanceMeters * 3.28084;

    // Formula to calculate the True Bearing
    let trueBearingDegrees = this.trueBearing(lat2, lon2, lon1, lat1);

    // Adjust True Bearing to Magnetic Bearing
    const magneticBearingDegrees = trueBearingDegrees + declination;

    return {
      originFeature, targetFeature, trueBearingDegrees, magneticBearingDegrees, distanceFeet
    }
  }

  private trueBearing(lat2: number, lon2: number, lon1: number, lat1: number) {
    const x = Math.cos(lat2) * Math.sin(lon2 - lon1);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    let trueBearingDegrees = Math.atan2(x, y) * 180 / Math.PI;
    return (trueBearingDegrees + 360) % 360;
  }

  private haversineDistance(lon2: number, lon1: number, lat2: number, lat1: number) {
    const dLon = lon2 - lon1;
    const dLat = lat2 - lat1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));
    const r = 6371e3; // Radius of the Earth in meters
    return c * r;
  }

  private toRadians(degrees: number): number {
    return degrees * semiPi;
  }

}
