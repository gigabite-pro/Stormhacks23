const router = require('express').Router();
const {Configuration, OpenAIApi} = require('openai');
const axios = require('axios')
const Users = require('../models/Users');
const {OAuth2Client} = require('./auth')
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
    res.render('itinerary', {data: data})
})

router.get('/addToCalendar', (req, res) => {
    Users.findOne({email: req.session.user.email})
    .then(user => {
        OAuth2Client.setCredentials({refresh_token: user.refresh_token})
        const calendar = google.calendar({version: 'v3', auth: OAuth2Client})

        for (i = 0; i < data.Itinerary.length; i++) {
            const event = {
                summary: data.Itinerary[i].Activity,
                location: data.Itinerary[i].Location,
                description: data.Itinerary[i].Reviews,
                start: {
                    dateTime: moment(data.Itinerary[i].Date + " " + data.Itinerary[i].StartTime, 'YYYY-MM-DD hh:mm A').toISOString(),
                    timeZone: 'America/Los_Angeles',
                },
                end: {
                    dateTime: moment(data.Itinerary[i].Date + " " + data.Itinerary[i].EndTime, 'YYYY-MM-DD hh:mm A').toISOString(),
                    timeZone: 'America/Los_Angeles',
                },
                reminders: {
                    'useDefault': false,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10},
                    ]
                }
            }

            calendar.events.insert({
                auth: OAuth2Client,
                calendarId: 'primary',
                resource: event,
              }, function(err, event) {
                if (err) {
                  console.log('There was an error contacting the Calendar service: ' + err);
                  return;
                }
                console.log('Event created: %s', event.htmlLink);
              });
        }
    })
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