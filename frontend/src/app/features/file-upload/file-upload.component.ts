import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileUploadService } from './file-upload-service.service';

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
  modalFileContent: SafeResourceUrl | string | null = null;

  constructor(
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchUploadedFiles();
  }

  fetchUploadedFiles(): void {
    this.fileUploadService.fetchUploadedFiles().subscribe(
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
    
      this.fileUploadService
        .getPresignedUrlForUpload(fileName, fileType)
        .subscribe(
          (response: any) => {
            const putUrl = response.url;
            this.fileUploadService
              .uploadFileToS3(putUrl, this.selectedFile!, fileType)
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
    this.fileUploadService
      .getPresignedUrlsForDownload([fileName])
      .subscribe((response) => {
        const fileData = response.urls.find((file) => file.fileName === fileName);
        if (!fileData) {
          console.error('File URL not found for:', fileName);
          alert('File URL not found');
          return;
        }

        this.fileUploadService.downloadFile(fileData.url).subscribe((fileBlob) => {
          this.modalFileType = fileBlob.type;

          if (fileBlob.type.startsWith('image')) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
              this.modalFileContent = fileReader.result as string;
              this.showModal = true;
            };
            fileReader.readAsDataURL(fileBlob);
          } else if (fileBlob.type === 'application/pdf') {
            const pdfURL = URL.createObjectURL(fileBlob);
            this.modalFileContent = this.sanitizer.bypassSecurityTrustResourceUrl(pdfURL);
            this.showModal = true;
          } else if (fileBlob.type.startsWith('text')) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
              this.modalFileContent = fileReader.result as string;
              this.showModal = true;
            };
            fileReader.readAsText(fileBlob);
          } else {
            console.error('Unsupported file type:', fileBlob.type);
            alert('Unsupported file type for preview.');
          }
        });
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.modalFileContent = null;
    this.modalFileType = null;
  }

  downloadSelectedFiles(): void {
    if (this.selectedFileNames.length > 0) {
      this.fileUploadService
        .getPresignedUrlsForDownload(this.selectedFileNames)
        .subscribe((response) => {
          this.fileUploadService.generateAndDownloadZip(response.urls);
        });
    }
  }
}
