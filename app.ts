import * as express from 'express';
import * as dotenv from 'dotenv';
import * as multer from 'multer';
import axios from 'axios';
import { convert } from './convert';

dotenv.config();

const app = express();
const basicAuth = require('express-basic-auth')

app.use(basicAuth({
  users: { 'admin': process.env.EXPRESS_PASSWORD },
  challenge: true,
  realm: 'JCI Hong Kong',
}))

app.use(express.static(__dirname + '/public', {
  extensions: ['html']
}));

const upload = multer({
  storage: multer.memoryStorage()
});

app.post('/generate', upload.single('template'), async (req, res) => {
  try {
    const submissionsResponse = await axios.get(`http://api.jotform.com/form/83159166506461/submissions?apiKey=${process.env.API_KEY}`);
    const buffer = convert(submissionsResponse.data, req.file.buffer);

    res.type('docx');
    res.send(buffer);
  } catch (e) {
    res.send(e.message);
  }
})

app.listen(8181);