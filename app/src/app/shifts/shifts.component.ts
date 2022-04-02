import { Component, OnInit } from '@angular/core';
import { ShiftService, Shift } from '../shift.service';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {

  public shifts: Shift[] = []; 

  constructor(private shiftService: ShiftService) { }

  ngOnInit(): void {
      this.shifts = this.shiftService.getShifts();
  }

}
