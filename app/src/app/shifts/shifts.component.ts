import { Component, OnInit } from '@angular/core';
import { ShiftService, Shift, CraneType } from '../shift.service';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {

  public showModalWindow = false;
  public toModal: any = null;
  public shifts: Shift[] = []; 

  constructor(private shiftService: ShiftService) {}

  ngOnInit(): void {
      this.shifts = this.shiftService.getShifts();
  }

  public showAddingForm() {
    this.toModal = {};
    this.showModalWindow = true;
  }

  public showEditingForm(id: number) {
    this.toModal = this._getShiftById(id);
    this.showModalWindow = true;
  }

  private _getShiftById(id: number) {
    return this.shifts.find((item) => item.id === id);
  }

  public closeModalWindow() {
    this.showModalWindow = false;
  }  

  public handleEvent(event: any) {
    if (event?.close) {
      this.showModalWindow = false;
      return;
    }

    if (event?.edit) {
      this.showModalWindow = false;
      this._editShift(event.edit);
    }

    if (event?.add) {
  
      this.showModalWindow = false;
      this._addshift(event.add);
    }

  }

  private _editShift(shift: any) {
    this.shiftService.editShift(shift);
  }

  private _addshift(shift: any) {
    this.shiftService.addShift(shift);
    
  }

  public removeShift(id: number) {
    
    this.shiftService.removeShift(id);
    this.shifts = this.shiftService.getShifts();  
  }

}
