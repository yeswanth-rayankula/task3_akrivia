import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private baseUrl = `${environment.apiUrl}/api/v1/user/files`;

  constructor(private http: HttpClient) {}

  fetchUploadedFiles() {
    return this.http.get<any[]>(`${this.baseUrl}/files`);
  }

  getPresignedUrlForUpload(fileName: string, fileType: string) {
    return this.http.get(`${this.baseUrl}/get-presigned-url`, {
      params: { fileName, fileType },
    });
  }

  uploadFileToS3(putUrl: string, file: File, fileType: string) {
    console.log("uploading");
    return this.http.put(putUrl, file, {
      headers: { 'Content-Type': fileType },
    });
  }

  getPresignedUrlsForDownload(fileNames: string[]) {
    return this.http.get<{ urls: { fileName: string; url: string }[] }>(
      `${this.baseUrl}/get-presigned-urls-for-get`,
      {
        params: { fileNames: fileNames.join(',') },
      }
    );
  }
  
  downloadFile(url: string) {
    return this.http.get(url, { responseType: 'blob' });
  }

  generateAndDownloadZip(files: { fileName: string; url: string }[]): void {
    const zip = new JSZip();
  
    const filePromises = files.map((fileData) =>
      this.downloadFile(fileData.url)
        .toPromise()
        .then((fileContent) => {
          if (fileContent) {
            zip.file(fileData.fileName, fileContent);
          } else {
            console.error(`File content for ${fileData.fileName} is undefined.`);
          }
        })
        .catch((error) => {
          console.error(`Error downloading file ${fileData.fileName}:`, error);
        })
    );
  
    Promise.all(filePromises).then(() => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        FileSaver.saveAs(content, 'downloaded_files.zip');
      });
    });
  }
  
  
}