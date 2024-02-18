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
import { FileUploadHandlerEvent, FileUploadModule } from "primeng/fileupload";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TableModule, AsyncPipe, JsonPipe, DecimalPipe, InputGroupModule, InputTextModule, ButtonModule, ReactiveFormsModule, InputTextareaModule, FileUploadModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  public geoJsonDataControl = new FormControl<string>('');
  public formGroup = new FormGroup({ 'geoJsonData': this.geoJsonDataControl });
  public files: File[] = [];
  public bearingAndDistance: BehaviorSubject<IBearingAndDistance[]> = new BehaviorSubject<IBearingAndDistance[]>([]);

  constructor(private _orienteeringService: OrienteeringService) {
  }

  ngOnInit() {
    // data.features = data.features.sort((a, b) => a.properties?.['title'] < b.properties?.['title']?-1:1);
    // this.pointsToBearingsAndDistance(data, -13.7);
  }

  onFileSelected(event: FileUploadHandlerEvent) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result;
      // Process the content of the file
      this._calculate(content as string);
      this.files = [];
    };

    reader.readAsText(file); // Or use readAsDataURL for binary files like images
  }

  public submit() {
    if (!this.geoJsonDataControl.value) {
      return;
    }
    this._calculate(this.geoJsonDataControl.value);
  }

  private _calculate(geoJsonString: string) {
    const geoJsonData: FeatureCollection<Point> = JSON.parse(geoJsonString);
    if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length < 2) {
      return;
    }
    geoJsonData.features = geoJsonData.features.sort((a, b) => a.properties?.['title'] < b.properties?.['title'] ? -1 : 1);
    const results = this._orienteeringService.pointsToBearingsAndDistance(geoJsonData);
    this.bearingAndDistance.next(results);
  }

}
