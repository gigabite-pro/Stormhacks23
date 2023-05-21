const router = require('express').Router();
const {Configuration, OpenAIApi} = require('openai');
const axios = require('axios')
const moment = require('moment')

// ChatGPT Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration);

let data = {}

router.get('/form', (req, res) => {
    res.render('form')
})


router.post('/activities', (req, res) => {
    const {location, start, end, budget} = req.body
    console.log(location, start, end, budget)
    const prompt = `I want to go for a vacation to ${location} from ${start} to ${end} with a budget of $${budget}. Plan me an itenary with activities and places to visit with specific dates and times. There should be multiple activities in a day. Give the answer in a JSON format with activities' loction, startTime, endTime, date, duration, cost, rating, reviews, etc. Format the JSON as:
    {
        "Itinerary": [
            {
                "Activity": "Visit Stanley Park",
                "Location": "Stanley Park, Vancouver, BC, Canada",
                "StartTime": "10:00 AM",
                "EndTime": "2:00 PM",
                "Date": "2023-05-21",
                "Duration": "4 hours",
                "Cost": "$0",
                "Rating": "4.5/5",
                "Reviews": "Beautiful park with lots of activities to do"
            }
        ]
    }`

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
})

router.get('/', (req, res) => {
    for (i = 0; i < data.Itinerary.length - 1; i++) {
        if(data.Itinerary[i].Date == data.Itinerary[i+1].Date) {
            axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${data.Itinerary[i].Location}&destination=${data.Itinerary[i+1].Location}&mode=transit&departure_time=${moment(data["Itinerary"][i]["Date"] + " " + data["Itinerary"][i]["EndTime"], 'YYYY-MM-DD hh:mm A').unix()}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
            .then(response => {
                const routes = response.data.routes;
                if (routes.length > 0) {
                const legs = routes[0].legs;
                if (legs.length > 0) {
                    const step = legs[0].steps.filter(step => step.travel_mode === 'TRANSIT')[0];
                    const busNumber = step.transit_details.line.short_name;
                    const departureTime = step.transit_details.departure_time.text;
                    const arrivalTime = step.transit_details.arrival_time.text;
                    console.log(`Bus ${busNumber}: Departure at ${departureTime}, Arrival at ${arrivalTime}`);
                } else {
                    console.log('No transit directions found.');
                }
                } else {
                console.log('No routes found.');
                }
            })
        }
   }
    res.send(data)
})

module.exports = router;