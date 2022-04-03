import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { CraneType, TruckName, Shift } from '../shift.service';

@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss']
})
export class AddFormComponent implements OnInit {

  @Input('shift') shift: any = {};
  @Output() event: EventEmitter<any> = new EventEmitter;

  public form: FormGroup = new FormGroup({});
  public craneTypes = CraneType;
  public truckNames = Object.values(TruckName);
  public edit = false;
  public totalLoad: number = 0;
  public totalUnload: number = 0;

  constructor() { }

  ngOnInit(): void {

    if (Object.entries(this.shift).length !== 0) {
      this.edit = true;
    }

    this.form = new FormGroup({
      craneType: new FormControl({value: this.edit ? this.shift.craneType : '', disabled: this.edit}, [Validators.required]),
      workerName: new FormControl(this.edit ? this.shift.workerName : '', [Validators.required]),
      dateOfStart: new FormControl('', [Validators.required]),
      dateOfFinish: new FormControl('', [Validators.required]),
      cranes: this.createCranesArray()
    });

    console.log(this.form)
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
    return res;
  }

  public getTrucksArray(crane: number): FormArray {
    return (<FormArray>this.form.get('cranes')).controls[crane - 1] as FormArray;
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
      let truckControl: FormControl = (<FormControl>this.getTrucksArray(crane).controls[index].get('truckName'));
      if (!truckControl.touched) {
        this._addTruck(crane);
      }
      (<HTMLElement>event.target).blur();

  }

  public onChange(crane: number, index: number) {
    
    // setTimeout(() => {
    //   if (this.getTrucksArray(crane).controls[this.getTrucksArray(crane).controls.length - 1].touched) {
    //     this._addTruck(crane);
    //   }
    // })
  }

  public disable(crane: number, index: number, isLoaded: boolean) {

    let controlLoad: FormControl = (<FormControl>this.getTrucksArray(crane).controls[index].get('loaded'));
    let controlUnload: FormControl = (<FormControl>this.getTrucksArray(crane).controls[index].get('unloaded'));
    
    if (isLoaded) {
      
      if (!controlLoad.pristine && controlLoad.value !== '') {
        controlUnload.disable();

      } else {

        controlUnload.enable();
      }

    } else {

      if (!controlUnload.pristine && controlUnload.value !== '') {

        controlLoad.disable();

      } else {
        
        controlLoad.enable();
      }

    }
    

  }

  private _calcTotals() {
    this._calcTotalLoad();
    this._calcTotalUnload();
  }
  private _calcTotalLoad() {
    let total = 0;

    for (let crane of [1,2]) {
      for (let control of this.getTrucksArray(crane).controls) {
        total += +control.value.loaded;
      }
    }
    this.totalLoad = total;
  }
  private _calcTotalUnload() {
    let total = 0;

    for (let crane of [1,2]) {
      for (let control of this.getTrucksArray(crane).controls) {
        total += +control.value.unloaded;
      }
    }
    this.totalUnload = total;
  }

  public removeTruck(crane: number, index: number) {
    this.getTrucksArray(crane).removeAt(index);
  }

  public onSubmit() {
    
  }

}
