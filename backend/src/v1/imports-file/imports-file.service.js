// const knex = require('knex');
// const knexConfig = require('../../../knexfile');
// const db = knex(knexConfig.development);
// const cron = require('node-cron');
// const axios = require('axios');
// const XLSX = require('xlsx');
// const Joi = require('joi');
// require('dotenv').config();

// const recordSchema = Joi.object({
//   product_name: Joi.string().required(),
//   category_name: Joi.string()
//     .valid(
//       'Books & Stationery',
//       'Electronics',
//       'Furniture',
//       'Clothing',
//       'Food & Beverages',
//       'Health & Beauty',
//       'Sports & Outdoors',  
//       'Toys & Games',
//       'Office Supplies'
//     )
//     .required(),
//   vendor_name: Joi.string()
//     .valid('Zomato', 'Blinkit', 'Swiggy', 'Amazon', 'Flipkart')
//     .insensitive()
//     .required(),
//   unit_price: Joi.number().positive().required(),
//   quantity_in_stock: Joi.number().positive().required(),
// });


// cron.schedule('* * * * *', () => {
//   console.log('Running cron job...');
//   getRecordsWithStatusZero();
// });

// const AWS = require('aws-sdk');
// const fs = require('fs');
// const path = require('path');
// const { promisify } = require('util');


// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });
// const uploadToS3 = async (filePath, fileName) => {
//   try {
//     const fileContent = await promisify(fs.readFile)(filePath);

//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: `invalid_records/${fileName}`,
//       Body: fileContent,
//       ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     };

//     const uploadResult = await s3.upload(params).promise();
//     return uploadResult.Location; 
//   } catch (error) {
//     console.error('Error uploading to S3:', error);
//     throw error;
//   }
// };


// const createInvalidRecordsExcel = async (invalidRecords, fileName) => {
//   try {
   
//     const formattedRecords = invalidRecords.map(record => ({
//       ...record,
//       reason: record.reason.join('; '),
//     }));

//     const ws = XLSX.utils.json_to_sheet(formattedRecords);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Invalid Records');

//     const filePath = path.join(__dirname, fileName);
//     XLSX.writeFile(wb, filePath);
    
//     return filePath;
//   } catch (error) {
//     console.error('Error creating Excel file:', error);
//     throw error;
//   }
// };

// const getRecordsWithStatusZero = async () => {
//   try {
//     const records = await db('import').where('status', 0);
//     for (let record of records) {
//       console.log('File Path:', record.file_path);
//       const data = await downloadFileFromS3(record.file_path);
//       const validRecords = [];
//       const invalidRecords = [];

//       for (let row of data) {
//         const validationErrors = validateRecord(row);
//         if (validationErrors.length === 0) {
//           validRecords.push(row);
//         } else {
//           invalidRecords.push({ ...row, reason: validationErrors });
//         }
//       }

//       console.log('Valid Records:', validRecords);
//       console.log('Invalid Records:', invalidRecords);

//       let s3Url = null;

//       if (invalidRecords.length > 0) {
//         const fileName = `invalid_records_${Date.now()}.xlsx`;
//         const filePath = await createInvalidRecordsExcel(invalidRecords, fileName);
//         s3Url = await uploadToS3(filePath, fileName);

//         console.log('Invalid records uploaded to:', s3Url);
//         fs.unlinkSync(filePath);
//       }

    
//       await db('import')
//         .where({ id: record.id }) 
//         .update({ status: 1, wrong_path: s3Url });

//       console.log(`Record ID ${record.id} updated with status 1 and S3 URL: ${s3Url}`);
//     }
//   } catch (err) {
//     throw new Error('Error fetching records from the database: ' + err.message);
//   }
// };


// const validateRecord = (record) => {
//   const { error } = recordSchema.validate(record, { abortEarly: false });
//   return error ? error.details.map((err) => err.message) : [];
// };

// const downloadFileFromS3 = async (url) => {
//   try {
//     const response = await axios.get(url, { responseType: 'arraybuffer' });
//     const buffer = response.data;
    
//     console.log('Content-Type:', response.headers['content-type']);
    
//     const fileType = response.headers['content-type'];
//     if (fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
//       throw new Error('The file is not a valid Excel (.xlsx) file.');
//     }

//     const parsedData = parseExcelData(buffer);
//     console.log('Parsed Data:', parsedData);
//     return parsedData;

//   } catch (err) {
//     console.error('Error downloading or processing the file:', err);
//     throw err;
//   }
// };

// const parseExcelData = (buffer) => {
//   try {
//     const workbook = XLSX.read(buffer, { type: 'buffer' });

