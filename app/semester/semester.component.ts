import { Component, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { SemesterService } from '../_service/semester.service';
import { TeacherService } from '../_service/teacher.service';
import { Semester } from '../_model/semester';
import { Teacher } from '../_model/teacher';
import { ErrorMessage } from '../_model/errormessage';
import { ErrorsHandler } from '../_guard/error.handler';
import { BASE_URL } from '../_service/app.const';
@Component({
  selector: 'app-semester',
  templateUrl: './semester.component.html',
  styleUrls: ['./semester.component.css']
})
export class SemesterComponent implements OnInit {

  constructor(private errorhandler: ErrorsHandler, private Semesterservice: SemesterService, private Teacherservice: TeacherService) {
  }
  public rowsOnPage = 10;
  filterQuery = '';
  loading = false;
  model = new Semester();
  semester = new Semester();
  semesters: Array<Semester>;
  teachers: Array<Teacher>;
  error: ErrorMessage = { security: '', message: '' };
  role = '';
  detail = false;
  btnForm = false;
  readonly = false;
  number4Pattern = '^2{1}5{1}[0-9]{2}$';
  number1Pattern = '^[1-2]{1}$';
  url = '';

  semesterForm = new FormGroup({
    Year: new FormControl('', [Validators.required]),
    Semester: new FormControl('', [Validators.required]),
    MyFile: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.getUserAll();
    this.getSemesterAll();
    this.url = BASE_URL;
  }

  getUserAll() {
    this.Semesterservice.getUserAll()
      .subscribe({
        next: (value) => {
          console.log(`value: ${JSON.stringify(value.result)}`);
        },
        error: (error) => {
          console.log(`error: ${error.error}`);
        },
        complete: () => {
        },
      });
  }

  getSemesterAll() {
    this.loading = true;
    this.Semesterservice.clearCache();
    this.Semesterservice.getSemesterAll()
      .subscribe({
        next: (value) => {
          this.semesters = value;
          this.loading = false;
        },
        error: (error) => {
          this.error.security = 'danger';
          this.error.message = 'ดึงข้อมูลไม่สำเร็จ' + this.errorhandler.handleError(error);
          this.loading = false;
        },
        complete: () => {
        },
      });
    this.cancelForm();
  }

  formAdd() {
    this.model = new Semester();
    this.detail = false;
    this.btnForm = false;
    this.error = { security: '', message: '' };
  }

  formUpdate(semester: Semester) {
    this.semesterForm.controls['MyFile'].setValidators([]);
    this.semesterForm.controls['MyFile'].updateValueAndValidity();
    this.detail = false;
    this.model = semester;
    this.btnForm = true;
    this.error = { security: '', message: '' };
    this.readonly = true;
  }

  cancelForm() {
    this.model = new Semester();
    this.readonly = false;
    this.btnForm = false;
    this.filterQuery = '';
    this.semesterForm.controls['MyFile'].setValidators([Validators.required]);
    this.semesterForm.controls['MyFile'].updateValueAndValidity();
    this.semesterForm.reset();
  }

  fileChange(e) {
    this.model.MyFile = e.target.files[0];
    this.semesterForm.controls['MyFile'].setValue(this.model.MyFile ? this.model.MyFile.name : '');
  }

  onAddSemester() {
    this.filterQuery = this.model.Year;
    this.semesters = [];
    this.Semesterservice.addSemester(this.model).subscribe({
      next: (value) => {
      },
      error: (error) => {
        this.error.security = 'danger';
        console.log(error);
        this.error.message = 'บันทึกข้อมูลไม่สำเร็จ' + this.errorhandler.handleError(error);
      },
      complete: () => {
        this.error.security = 'info';
        this.error.message = 'บันทึกข้อมูลสำเร็จ';
        this.getSemesterAll();
      },
    });
  }

  onUpdateSemester() {
    this.Semesterservice.updateSemester(this.model).subscribe({
      next: (value) => {

      },
      error: (error) => {
        this.error.security = 'danger';
        this.error.message = 'แก้ไขข้อมูลไม่สำเร็จ' + this.errorhandler.handleError(error);
      },
      complete: () => {
        this.error.security = 'info';
        this.error.message = 'แก้ไขข้อมูลสำเร็จ';
        this.getSemesterAll();
      },
    });
    this.cancelForm();
  }

  onDelete(semester: Semester) {
    const index: number = this.semesters.indexOf(semester);
    if (confirm('คุณต้องการลบรายการนักศึกษารหัส ' + semester.Id + ' ใช่ไหม ?')) {
      this.Semesterservice.deleteSemester(semester.Id).subscribe({
        next: (value) => {
        },
        error: (error) => {
          this.error.security = 'danger';
          this.error.message = 'ลบข้อมูลไม่สำเร็จ' + this.errorhandler.handleError(error);
        },
        complete: () => {
          this.error.security = 'info';
          this.error.message = 'ลบข้อมูลสำเร็จ';
          if (index !== -1) {
            this.semesters.splice(index, 1);
          }
        },
      });
    }
    this.getSemesterAll();
    this.detail = false;
  }

  getTeacherAllBySid(semester: Semester) {
    this.Teacherservice.getTeacherAllBySid(semester.Id).subscribe({
      next: (value) => {
        this.model = new Semester();
        this.teachers = value;
      },
      error: (error) => {
        this.error.security = 'danger';
        this.error.message = 'ดึงข้อมูลไม่สำเร็จ' + this.errorhandler.handleError(error);
      },
      complete: () => {
      },
    });
  }

  onDetail(semester: Semester) {
    this.semester = semester;
    this.getTeacherAllBySid(semester);
    this.toggleDetail();
    this.detail = true;
  }

  toggleDetail() {
    this.cancelForm();
    this.detail = false;
  }



}
