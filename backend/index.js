const express = require('express');
const cors = require('cors');
const app = express();
const register = require('./src/v1/register/register.routes');
const loginUser = require('./src/v1/login/login.routes');
const User = require('./src/v1/user/user.routes');
const product = require('./src/v1/pagination/pagination.routes');
const AWS = require('aws-sdk');
const { decryptRequestBody, encryptResponseBody } = require('./src/middlewares/decrypt');




app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200'
}));
// app.use(decryptRequestBody);




app.use('/api/v1/user',  register);
app.use('/api/v1/user',  loginUser);

app.use('/api/v1/user',  User);
app.use('/api/v1/user',product)


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

app.get('/api/get-presigned-url', (req, res) => {
 
  const fileName = req.query.fileName;
  const fileType = req.query.fileType; 
  console.log(fileType);
if (!fileName || !fileType) {
    return res.status(400).send('File name and type are required.');
  }
 
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `yes/files/${fileName}`,
    Expires: 300, 
    ContentType: fileType, 
  };

  
  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      console.error('Error generating pre-signed URL:', err);
      return res.status(500).send('Error generating URL.');
    }

     console.log(url);
     res.status(200).json({ url });
  });
});

app.get('/api/get-presigned-urls-for-get', (req, res) => {
  const { fileNames } = req.query; 
  console.log(fileNames);
  if (!fileNames) {
    return res.status(400).json({ error: 'Missing fileNames' });
  }

  const files = fileNames.split(','); 
  const preSignedUrls = [];


  Promise.all(
    files.map((fileName) => {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `yes/files/${fileName}`,
        Expires: 300000, 
      };

      return s3.getSignedUrlPromise('getObject', params)
        .then((url) => ({
          
          fileName,
          url,
        }))
        .catch((error) => {
          console.error(`Error generating pre-signed URL for ${fileName}:`, error);
          throw new Error(`Failed to generate pre-signed URL for ${fileName}`);
        });
    })
  )
    .then((urls) => {
      res.json({ urls });
    })
    .catch((error) => {
      console.error('Error generating pre-signed URLs:', error);
      res.status(500).json({ error: 'Failed to generate pre-signed URLs' });
    });
});

app.get('/api/files', (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: 'yes/files/', // This limits the files to only those in the 'yes/files/' directory
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error('Error fetching files from S3:', err);
      return res.status(500).json({ error: 'Failed to fetch files from S3' });
    }

    if (data.Contents.length === 0) {
      return res.status(404).json({ error: 'No files found in the S3 bucket' });
    }

    const files = data.Contents.map(file => {
      const fileNameWithPrefix = file.Key.replace('yes/files/', ''); 
      
      return {
        name: fileNameWithPrefix,
        lastModified: file.LastModified,
        size: file.Size,
      };
    });

    res.json(files); // Send the list of files to the frontend
  });
});


// app.use(encryptResponseBody);


app.listen(4000, () => console.log('Server running on port 4000'));