//     console.log('Sheet Names:', workbook.SheetNames);

//     const sheetNames = workbook.SheetNames;
//     const sheet = workbook.Sheets[sheetNames[0]];

//     console.log('Raw Sheet Content:', sheet);

//     const rows = XLSX.utils.sheet_to_json(sheet, { raw: true });
//     if (rows.length === 0) {
//       console.log('Sheet appears to be empty or not properly structured.');
//     }

//     const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: true });
//     console.log('Parsed Data:', jsonData);
//     return jsonData;
//   } catch (err) {
//     console.error('Error parsing Excel data:', err);
//     throw err;
//   }
// };

// const insertImportData = async (filePath, status,file_name) => {
//   try {
//     // console.log(filePath);
//     await db('import').insert({file_name:file_name, file_path: filePath, status: status });
//   } catch (err) {
//     throw new Error('Error inserting data into the database: ' + err.message);
//   }
// };
// const exportData=async()=>{
//    try{
//         const  a=await db('import');
//         // console.log(a);
//         return a;
//    }
//    catch{

//    }
// }
// module.exports = { insertImportData,exportData };



const os = require('os');

const cluster = require('cluster');
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

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const recordSchema = Joi.object({
  product_name: Joi.string().required(),
  category_name: Joi.string()
    .valid(
      'Books & Stationery',
      'Electronics',
      'Furniture',
      'Clothing',
      'Food & Beverages',
      'Health & Beauty',
      'Sports & Outdoors',  
      'Toys & Games',
      'Office Supplies'
    )
    .required(),
  vendor_name: Joi.string()
    .valid('Zomato', 'Blinkit', 'Swiggy', 'Amazon', 'Flipkart')
    .insensitive()
    .required(),
  unit_price: Joi.number().positive().required(),
  quantity_in_stock: Joi.number().positive().required(),
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
const getRecordsWithStatusZero = async () => {
  console.log("Worker starting...");

  try {
   
    const record = await db('import')
      .where({ status: 0 })
      .whereNull('locked_at')  // Ensure record is not already locked
      .orderBy('id', 'asc')     // Optionally, prioritize which records to lock
      .forUpdate()              // Lock the record for this transaction
      .first();
    
    console.log("worker working or wot", record);  // Add this log to check the fetched record

    if (!record) {
      console.log(`Worker ${process.pid}: No records to process.`);
      return;
    }

    // Step 2: Lock the record by setting `locked_at` and associate the worker's process id
    console.log(`Worker ${process.pid}: Locking record ${record.id}`);
    await db('import')
      .where('id', record.id)
      .update({
        locked_at: new Date(),
        process_id: process.pid,
      });

    console.log(`Worker ${process.pid}: Locked record ${record.id}`);


    const data = await downloadFileFromS3(record.file_path);
    console.log("Worker", process.pid, "Data downloaded:", data); 

    const validRecords = [];
    const invalidRecords = [];

 
    for (let row of data) {
      const validationErrors = validateRecord(row);
      if (validationErrors.length === 0) {
        validRecords.push(row);
      } else {
        invalidRecords.push({ ...row, reason: validationErrors });
      }
    }

    console.log(`Worker ${process.pid}: Valid Records - ${validRecords.length}`);
    console.log(`Worker ${process.pid}: Invalid Records - ${invalidRecords.length}`);

    let s3Url = null;

    if(validRecords.length>0)
    {
      for(let row of validRecords)
        await addProduct(row);
    }
    if (invalidRecords.length > 0) {
      const fileName = `invalid_records_${Date.now()}.xlsx`;
      const filePath = await createInvalidRecordsExcel(invalidRecords, fileName);
      console.log("Worker", process.pid, "Created invalid records Excel file", filePath);
      
      s3Url = await uploadToS3(filePath, fileName);
      console.log(`Worker ${process.pid}: Uploaded invalid records to ${s3Url}`);
      fs.unlinkSync(filePath);
    }

   
    await db('import')
      .where('id', record.id)
      .update({
        status: 1, 
        wrong_path: s3Url, 
        locked_at: null,  
      });

    console.log(`Worker ${process.pid}: Successfully processed record ${record.id}`);

  } catch (err) {
    console.error(`Worker ${process.pid}: Error processing records - ${err.message}`);
  }
};





const validateRecord = (record) => {
  const { error } = recordSchema.validate(record, { abortEarly: false });
  return error ? error.details.map((err) => err.message) : [];
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
    // console.log(filePath);
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




cron.schedule("* * * * *", () => {

  console.log("Task executed at:", new Date().toLocaleString());
  getRecordsWithStatusZero();  
});


module.exports = { insertImportData,exportData }; 
