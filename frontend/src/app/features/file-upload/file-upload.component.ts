import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  selectedFile: File | null = null;
  files: any[] = [];
  selectedFileNames: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUploadedFiles();
  }

  fetchUploadedFiles(): void {
    this.http.get<any[]>('http://localhost:4000/api/files').subscribe(
      (response) => {
        this.files = response;
      },
      (error) => {
        console.error('Error fetching files:', error);
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (this.selectedFile) {
      const fileName = this.selectedFile.name;
      const fileType = this.selectedFile.type;
     
      this.http.get('http://localhost:4000/api/get-presigned-url', {
        params: { fileName, fileType },
      }).subscribe(
        (response: any) => {
          const putUrl = response.url;

          this.http.put(putUrl, this.selectedFile, {
            headers: { 'Content-Type': fileType },
          }).subscribe(
            () => {
              console.log('File uploaded successfully to S3!');
              this.fetchUploadedFiles();
            },
            (error) => {
              console.error('Error uploading file:', error);
            }
          );
        },
        (error) => {
          console.error('Error getting pre-signed URL for PUT:', error);
        }
      );
    }
  }

  toggleFileSelection(fileName: string): void {
    const index = this.selectedFileNames.indexOf(fileName);
    if (index === -1) {
      this.selectedFileNames.push(fileName);
    } else {
      this.selectedFileNames.splice(index, 1);
    }
  }

  downloadSelectedFiles(): void {
    if (this.selectedFileNames.length > 0) {
      // Step 1: Fetch pre-signed URLs for the selected files
      this.http.get<{ urls: { fileName: string, url: string }[] }>('http://localhost:4000/api/get-presigned-urls-for-get', {
        params: { fileNames: this.selectedFileNames.join(',') } // Send selected file names as a comma-separated query parameter
      }).subscribe({
        next: (response) => {
          const zip = new JSZip();

          // Step 2: Fetch each file using the pre-signed URL
          response.urls.forEach((fileData) => {
            this.http.get(fileData.url, { responseType: 'arraybuffer' }).subscribe({
              next: (fileContent) => {
                // Step 3: Add file to zip using file name
                zip.file(fileData.fileName, fileContent);
              },
              error: (err) => {
                console.error('Error downloading file:', err);
              },
              complete: () => {
                // Step 4: Once all files are added to the zip, generate and download the zip
                zip.generateAsync({ type: 'blob' }).then((content) => {
                  FileSaver.saveAs(content, 'downloaded_files.zip');
                });
              }
            });
          });
        },
        error: (err) => {
          console.error('Error fetching pre-signed URLs:', err);
        }
      });
    }
  }
}
