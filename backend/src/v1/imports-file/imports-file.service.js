
const cron = require('node-cron');
const knex = require('knex');
const knexConfig = require('../../../knexfile');
const db = knex(knexConfig.development);
const {addProduct}=require('./../pagination/pagination.service.js')
const axios = require('axios');
const XLSX = require('xlsx');
const Joi = require('joi');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
require('dotenv').config();
const { Worker } = require('worker_threads');


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});






const uploadToS3 = async (filePath, fileName) => {
  try {
    const fileContent = await promisify(fs.readFile)(filePath);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `invalid_records/${fileName}`,
      Body: fileContent,
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; 
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

const createInvalidRecordsExcel = async (invalidRecords, fileName) => {
  try {
    const formattedRecords = invalidRecords.map(record => ({
      ...record,
      reason: record.reason.join('; '),
    }));

    const ws = XLSX.utils.json_to_sheet(formattedRecords);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invalid Records');

    const filePath = path.join(__dirname, fileName);
    XLSX.writeFile(wb, filePath);
    
    return filePath;
  } catch (error) {
    console.error('Error creating Excel file:', error);
    throw error;
  }
};









const downloadFileFromS3 = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = response.data;
    
    console.log('Content-Type:', response.headers['content-type']);
    
    const fileType = response.headers['content-type'];
    if (fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      throw new Error('The file is not a valid Excel (.xlsx) file.');
    }

    const parsedData = parseExcelData(buffer);
    console.log('Parsed Data:', parsedData);
    return parsedData;

  } catch (err) {
    console.error('Error downloading or processing the file:', err);
    throw err;
  }
};

const parseExcelData = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    console.log('Sheet Names:', workbook.SheetNames);

    const sheetNames = workbook.SheetNames;
    const sheet = workbook.Sheets[sheetNames[0]];

    console.log('Raw Sheet Content:', sheet);

    const rows = XLSX.utils.sheet_to_json(sheet, { raw: true });
    if (rows.length === 0) {
      console.log('Sheet appears to be empty or not properly structured.');
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: true });
    console.log('Parsed Data:', jsonData);
    return jsonData;
  } catch (err) {
    console.error('Error parsing Excel data:', err);
    throw err;
  }
};





    

  
 


const insertImportData = async (filePath, status,file_name) => {
  try {
    
    await db('import').insert({file_name:file_name, file_path: filePath, status: status });
  } catch (err) {
    throw new Error('Error inserting data into the database: ' + err.message);
  }
};
const exportData=async()=>{
   try{
        const  a=await db('import');
      
        return a;
   }
   catch{

   }
}

async function validateRecordsConcurrently(data) {
  const CHUNK_SIZE = 1000; 
  const chunks = [];
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    chunks.push(data.slice(i, i + CHUNK_SIZE));
  }


  const workerPromises = chunks.map((chunk) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.resolve(__dirname, 'validateWorker.js'), {
        workerData: chunk,
      });
      worker.on('message', resolve);
      worker.on('error', reject);
     
    });
  });

  
  const results = await Promise.all(workerPromises);


  const validRecords = [];
  const invalidRecords = [];
  results.forEach(({ validRecords: valid, invalidRecords: invalid }) => {
    validRecords.push(...valid);
    invalidRecords.push(...invalid);
  });

  return { validRecords, invalidRecords };
}

const getRecordsWithStatusZero = async (id) => {
  try {
    await db.transaction(async (trx) => {
      let record = null;
      
      if (id) {
        console.log("helo");
        record = await trx('import')
          .where({ id: id })
          .whereNull('locked_at')
          .orderBy('id', 'asc')
          .forUpdate()
          .first();
      } else {
        record = await trx('import')
          .where({ status: 0 })
          .whereNull('locked_at')
          .orderBy('id', 'asc')
          .forUpdate()
          .first();
      }

      if (!record) {
        console.log(`Worker ${process.pid}: No records to process.`);
        return;
      }

  
      await trx('import')
        .where('id', record.id)
        .update({
          locked_at: new Date()
        });

      
      const data = await downloadFileFromS3(record.file_path);

      const { validRecords, invalidRecords } = await validateRecordsConcurrently(data);

      let s3Url = null;
      if (validRecords.length > 0) {
        for (let row of validRecords) {
          await addProduct(row);
        }
      }

      if (invalidRecords.length > 0) {
        const fileName = `invalid_records_${Date.now()}.xlsx`;
        const filePath = await createInvalidRecordsExcel(invalidRecords, fileName);

        s3Url = await uploadToS3(filePath, fileName);
        console.log(`Worker ${process.pid}: Uploaded invalid records to`, s3Url);

        fs.unlinkSync(filePath);
      }

      await trx('import')
        .where('id', record.id)
        .update({
          status: 1,
          wrong_path: s3Url,
          locked_at: null,
          correct: validRecords.length,
          incorrect: invalidRecords.length
        });
    });
  } catch (err) {
    console.error(`Worker ${process.pid}: Error processing records - ${err.message}`);
  }
};




cron.schedule('*/10 * * * *', () => {
  getRecordsWithStatusZero();  
});
const manual_check = async (req, res) => {
  let id=req.body.recordId;
  console.log(id);
 
    getRecordsWithStatusZero(id)
};


module.exports = { insertImportData,exportData,manual_check }; 
