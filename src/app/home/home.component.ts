import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { TableModule } from "primeng/table";
import { AsyncPipe, DecimalPipe, JsonPipe } from "@angular/common";
import { FeatureCollection, Point } from "geojson";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ButtonModule } from "primeng/button";
import { IBearingAndDistance, OrienteeringService } from "../orienteering/orienteering.service";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TableModule, AsyncPipe, JsonPipe, DecimalPipe, InputGroupModule, InputTextModule, ButtonModule, ReactiveFormsModule, InputTextareaModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  public geoJsonDataControl = new FormControl<string>('');
  public formGroup = new FormGroup({ 'geoJsonData': this.geoJsonDataControl});

  public bearingAndDistance: BehaviorSubject<IBearingAndDistance[]> = new BehaviorSubject<IBearingAndDistance[]>([]);

  constructor(private _orienteeringService: OrienteeringService) { }

  ngOnInit() {
    // data.features = data.features.sort((a, b) => a.properties?.['title'] < b.properties?.['title']?-1:1);
    // this.pointsToBearingsAndDistance(data, -13.7);
  }

  public calculate() {
    if (!this.geoJsonDataControl.value) {
      return;
    }
    const geoJsonData: FeatureCollection<Point> = JSON.parse(this.geoJsonDataControl.value);
    if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length < 2) {
      return;
    }
    geoJsonData.features = geoJsonData.features.sort((a, b) => a.properties?.['title'] < b.properties?.['title'] ? -1 : 1);
    const results = this._orienteeringService.pointsToBearingsAndDistance(geoJsonData);
    const totalDistance = results.reduce((acc, cur) => acc + cur.distanceFeet, 0);
    console.log('Total Distance Miles: ', totalDistance / 5280);
    this.bearingAndDistance.next(results);
  }

}
