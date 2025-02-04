import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ImportRecord {
  id: number;
  file_name:string;
  file_path: string;
  status: number;
  wrong_path: string;
  correct:number;
  incorrect:number;
}

@Component({
  selector: 'app-xl-imports',
  templateUrl: './xl-imports.component.html',
  styleUrls: ['./xl-imports.component.scss']
})
export class XlImportsComponent implements OnInit {
  imports: ImportRecord[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchImports();
  }

  fetchImports(): void {
    this.http.get<ImportRecord[]>('http://localhost:4000/api/v1/user/imports/get-imports')
      .subscribe(
        (data) => { this.imports = data; },
        (error) => { console.error('Error fetching imports:', error); }
      );
  }
  onManualCheck(id: any) {
    if (id) {
      
      this.http.post('http://localhost:4000/api/v1/user/imports/manual-check', { recordId: id })
        .subscribe(
          (response) => {
            console.log('Manual check success:', response);
          },
          (error) => {
            console.error('Error triggering manual check:', error);
          }
        );
    }
  }
}
