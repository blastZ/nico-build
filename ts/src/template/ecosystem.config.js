module.exports = {
  apps: [
    {
      name: 'node-services-boilerplate',
      script: './app.js',
      instances: '-1',
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      out_file: './log/out.log',
      error_file: './log/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env_production: {
        DEBUG: 'nico:err',
        NODE_ENV: 'production',
        APP_ENV: 'production'
      }
    }
  ]
};
