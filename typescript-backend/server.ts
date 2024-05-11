import express, { Request, Response, Express } from 'express';
import bodyParser from 'body-parser';
import mqtt from 'mqtt';
import Redis from 'ioredis';
import { MongoClient, MongoClientOptions } from 'mongodb';
import cors from 'cors';

const app: Express = express();
const port: number = 8000;

app.use(cors());
app.use(bodyParser.json());

const redisClient = new Redis({
  host: 'redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com',
  port: 12675,
  username: 'default',
  password: 'dssYpBnYQrl01GbCGVhVq2e4dYvUrKJB'
});

const mongoClient = new MongoClient('mongodb+srv://assignment_user:HCgEj5zv8Hxwa4xO@test-cluster.6f94f5o.mongodb.net/',
  { useNewUrlParser: true, useUnifiedTopology: true } as MongoClientOptions);

(async () => {
  await mongoClient.connect();
})();

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
  console.log('connect mqtt');
  mqttClient.subscribe('/add');
});

mqttClient.on('message', async (topic, message) => {
  if (topic === '/add') {
    const newItem = JSON.parse(message.toString());
    redisClient.rpush('FULLSTACK_TASK_ADITYA', JSON.stringify(newItem));
    redisClient.llen('FULLSTACK_TASK_ADITYA', async (err, len) => {
      console.log(len);
      if (len && len > 50) {
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

app.get('/fetchAllTasks', async (req: Request, res: Response) => {
  const db = mongoClient.db('assignment');
  const collection = db.collection('assignment_Aditya_kitukale');
  const tasks = await collection.find().toArray();
  res.json(tasks);
});

app.post('/add', (req: Request, res: Response) => {
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
