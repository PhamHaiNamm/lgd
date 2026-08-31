let cloudinary = null;

try {
  const cloudinaryModule = require('cloudinary');
  cloudinary = cloudinaryModule.v2;
} catch (e) {
  cloudinary = null;
}

const config = require('./environment');

if (cloudinary && config.cloudinary.cloudName) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

module.exports = cloudinary;
