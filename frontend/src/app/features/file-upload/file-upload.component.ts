import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  selectedFile: File | null = null;
  files: any[] = [];
  selectedFileNames: string[] = [];
  showModal = false;
  modalFileType: string | null = null;

  modalFileContent: SafeResourceUrl | string | null = null; // Updated to accept string for images
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.fetchUploadedFiles();
  }

  fetchUploadedFiles(): void {
    this.http.get<any[]>('http://localhost:4000/api/files/files').subscribe(
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

      this.http
        .get('http://localhost:4000/api/files/get-presigned-url', {
          params: { fileName, fileType },
        })
        .subscribe(
          (response: any) => {
            const putUrl = response.url;

            this.http
              .put(putUrl, this.selectedFile, {
                headers: { 'Content-Type': fileType },
              })
              .subscribe(
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

  showFile(fileName: string): void {
    
    this.http
      .get<{ urls: { fileName: string; url: string }[] }>(
        'http://localhost:4000/api/files/get-presigned-urls-for-get',
        {
          params: { fileNames: fileName },
        }
      )
      .subscribe({
        next: (response) => {
          const fileData = response.urls.find((file) => file.fileName === fileName);
          if (!fileData) {
            console.error('File URL not found for:', fileName);
            alert('File URL not found');
            return;
          }

          this.http.get(fileData.url, { responseType: 'blob' }).subscribe({
            next: (fileBlob: Blob) => {
              this.modalFileType = fileBlob.type;

              // Handle image files (JPEG, PNG, etc.)
              if (fileBlob.type.startsWith('image')) {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                  this.modalFileContent = fileReader.result as string; // Data URL for the image
                  this.showModal = true;
                };
                fileReader.readAsDataURL(fileBlob);
              }
              // Handle PDF files
              else if (fileBlob.type === 'application/pdf') {
                const pdfURL = URL.createObjectURL(fileBlob);
                this.modalFileContent = this.sanitizer.bypassSecurityTrustResourceUrl(pdfURL);
                this.showModal = true;
              }
              // Handle text files
              else if (fileBlob.type.startsWith('text')) {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                  this.modalFileContent = fileReader.result as string; // Plain text content
                  this.showModal = true;
                };
                fileReader.readAsText(fileBlob);
              }
              // Handle Excel files
              else if (
                fileBlob.type ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              ) {
                const fileURL = URL.createObjectURL(fileBlob);
                this.modalFileContent = fileURL; // Direct link for download
                this.showModal = true;
              } else {
                console.error('Unsupported file type:', fileBlob.type);
                alert('Unsupported file type for preview.');
              }
            },
            error: (err) => {
              console.error('Error fetching file content:', err);
              alert('Error fetching file content.');
            },
          });
        },
        error: (err) => {
          console.error('Error fetching file URL:', err);
          alert('Error fetching file URL.');
        },
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.modalFileContent = null;
    this.modalFileType = null;
  }

  downloadSelectedFiles(): void {
    if (this.selectedFileNames.length > 0) {
      // Step 1: Fetch pre-signed URLs for the selected files
      this.http.get<{ urls: { fileName: string, url: string }[] }>('http://localhost:4000/api/files/get-presigned-urls-for-get', {
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
