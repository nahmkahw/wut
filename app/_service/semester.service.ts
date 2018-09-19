import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams, RequestOptions, RequestMethod, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/publishReplay';
import * as AppConst from '../_service/app.const';
import { AuthenService } from '../_service/authen.service';
import { Semester } from '../_model/semester';

@Injectable()
export class SemesterService {
  private cachedData: Observable<any>;
  private cachedDataSemester: Observable<any>;
  constructor(private http: Http, private authenService: AuthenService) {
  }

  getSemesterAll(): Observable<any> {
    if (!this.cachedDataSemester) {
      console.log('No cached semester');
      const headers = this.authenService.setHeadersAuthorization();
      const user = this.authenService.getUser();
      this.cachedDataSemester = this.http.get(`${AppConst.BASE_URL}/private/semester/${user}`, { headers: headers, method: 'GET' })
        .map((res: Response) => {
          return res.json().result;
        }).publishReplay().refCount();
    }
    console.log('cached semester');
    return this.cachedDataSemester;
  }

  getUserAll(): Observable<any> {
    const headers = this.authenService.setHeadersAuthorization();
    return this.http.get(`${AppConst.BASE_URL}/user/adithep`, { headers: headers, method: 'GET' })
      .map((res: Response) => {
        return res.json();
      });
  }

  getMemberAllByUser(): Observable<any> {
    const headers = this.authenService.setHeadersAuthorization();
    const user = this.authenService.getUser();
    const role = this.authenService.getRole();
    if (!this.cachedData) {
      console.log('No cached member');

      this.cachedData = this.http.get(`${AppConst.BASE_URL}/private/member/`, { headers: headers, method: 'GET' })
        .map((res: Response) => {
          return res.json().result;
        }).publishReplay(1).refCount();

    }
    console.log('Cached member.');
    return this.cachedData;
  }

  getToken(): Observable<any> {
    const headers = this.authenService.setHeadersAuthorization();
    const body = new URLSearchParams();
    const token = this.authenService.token;
    if (!this.cachedData) {
      console.log('No cached member');

      this.cachedData = this.http.get(`${AppConst.BASE_URL}/private/token/` + token, { headers: headers, method: 'GET' })
        .map((res: Response) => {
          return res.json().result;
        }).publishReplay(1).refCount();

    }
    console.log('Cached member.');
    return this.cachedData;
  }

  clearCache() {
    this.cachedData = null;
  }

  clearCachedDataSemester() {
    this.cachedDataSemester = null;
  }

  getMember(id: string): Observable<any> {
    const headers = this.authenService.setHeadersAuthorization();
    return this.http.get(`${AppConst.BASE_URL}/private/member/${id}`, { headers: headers, method: 'GET' })
      .map((response: Response) => response.json().result);
  }

  addSemester(semester: Semester): Observable<any> {
    const headers = this.authenService.setHeadersAuthorization();
    const user = this.authenService.getUser();
    // headers.append('Content-Type', 'multipart/form-data');
    const body = new FormData();
    Object.keys(semester).forEach(key => {
      body.append(key, semester[key]);
    });
    body.append('MyFile', semester.MyFile);
    body.append('Orguser', user);
    return this.http.post(`${AppConst.BASE_URL}/private/semester/`, body, { headers: headers, method: 'POST' })
      .map((response: Response) => {
        this.clearCachedDataSemester();
        return response.json();
      });
  }

  updateSemester(semester: Semester): Observable<any> {
    const headers = this.authenService.setHeadersAuthorization();
    const user = this.authenService.getUser();
    // headers.append('Content-Type', 'application/x-www-form-urlencoded');
    const body = new FormData();
    Object.keys(semester).forEach(key => {
      body.set(key, semester[key]);
    });
    body.append('MyFile', semester.MyFile);
    return this.http.put(`${AppConst.BASE_URL}/private/semester/${semester['Id']}`
      , body, { headers: headers, method: 'PUT' })
      .map((response: Response) => {
        return response.json();
      });
  }

  deleteSemester(Id: string): Observable<boolean> {
    const headers = this.authenService.setHeadersAuthorization();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.delete(`${AppConst.BASE_URL}/private/semester/${Id}`, { headers: headers, method: 'DELETE' })
      .map((response: Response) => {
        this.clearCachedDataSemester();
        return response.json().result;
      }
      );
  }
}
