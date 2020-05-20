const bytenode = require('./bytenode');

bytenode.init({ extName: '.robot' });

const init = require('./index');
const config = require('./config');

(async () => {
  const app = await init(config);
  const port = config.port || 1314;

  app.listen(port, () => {
    console.log(`App is on ${port}`);
  });
})();
