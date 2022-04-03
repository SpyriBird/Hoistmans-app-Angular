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
  name: string,
  loaded?: number,
  unloaded?: number
}
export interface Crane {
  trucks: Truck[]
}

export interface Shift {
  readonly id: number,
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

  private _shifts: Shift[] = [
    {id: 1, craneType: CraneType.Double, workerName: 'Иванов И.И.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: 'ygdsc', loaded: 10, unloaded: 0}] }, {trucks: [{name: 'dsfgv', loaded: 4, unloaded: 0}] }] },
    {id: 2, craneType: CraneType.Double, workerName: 'Петров П.П.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: 'ygdsc', loaded: 10, unloaded: 0}] }]},
    {id: 3, craneType: CraneType.Double, workerName: 'Сидоров С.С.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: 'ygdsc', loaded: 10, unloaded: 0}] }]},
    {id: 4, craneType: CraneType.Double, workerName: 'Петров П.П.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: 'ygdsc', loaded: 10, unloaded: 0}] }]},
    {id: 5, craneType: CraneType.Single, workerName: 'Петров П.П.', dateOfStart: new Date('2020-12-24T08:00'), dateOfFinish: new Date('2020-12-24T19:00'), cranes: [{trucks: [{name: 'ygdsc', loaded: 10, unloaded: 0}] }]},
  ]

  constructor() { 
    this._calcTotals();
  }

  private _calcTotals() {
    for (let [index, shift] of this._shifts.entries() ) {
      let totalLoad = 0;
      let totalUnload = 0;

      for (let truck of shift.cranes[0].trucks) {
        totalLoad += truck.loaded ? truck.loaded : 0;
        totalUnload += truck.unloaded ? truck.unloaded : 0;
      }
      
      this._shifts[index].totalLoad = totalLoad;
      this._shifts[index].totalUnload = totalUnload;
    }
  }

  public getShifts() {
    return this._shifts;
  }

  public addShift(shift: Shift) {
    this._shifts.push(shift);
  }

  public removeShift(id: number) {
    this._shifts = this._shifts.filter( (item) => item.id !== id);
  }

  public editShift(shift: Shift) {

    let editedIndex = this._shifts.findIndex( (item) => item.id === shift.id);
    this._shifts[editedIndex] = shift;

  }
}
