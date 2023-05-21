const router = require('express').Router();
const {Configuration, OpenAIApi} = require('openai');
const axios = require('axios')
const Users = require('../models/Users');
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
    const {location, start, end, people, budget, interests} = req.body
    console.log(location, start, end, people, budget, interests)
    const prompt = `I want to go for a vacation to ${location} with ${people} people from ${start} to ${end} with a budget of $${budget}. To help you find activities, here is a list of all our interests: ${interests}. Plan me an itinerary with activities and places to visit (preferably ones based off our interests) with specific dates and times. There should be multiple activities in a day. Give the answer in a JSON format with activities' loction, startTime, endTime, date, duration, cost, rating, reviews, etc. Format the JSON as:
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
        console.log(response.data.choices[0].text)
        data = JSON.parse(response.data.choices[0].text)
        res.redirect('/itinerary')
    }).catch(err => {
        console.log(err)
    })
})

router.get('/', (req, res) => {
    // Create a map to group activities by date
    const activitiesByDate = new Map();

    data.Itinerary.forEach(activity => {
    const date = activity.Date;
    if (activitiesByDate.has(date)) {
        activitiesByDate.get(date).push(activity);
    } else {
        activitiesByDate.set(date, [activity]);
    }
    });

    // Iterate through activities by date and find bus routes
    activitiesByDate.forEach(activities => {
        for (let i = 0; i < activities.length - 1; i++) {
            const currentActivity = activities[i];
            const nextActivity = activities[i + 1];
            
            axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${currentActivity.Location}&destination=${nextActivity.Location}&mode=transit&departure_time=${moment(currentActivity.Date + " " + currentActivity.EndTime, 'YYYY-MM-DD hh:mm A').unix()}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
            .then(response => {
                const routes = response.data.routes;
                if (routes.length > 0) {
                    const legs = routes[0].legs;
                    if (legs.length > 0) {
                        const step = legs[0].steps.filter(step => step.travel_mode === 'TRANSIT')[0];
                        if (!step) {
                            console.log('No transit directions found.');
                            return;
                        }
                        
                        if(step.transit_details.line.vehicle.type === 'BUS'){
                            const busNumber = step.transit_details.line.short_name;
                            const departureTime = step.transit_details.departure_time.text;
                            const arrivalTime = step.transit_details.arrival_time.text;
                            console.log(`Bus ${busNumber}: Departure at ${departureTime}, Arrival at ${arrivalTime}`);
                        } else {
                            console.log('No transit directions found.');
                        }
                    } else {
                        console.log('No transit directions found.');
                    }
                } else {
                console.log('No routes found.');
                }
            })
        }
    });
    res.render('itinerary', {data: data})
})

router.get('/addToCalendar', (req, res) => {
    const headers = {
        'Content-Type': 'application/json',
    }
    axios.post(`http://localhost:3000/auth/addToCalendar`, data, { headers })
    .then(body => {
        res.json({
            body: "success"
        })
    })
    .catch(err => console.log(err))
})


router.post('/ai-chatbot', (req, res) => {
    console.log("hi")
    const {message} = req.body
    console.log(message)
    const prompt = `${message}`

    openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 3000,
        temperature: 0
    }).then(response => {
        console.log(response.data.choices[0].text)
        // data = JSON.parse(response.data.choices[0].text)
        res.redirect('/itinerary')
    }).catch(err => {
        console.log(err)
    })
})

module.exports = router;