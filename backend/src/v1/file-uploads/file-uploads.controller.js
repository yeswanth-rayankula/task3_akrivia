const fileService = require('./file-uploads.service');

exports.getPresignedUrl = async (req, res) => {
  const { fileName, fileType } = req.query;
  console.log(fileName,fileType)
  if (!fileName || !fileType) {
    return res.status(400).send('File name and type are required.');
  }

  try {
    const url = await fileService.getPresignedUrl(fileName, fileType);
    res.status(200).json({ url });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).send('Error generating URL.');
  }
};


exports.getPresignedUrlsForGet = async (req, res) => {

  const { fileNames } = req.query;
  console.log("fucking");
  if (!fileNames) {
    return res.status(400).json({ error: 'Missing fileNames' });
  }

  try {
    const urls = await fileService.getPresignedUrlsForGet(fileNames);
    res.json({ urls });
  } catch (error) {
    console.error('Error generating pre-signed URLs:', error);
    res.status(500).json({ error: 'Failed to generate pre-signed URLs' });
  }
};

exports.listFiles = async (req, res) => {
   
  try {
    const files = await fileService.listFiles();
    res.json(files);
  } catch (error) {
    console.error('Error fetching files from S3:', error);
    res.status(500).json({ error: error.message });
  }
};


