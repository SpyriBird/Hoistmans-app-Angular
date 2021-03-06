import { Injectable } from '@angular/core';

export enum CraneType {
  Single = 'Одинарный',
  Double = 'Двойной'
}
export enum TruckName {
  Truck1 = 'Грузовик 1',
  Truck2 = 'Грузовик 2',
  Truck3 = 'Грузовик 3',
  Truck4 = 'Грузовик 4',
}

export interface Truck {
  name: TruckName,
  loaded?: number,
  unloaded?: number
}
export interface Crane {
  trucks: Truck[]
}

export interface Shift {
  id: number,
  readonly craneType: CraneType,
  workerName: string,
  dateOfStart: Date,
  dateOfFinish: Date,
  cranes: Crane[],
  totalLoad?: number,
  totalUnload?: number
}

@Injectable({
  providedIn: 'root'
})
export class ShiftService {

  // initial shifts (random data)
  private _shifts: Shift[] = [
    {id: 1, craneType: CraneType.Double, workerName: 'Иванов И.И.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: TruckName.Truck1, loaded: 10, unloaded: 0}, {name: TruckName.Truck2, loaded: 180, unloaded: 0}] }, {trucks: [{name: TruckName.Truck2, loaded: 4, unloaded: 0}] }] },
    {id: 2, craneType: CraneType.Double, workerName: 'Петров П.П.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: TruckName.Truck2, loaded: 10, unloaded: 0}] }, {trucks: [{name: TruckName.Truck2, loaded: 4, unloaded: 0}] }]},
    {id: 3, craneType: CraneType.Double, workerName: 'Сидоров С.С.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: TruckName.Truck1, loaded: 0, unloaded: 51}] }, {trucks: [{name: TruckName.Truck2, loaded: 4, unloaded: 0}] }]},
    {id: 4, craneType: CraneType.Single, workerName: 'Петров П.П.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: TruckName.Truck4, loaded: 0, unloaded: 100}] }]},
    {id: 5, craneType: CraneType.Single, workerName: 'Петров П.П.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: TruckName.Truck1, loaded: 10, unloaded: 0}] }]},
  ]

  constructor() { 
    this._calcTotals();
  }

  public getShifts(): Shift[] {
    return this._shifts;
  }

  //adds a new shift to their collection - this._shifts
  public addShift(shift: Shift): void {

    shift.id = this._getNextId();

    this._shifts.push(shift);
    this._calcTotals();
  }

  //removes a shift from their collection by its id
  public removeShift(id: number): void {
    this._shifts = this._shifts.filter( (item) => item.id !== id);
  }

  //sets changes in shifts collection
  public editShift(shift: Shift): void {
    let editedIndex = this._shifts.findIndex( (item) => item.id === shift.id);
    this._shifts[editedIndex] = shift;
    this._calcTotals();
  }



  // calculates total load and total unload values and set them in this._shifts
  private _calcTotals():void {

    for (let [index, shift] of this._shifts.entries() ) {

      let totalLoad = 0;
      let totalUnload = 0;
      for (let crane of shift.cranes) {

        for (let truck of crane.trucks) {

          totalLoad += truck.loaded ? +truck.loaded : 0;
          totalUnload += truck.unloaded ? +truck.unloaded : 0;
        }
      }
  
      this._shifts[index].totalLoad = totalLoad;
      this._shifts[index].totalUnload = totalUnload;
    }
  }
  
  //returns a yet unused id
  private _getNextId(): number {
    if (this._shifts.length) {
      let id = this._shifts[this._shifts.length - 1].id;
      return id + 1;
    }

    return 1;
  }
}
