require('./engine');

const start = require('./index');
const config = require('./config');

(async () => {
  await start(config);
})();
