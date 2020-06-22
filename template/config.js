const config = {
  production: {}
};

const env = process.env.APP_ENV || 'production';

module.exports = config[env];
