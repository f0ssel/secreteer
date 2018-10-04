const config = require('config');
const Datastore = require('@google-cloud/datastore');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const port = 3000;
const datastore = new Datastore({
  projectId: config.gcp.projectId,
});
const kind = 'SecreteerStore';

const db = {
  get: async function (key) {
    const dsKey = datastore.key([kind, key]);
    return await datastore.get(dsKey);
  },
  save: async function (key, data) {
    const dsKey = datastore.key([kind, key]);
    const entity = {
      key: dsKey,
      data: {
        data: data
      },
    };
    await datastore.save(entity);
    return 
  }
}

const store = {
  get: async function (path) {
    const namespaces = path.split('/');
    let data = {};
    for (let i = 0; i < namespaces.length; i++) {
      const key = namespaces.slice(0, i + 1).join('/');
      let result = await db.get(key);
      if (result[0]) {
        Object.assign(data, result[0].data);
      }
    }
    return data;
  },
  save: async function (key, data) {
    const result = await db.save(key, data);
    return await this.get(key);
  }
}

app.get('/api/store/*', async (req, res) => {
  const path = req.path.slice(11, req.path.length);;
  const data = store.get(path);
  res.status(200).json(data);
});

app.post('/api/store/*', async (req, res) => {
  const path = req.path.slice(11, req.path.length);;
  const data = req.body;
  const result = await store.save(path, data);
  res.status(200).json(result);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

