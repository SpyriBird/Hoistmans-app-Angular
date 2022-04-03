import { Component, OnInit } from '@angular/core';
import { ShiftService, Shift, CraneType } from '../shift.service';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {

  public adding = false;
  public toModal: any = null;
  public shifts: Shift[] = []; 

  constructor(private shiftService: ShiftService) {}

  ngOnInit(): void {
      this.shifts = this.shiftService.getShifts();
  }

  public addShift() {
    this.toModal = {};
    this.adding = true;
  }

  public editShift(id: number) {
    this.toModal = this._getShiftById(id);
    this.adding = true;
  }

  private _getShiftById(id: number) {
    return this.shifts.find((item) => item.id === id);
  }

  public closeModalWindow() {
    this.adding = false;
  }  

  public handleEvent(event: any) {
    if (event?.close) this.adding = false;
  }

  public removeShift(id: number) {
    
    this.shiftService.removeShift(id);
    this.shifts = this.shiftService.getShifts();  
  }

}
