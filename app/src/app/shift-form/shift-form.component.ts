import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { CraneType, TruckName } from '../shift.service';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

enum Status {
  Edit,
  Add
}

// a config for angular material datepicker 
const MY_FORMATS = {
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
  selector: 'app-shift-form',
  templateUrl: './shift-form.component.html',
  styleUrls: ['./shift-form.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class ShiftFormComponent implements OnInit {

  @Input('shift') shift: any = {};
  @Output() event: EventEmitter<any> = new EventEmitter;

  public form: FormGroup = new FormGroup({});

  //for CraneType enum to be available in html
  public craneTypes = CraneType;

  //current craneType
  public craneType: CraneType = CraneType.Single;

  //for TruckNames enum to be available in html
  public truckNames = Object.values(TruckName);

  public status: Status = Status.Add;
  public showError = false;
  private newShift: any;

  constructor() { }

  ngOnInit(): void {


    // assigning the status
    if (Object.entries(this.shift).length !== 0) {
      this.status = Status.Edit;
      this.craneType = this.shift.craneType;
    }

    // creating the FormGroup 
    this.form = new FormGroup({
      craneType: new FormControl({value: this.status === Status.Edit ? this.shift.craneType : '', disabled: this.status === Status.Edit}, [Validators.required]),
      workerName: new FormControl(this.status === Status.Edit ? this.shift.workerName : '', [Validators.required, Validators.pattern('^[А-Я][а-я]+(-[А-Я][а-я]+)? [А-Я]\.[А-Я].\$')]),
      dateOfStart: new FormControl(this.status === Status.Edit ? this.shift.dateOfStart : '', [Validators.required]),
      dateOfFinish: new FormControl(this.status === Status.Edit ? this.shift.dateOfFinish : '', [Validators.required]),
      cranes: this._createCranesArray()
    });

    // disableing load/unload inputs according to their values
    this._disableCargoInputs();
  }
  

  // validates form.value. emits an event or shows error message according to the result
  public onSubmit(): void {

    let invalid = false;

    this.showError = false;

    if (this.form.valid) {

      this.newShift = {
        cranes: [
          {trucks: []},
          {trucks: []}
        ],
        id: this.status === Status.Edit ? this.shift.id : 0,
        craneType: this.form.value.craneType ?? this.shift.craneType,
        workerName: this.form.value.workerName,
        dateOfStart: this.status === Status.Edit ? this.form.value.dateOfStart : this.form.value.dateOfStart.set({hours: 8}),
        dateOfFinish: this.status === Status.Edit ? this.form.value.dateOfFinish : this.form.value.dateOfFinish.set({hours:19}),
      };

      if (this._checkCranes()) {

        if (this.status === Status.Edit) {
          this.event.emit({edit: this.newShift});
        } else {
          this.event.emit({add: this.newShift});
        }
      
      } else {
        invalid = true;
      }
      
    } else {
      invalid = true;
    }

    if (invalid) {
      setTimeout(() => this.showError = true, 100);
    }
  
    
  }
  
  public getTrucksArray(crane: number): FormArray {
    return (<FormArray>this.form.get('cranes')).controls[crane - 1] as FormArray;
  }  

  public getCraneNamesArray(): string[] {
    return  Object.keys( (<FormArray>this.form.get('cranes')).controls );
  }

  public _addTruck(crane: number): void {
    this.getTrucksArray(crane).controls.push(this._getEmptyTruckFormGroup());
  }

  public close(): void {
    this.event.emit({close: true});
  }

  public onSelectTruck(crane: number, index: number, event: Event): void {

      // if this truck is untouched but already has some initial value a new truck fields are not created
      if (this.form.value.cranes[crane - 1][index]?.name) {
        return;
      }

      let truckControl: FormControl = (<FormControl>this.getTrucksArray(crane).controls[index].get('name'));
      if (truckControl.pristine) {
        this._addTruck(crane);
      }
      (<HTMLElement>event.target).blur();

  }
  public showDeleteButton(crane: number, truck: number): Boolean {
    let lastTruck = this.getTrucksArray(crane).controls.length - 1;
    return truck !== lastTruck;
  }

  public onChange(crane: number, index: number, targetControl: string): void {
    this._manageCargoStates(crane, index, targetControl);
  };

  // calculates the sum of all load/unload (specified in the controlName argument) inputs
  public calcTotal(controlName: string): string {

    let total = 0;
    
    for (let crane of this.getCraneNamesArray() ) {
      for (let control of this.getTrucksArray(+crane + 1).controls) {
        let value = (<FormGroup>control).get(controlName)?.enabled ? control.value[controlName] : '0';
        if (value && String(value) === String( Number.parseFloat(value)) && value > 0) {
          total += +value;
        } 
      }
    }
    return total.toFixed(2);
  }

  // removes a truck
  public removeTruck(crane: number, truck: number): void {
    this.getTrucksArray(crane).removeAt(truck);
  }

  // returns a FormArray according to the requiring number of cranes and trucks
  private _createCranesArray(): FormArray {

    // default - 1 crane, 1 truck
    if (this.status === Status.Add) {
      return new FormArray([
        new FormArray([ this._getEmptyTruckFormGroup() ]),
        new FormArray([ this._getEmptyTruckFormGroup() ])
      ]);
    }

    // 1 crane and as many trucks as there are + 1
    if (this.shift.cranes.length === 1) {
      return new FormArray([
        this._createTruckFormArray(1)
      ])
    }

    // 2 crane and as many trucks as there are + 1
    return new FormArray([
      this._createTruckFormArray(1),
      this._createTruckFormArray(2)
    ])
  }

  // privides a default truck FormGroup
  private _getEmptyTruckFormGroup(): FormGroup {
    return new FormGroup({
        name: new FormControl(''),
        loaded: new FormControl('', [this._validateCargos]),
        unloaded: new FormControl('', [this._validateCargos])
    });
  }

  // returns a trucks FormArray according to the trucks data in this.shift
  private _createTruckFormArray(crane: number): FormArray {
    let res: FormArray = new FormArray([]);

    for (let truck of this.shift.cranes[crane - 1].trucks) {
      res.push( new FormGroup({
        name: new FormControl(truck.name),
        loaded: new FormControl(truck.loaded ? truck.loaded : '', [this._validateCargos]),
        unloaded: new FormControl(truck.unloaded ? truck.unloaded : '', [this._validateCargos]),

      }));
    }

    res.push( this._getEmptyTruckFormGroup())
    return res;
  }


  // checks all the truck FormGroups and disables the needed inputs
  private _disableCargoInputs(): void {

    for (let crane of this.getCraneNamesArray()) {
      
      for (let truck of Object.keys(this.getTrucksArray(+crane + 1).controls)) {

        for (let state of ['loaded', 'unloaded']) {

          this._manageCargoStates(+crane + 1, +truck, state);
        }
      }
    }
  }

  //disables a truck cargo input if its neighbor has some value
  private _manageCargoStates(crane: number, truck: number, targetControl: string): void {

    let controls: FormControl[] = this._getCargoControls(crane, truck, targetControl);
    if (!controls.length) return;
    
    if (controls[0].value !== '') {
      controls[1].disable();

    } else {
      controls[1].enable();
    }
  }

  // returns a pair of truck cargo input controls
  private _getCargoControls(crane: number, truck: number, targetControl: string): FormControl[] {

    if (targetControl === 'loaded') {
      return [
        (<FormControl>this.getTrucksArray(crane).controls[truck].get('loaded')),
        (<FormControl>this.getTrucksArray(crane).controls[truck].get('unloaded'))
      ];
    }

    if (targetControl === 'unloaded') {
      return [
        (<FormControl>this.getTrucksArray(crane).controls[truck].get('unloaded')),
        (<FormControl>this.getTrucksArray(crane).controls[truck].get('loaded'))
      ];
    }

    return [];
  }

  // checks that each truck has valid values and there is at least one filled truck per crane
  private _checkCranes(): Boolean {
    let isValid = true;

    for (let crane of this.newShift.craneType === CraneType.Single ? [0] : this.getCraneNamesArray()) {
      if (!this._checkTrucks(+crane) || !this.newShift.cranes[crane].trucks.length) {
        isValid = false;
      }
    }
    return isValid;
  }

  // checks all the trucks in a crane. valid = has truckName + has load/unload || is empty
  // pushes valid trucks to this.newShift.cranes[crane].trucks
  private _checkTrucks(crane: number): Boolean {

    let isValid = true;

    for (let truck of Object.values(this.getTrucksArray(+crane + 1).controls)) {

      let count = 0;

      for (let prop of Object.values(truck.value)) {

        if (prop !== '') {
          count++;
        }
      }

      if (count === 2 && truck.value.name) {
        this.newShift.cranes[crane].trucks.push(truck.value);
      } else {
        isValid = !count ? isValid : false;
      }
      
    }

    return isValid;
  }

  // validator for load/unload inputs
  // valid = '' || positive number
  private _validateCargos(control: AbstractControl): null | {} {
    if (!control.value || (String(control.value) === String( Number.parseFloat(control.value) ) && control.value > 0)) {
      return null;
    }
    return {notNumber: true}
  }
}
