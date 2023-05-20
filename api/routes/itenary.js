const router = require('express').Router();
const {Configuration, OpenAIApi} = require('openai');

// ChatGPT Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration);

router.get('/activities', (req, res) => {
    const {location, startDate, endDate, budget} = req.query
    console.log(location, startDate, endDate, budget)
    res.set('Access-Control-Allow-Origin', '*')
    res.send('hello')
    // const prompt = `I want to go for a 1 week vacation to Vancouver from 21st May 2023 to 27th May 2023. Plan me an itenary with activities and places to visit with specific dates and times. There should be multiple activities in a day. Give the answer in a JSON format with activities' loction, startTime, endTime, date, duration, cost, rating, reviews, etc.`

    // openai.createCompletion({
    //     model: 'text-davinci-003',
    //     prompt: prompt,
    //     max_tokens: 3000,
    //     temperature: 0
    // }).then(response => {
    //     console.log(response.data.choices[0].text)
    //     res.send(response.data.choices[0].text)
    // }).catch(err => {
    //     console.log(err)
    // })
})

module.exports = router;