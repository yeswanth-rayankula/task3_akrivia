const importService = require('./imports-file.service');

const importData = async (req, res) => {
  const { url,file_name} = req.body;
  console.log(url);
  try {
     console.log(req.body,"denh");
    await importService.insertImportData(url, 0,file_name);
    res.status(200).json('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Server Error');
  }
};
const exportData = async (req, res) => {

  try {
     console.log(req.body,"denh");
    const data=await importService.exportData();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Server Error');
  }
};
module.exports = { importData,exportData };
