import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { CraneType } from '../shift.service';

@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss']
})
export class AddFormComponent implements OnInit {

  @Output() event: EventEmitter<any> = new EventEmitter;
  public isTouched: boolean[] = [false];
  public form: FormGroup = new FormGroup({});
  public craneTypes = CraneType;

  constructor() { }

  ngOnInit(): void {

    this.form = new FormGroup({
      craneType: new FormControl('', [Validators.required]),
      workerName: new FormControl('', [Validators.required]),
      trucks1: new FormArray([
        this._getTruckForm()
      ]),
      trucks2: new FormArray([
        this._getTruckForm()
      ]),
    });

  }

  public getTrucksArray(crane: number): FormArray {
    return this.form.get(`trucks${crane}`) as FormArray;
  }  
  public _addTruck(crane: number) {
    let trucks = this.getTrucksArray(crane)
    trucks.push(this._getTruckForm());
    this.isTouched.push(false)
  }

  private _getTruckForm(): FormGroup {
    return new FormGroup({
        truckName: new FormControl(''),
        loaded: new FormControl(''),
        unloaded: new FormControl('')
    });
  }

  public close() {
    this.event.emit({close: true});
  }

  public onChange(crane: number, index: number) {

    setTimeout(() => {
        this.isTouched[index] = (<FormArray>this.getTrucksArray(crane).controls[index]).touched;

        if (this.isTouched[this.isTouched.length - 1]) {
          this._addTruck(crane);
        }
    });
  }

  public removeTruck(crane: number, index: number) {
    this.getTrucksArray(crane).removeAt(index);
  }
}
