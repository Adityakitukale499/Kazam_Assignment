const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const Redis = require('ioredis');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

const redisClient = new Redis({
  host: 'redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com',
  port: 12675,
  username: 'default',
  password: 'dssYpBnYQrl01GbCGVhVq2e4dYvUrKJB'
});

const mongoClient = new MongoClient('mongodb+srv://assignment_user:HCgEj5zv8Hxwa4xO@test-cluster.6f94f5o.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
// const mongoClient = new MongoClient('mongodb+srv://adityakitukale4599:Aditya4599@cluster0.8ekoj3s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

(async () => {
  await mongoClient.connect();
})();

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
  console.log('connect mqtt')
  mqttClient.subscribe('/add');
});

mqttClient.on('message', async (topic, message) => {
  if (topic === '/add') {
    const newItem = JSON.parse(message.toString());
    redisClient.rpush('FULLSTACK_TASK_ADITYA', JSON.stringify(newItem));
    redisClient.llen('FULLSTACK_TASK_ADITYA', async (err, len) => {
      console.log(len);
      if (len > 50) {
        const items = await redisClient.lrange('FULLSTACK_TASK_ADITYA', 0, -1);
        const db = mongoClient.db('assignment');
        const collection = db.collection('assignment_Aditya_kitukale');
        for (const item of items) {
          const parsedItem = JSON.parse(item);
          await collection.insertOne({ note: parsedItem });
        }
        await redisClient.del('FULLSTACK_TASK_ADITYA');
      }
    });
  }
});

app.get('/fetchAllTasks', async (req, res) => {
  const db = mongoClient.db('assignment');
  const collection = db.collection('assignment_Aditya_kitukale');
  const tasks = await collection.find().toArray();
  res.json(tasks);
});

app.post('/add', (req, res) => {
  const { task } = req.body;
  mqttClient.publish('/add', JSON.stringify(task));
  res.send('Task added successfully');
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

mqttClient.on('error', (err) => {
  console.error('MQTT Error:', err);
});

mqttClient.on('close', () => {
  console.log('MQTT Connection closed');
});