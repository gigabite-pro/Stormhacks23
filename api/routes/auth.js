const router = require('express').Router();
const axios = require('axios');
const Users = require('../models/Users');
const moment = require('moment')
const { google } = require('googleapis');
require('dotenv').config()

const redirectUri = process.env.REDIRECT_URI

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes
  });

router.get('/login', (req,res)=>{
    // creating consent screen url
    res.redirect(url)
})


router.get('/callback', async (req, res)=>{
    const code = req.query.code

    const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens);

    // getting user data
    const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${tokens.access_token}`,{
        headers : {
            Authorization: `Bearer ${tokens.id_token}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))

    
    Users.findOne({email: googleUser.email})
    .then((doc)=>{
        if(doc){
            //login
            req.session.user = doc
            res.redirect('/itinerary/form')
        }else{
            //register
            const newUser = new Users({
                name: googleUser.name,
                email: googleUser.email,
                pfp: googleUser.picture,
            })

            newUser.save()
            .then((resp)=>{
                req.session.user = resp
                res.redirect('/itinerary/form')
            })
            .catch(err => console.log(err))
        }
    })
    .catch(err => console.log(err))

})

router.get('/logout', (req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

router.post('/addToCalendar', (req, res) => {
    data = req.body
    const calendar = google.calendar({version: 'v3', auth: process.env.GOOGLE_CALENDAR_API_KEY})

    for (i = 0; i < 3; i++) {

        const event = {
            summary: data.Itinerary[i].Activity,
            location: data.Itinerary[i].Location,
            description: data.Itinerary[i].Reviews,
            start: {
                dateTime: moment(data.Itinerary[i].Date + " " + data.Itinerary[i].StartTime, 'YYYY-MM-DD hh:mm A').toISOString(),
                timeZone: 'Canada/Pacific',
            },
            end: {
                dateTime: moment(data.Itinerary[i].Date + " " + data.Itinerary[i].EndTime, 'YYYY-MM-DD hh:mm A').toISOString(),
                timeZone: 'Canada/Pacific',
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
            auth: oauth2Client,
            calendarId: 'primary',
            resource: event,
            }, function(err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                res.json({
                    status: "error",
                })
                return;
            }
        });
    }
    res.json({
        status: "success",
    })
})

module.exports = router;