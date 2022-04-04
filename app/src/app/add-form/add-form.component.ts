import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { CraneType, TruckName } from '../shift.service';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AddFormComponent implements OnInit {

  @Input('shift') shift: any = {};
  @Output() event: EventEmitter<any> = new EventEmitter;

  public form: FormGroup = new FormGroup({});
  public craneTypes = CraneType;
  public craneType: CraneType = CraneType.Single;
  public truckNames = Object.values(TruckName);
  public edit = false;
  public totalLoad: number = 0;
  public totalUnload: number = 0;
  public showErrors = false;
  private newShift: any;

  constructor() { }

  ngOnInit(): void {

    if (Object.entries(this.shift).length !== 0) {
      this.edit = true;
      this.craneType = this.shift.craneType;
    }

    this.form = new FormGroup({
      craneType: new FormControl({value: this.edit ? this.shift.craneType : '', disabled: this.edit}, [Validators.required]),
      workerName: new FormControl(this.edit ? this.shift.workerName : '', [Validators.required, ]),
        // Validators.pattern('^[А-Я][а-я]+(-[А-Я][а-я]+)? [А-Я]\.[А-Я].\$')]),
      dateOfStart: new FormControl(this.edit ? this.shift.dateOfStart : '', [Validators.required]),
      dateOfFinish: new FormControl(this.edit ? this.shift.dateOfFinish : '', [Validators.required]),
      cranes: this.createCranesArray()
    });


    this._calcTotals();
    this._disableCargoInputs();
  }

  private createCranesArray() {
    if (!this.edit) {
      return new FormArray([
        new FormArray([ this._getTruckForm() ]),
        new FormArray([ this._getTruckForm() ])
      ]);
    }

    if (this.shift.cranes.length === 1) {
      return new FormArray([
        this.createTruckFormArray(1)
      ])
    }

    return new FormArray([
      this.createTruckFormArray(1),
      this.createTruckFormArray(2)
    ])
  }

  private createTruckFormArray(crane: number): FormArray {
    let res: FormArray = new FormArray([]);

    for (let truck of this.shift.cranes[crane - 1].trucks) {
      res.push( new FormGroup({
        truckName: new FormControl(truck.name),
        loaded: new FormControl(truck.loaded ? truck.loaded : ''),
        unloaded: new FormControl(truck.unloaded ? truck.unloaded : ''),

      }));
    }
    res.push( this._getTruckForm())
    return res;
  }

  public getTrucksArray(crane: number): FormArray {
    return (<FormArray>this.form.get('cranes')).controls[crane - 1] as FormArray;
  }  

  public getCranesArray() {
    return  Object.keys( (<FormArray>this.form.get('cranes')).controls );
  }

  public _addTruck(crane: number) {
    this.getTrucksArray(crane).controls.push(this._getTruckForm());
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

  public onSelectTruck(crane: number, index: number, event: Event) {

      // if this truck is untouched but already has some initial value a new truck fields are not created
      if (this.form.value.cranes[crane - 1][index].truckName) {
        return;
      }

      let truckControl: FormControl = (<FormControl>this.getTrucksArray(crane).controls[index].get('truckName'));
      if (!truckControl.touched) {
        this._addTruck(crane);
      }
      (<HTMLElement>event.target).blur();

  }

  public onChange(crane: number, index: number) {
    
  }

  private _getCargoControls(crane: number, index: number, targetControl: string): FormControl[] {

    if (targetControl === 'load') {
      return [
        (<FormControl>this.getTrucksArray(crane).controls[index].get('loaded')),
        (<FormControl>this.getTrucksArray(crane).controls[index].get('unloaded'))
      ];
    }

    if (targetControl === 'unload') {
      return [
        (<FormControl>this.getTrucksArray(crane).controls[index].get('unloaded')),
        (<FormControl>this.getTrucksArray(crane).controls[index].get('loaded'))
      ];
    }

    return [];

  }

  public disable(crane: number, index: number, targetControl: string) {

    let controls: FormControl[] = this._getCargoControls(crane, index, targetControl);
    
    if (!controls.length) return;

    if (controls[0].value !== '') {
      controls[1].disable();

    } else {
      controls[1].enable();
    }
  }

  private _calcTotals() {
    this._calcTotalLoad();
    this._calcTotalUnload();
  }

  private _calcTotalLoad() {

    let total = 0;

    for (let crane of this.getCranesArray() ) {
      for (let control of this.getTrucksArray(+crane + 1).controls) {
        total += +control.value.loaded;
      }
    }
    this.totalLoad = total;
  }

  private _calcTotalUnload() {

    let total = 0;
    
    for (let crane of this.getCranesArray() ) {
      for (let control of this.getTrucksArray(+crane + 1).controls) {
        total += +control.value.unloaded;
      }
    }
    this.totalUnload = total;
  }

  public removeTruck(crane: number, index: number) {
    this.getTrucksArray(crane).removeAt(index);
  }

  private _disableCargoInputs() {

    for (let crane of this.getCranesArray()) {
      
      for (let truck of Object.keys(this.getTrucksArray(+crane + 1).controls)) {

        for (let state of ['load', 'unload']) {

          this.disable(+crane + 1, +truck, state);
        }
      }
    }
    
  }

  private _checkTrucks(crane: number): Boolean {

    let isValid = true;

    for (let truck of Object.values(this.getTrucksArray(+crane + 1).controls)) {

      let count = 0;

      for (let prop of Object.values(truck.value)) {

        if (prop !== '') {
          count++;
        }
      }

      if (count === 2 && truck.value.truckName) {
        this.newShift.cranes[crane].push(truck.value);
      } else {
        isValid = !count ? isValid : false;
      }
      
    }

    return isValid;
  }

  private _checkCranes(): Boolean {
    let isValid = true;

    for (let crane of this.newShift.craneType === CraneType.Single ? [0] : this.getCranesArray()) {
      if (!this._checkTrucks(+crane) || !this.newShift.cranes[crane].length) {
        isValid = false;
      }
    }
    return isValid;
  }

  public onSubmit() {

    this.newShift = {
      craneType: this.form.value.craneType ?? this.shift.craneType,
      workerName: this.form.value.workerName,
      dateOfStart: this.form.value.dateOfStart,
      dateOfFinish: this.form.value.dateOfFinish,
      cranes: [[], []]
    }

    if (this.form.valid) {
      console.log('valid')
      console.log(this._checkCranes())

    } else {
      this.showErrors = true;
    }
    console.log('submit', this.newShift, this.form)
  }

}
