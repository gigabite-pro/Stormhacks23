const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const {isAuthorized} = require('./config/authCheck');
const authRoute = require('./routes/auth');
const {Configuration, OpenAIApi} = require('openai');
require('dotenv').config();

// Middlewares
app.set('views', (__dirname + '/views'))
app.set('view engine', 'ejs');
app.use(
    session({
        secret : 'yoyohoneysingh',
        cookie : {
            maxAge : 60000 * 60 * 24
        },
        saveUninitialized : true,
        resave : false
    })
)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// DB connection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))

// Routes
app.use('/auth', authRoute);

// ChatGPT Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration);

// Home Route
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/test', (req,res) => {
    const prompt = "I want to go for a 1 week vacation to Vancouver. Plan me an itenary in json format with specifics like bus times, hotel names, etc."

    openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 2048,
        temperature: 1
    }).then(response => {
        console.log(response.data.choices[0].text)
        res.send(response.data.choices[0].text)
    }).catch(err => {
        console.log(err)
    })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`);
})