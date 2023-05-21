const router = require('express').Router();
const {Configuration, OpenAIApi} = require('openai');

// ChatGPT Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration);

let data = {};

router.get('/form', (req, res) => {
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
        data = JSON.parse(response.data.choices[0].text)
        res.redirect('/itenary')
    }).catch(err => {
        console.log(err)
    })

    data = {
        "itinerary": [
            {
                "activity": "Visit Stanley Park",
                "location": "Stanley Park, Vancouver, BC, Canada",
                "startTime": "10:00 AM",
                "endTime": "12:00 PM",
                "date": "2023-05-21",
                "duration": "2 hours",
                "cost": "$0",
                "rating": "4.5/5",
                "reviews": "Beautiful park with lots of activities to do"
            }, 
            {
                "activity": "Visit Granville Island",
                "location": "Granville Island, Vancouver, BC, Canada",
                "startTime": "12:30 PM",
                "endTime": "2:30 PM",
                "date": "2023-05-21",
                "duration": "2 hours",
                "cost": "$0",
                "rating": "4.7/5",
                "reviews": "Great place to explore with lots of shops and restaurants"
            }
        ]
    }

    // res.render('itenary', {data : data})
    
})

router.get('/', (req, res) => {
    res.render('itenary', {data : data})
})

// app.get('/getBusRoutes', (req, res) => {

// })

module.exports = router;