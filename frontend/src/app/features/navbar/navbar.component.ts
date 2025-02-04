import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarService } from './navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  username: string = '';
  selectedFile: File | null = null;
  user: any;
  profilePicUrl:any=''
  
  constructor(private router: Router, private http: HttpClient, private navbarService: NavbarService) {}

  ngOnInit() {
    this.navbarService.getUserById().subscribe({
      next: (data) => {
        
        this.user = data;
        this.username = this.user.username;
        this.profilePicUrl=this.user.profile_pic;
      },
      error: (err) => {
        console.error('Error fetching user', err);
      }
    });
  }

  updateProfilePic() {
    const modal = document.getElementById('updateProfilePicModal');
    if (modal) {
      (modal as any).classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      modal.setAttribute('style', 'display: block;');
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile.name);
    }
  }

  uploadProfilePic(event: Event) {
    event.preventDefault();
    if (!this.selectedFile) {
      console.error('No file selected!');
      return;
    }
  
    const fileName = this.selectedFile.name;
    const fileType = this.selectedFile.type;
  
    console.log('Selected file:', this.selectedFile);
  

    this.http.get('http://localhost:4000/api/v1/user/files/get-presigned-url', {
      params: { fileName, fileType },
    }).subscribe(
      (response: any) => {
        const putUrl = response.url;
        console.log('PUT pre-signed URL:', putUrl);
  
        this.http.put(putUrl, this.selectedFile, {
          headers: { 'Content-Type': fileType },
        }).subscribe(
          () => {
            console.log('File uploaded successfully to S3!');
  
            
            const objectKey = `${fileName}`; 
            this.http.get('http://localhost:4000/api/v1/user/files/get-presigned-urls-for-get', {
              params: { fileNames: objectKey },
            }).subscribe(
              (getResponse: any) => {
                const getUrl = getResponse.urls[0].url; 
                console.log('GET pre-signed URL:', getUrl);
           
                this.profilePicUrl=getUrl;
                
                this.navbarService.updateUserProfilePic(this.user.user_id, { profile_pic: getUrl }).subscribe(
                  (updateResponse) => {
                    console.log('User profile picture URL updated in database:', updateResponse);
                    alert('Profile picture uploaded and updated successfully!');
                  },
                  (error) => {
                    console.error('Error updating user profile picture in database:', error);
                    alert('Failed to update profile picture in the database.');
                  }
                );
              },
              (error) => {
                console.error('Error getting GET pre-signed URL:', error);
                alert('Failed to get access URL.');
              }
            );
          },
          (error) => {
            console.error('Error uploading file to S3:', error);
            alert('Failed to upload profile picture.');
          }
        );
      },
      (error) => {
        console.error('Error getting PUT pre-signed URL:', error);
        alert('Failed to get upload URL.');
      }
    );
  }
  
  closeModal() {
    const modal = document.getElementById('updateProfilePicModal');
    if (modal) {
      (modal as any).classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('style', 'display: none;');
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }
  }

  logout() {
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
