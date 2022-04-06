import { Component, OnInit } from '@angular/core';
import { ShiftService, Shift, CraneType } from '../shift.service';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {

  public showModalWindow = false;
  public toModal: Shift | {} = {};
  public shifts: Shift[] = []; 

  constructor(private shiftService: ShiftService) {}

  ngOnInit(): void {
      this.shifts = this.shiftService.getShifts();
  }

  public showAddingForm(): void {
    this.toModal = {};
    this.showModalWindow = true;
  }

  public showEditingForm(id: number): void {
    this.toModal = this._getShiftById(id);
    this.showModalWindow = true;
  }

  public closeModalWindow(): void {
    this.showModalWindow = false;
  }  

  public handleEvent(event: any): void {

    this.closeModalWindow();

    if (event?.edit) {

      this._editShift(event.edit);
      return;
    }

    if (event?.add) {
  
      this._addshift(event.add);
      return;
    }

  }

  public removeShift(id: number): void {
    this.shiftService.removeShift(id);
    this.shifts = this.shiftService.getShifts();  
  }



  private _getShiftById(id: number): Shift | {} {

    let shift = this.shifts.find((item) => item.id === id);
    if (shift) return shift;

    return {};
  }

  private _editShift(shift: any): void {
    this.shiftService.editShift(shift);
  }

  private _addshift(shift: any): void {
    this.shiftService.addShift(shift);
  }
}
