const router = require('express').Router();
const {Configuration, OpenAIApi} = require('openai');

// ChatGPT Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration);

router.get('/', (req, res) => {
    res.render('form')
})


router.post('/activities', (req, res) => {
    const {location, start, end, budget} = req.body
    console.log(location, start, end, budget)
    const prompt = `I want to go for a vacation to ${location} from ${start} to ${end} with a budget of $${budget}. Plan me an itenary with activities and places to visit with specific dates and times. There should be multiple activities in a day. Give the answer in a JSON format with activities' loction, startTime, endTime, date, duration, cost, rating, reviews, etc.`

    openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 3000,
        temperature: 0
    }).then(response => {
        res.render('itenary',{data: response.data.choices[0].text})
    }).catch(err => {
        console.log(err)
    })
    
})

// app.get('/getBusRoutes', (req, res) => {

// })

module.exports = router;