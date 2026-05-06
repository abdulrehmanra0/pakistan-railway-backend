const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Resolve the path to the fares.json file
    const filePath = path.join(process.cwd(), 'data', 'fares.json');
    
    // Read the file from the local directory
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(jsonData);

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Fares API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load pricing data',
      message: error.message
    });
  }
};