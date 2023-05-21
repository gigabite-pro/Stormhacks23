const router = require('express').Router();
const axios = require('axios');
const qs = require('qs');
const Users = require('../models/Users');
const { google } = require('googleapis');
const {OAuth2} = google.auth
require('dotenv').config()

const redirectUri = process.env.REDIRECT_URI

function getGoogleAuthURL(){
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    const options = {
        redirect_uri : redirectUri,
        client_id : process.env.GOOGLE_CLIENT_ID,
        access_type : 'offline',
        response_type : 'code',
        scope : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
        prompt : 'consent'
    }

     return `${rootUrl}?${qs.stringify(options)}`
}

function getTokens({code, clientId, clientSecret, redirectUri}){
    const url = 'https://oauth2.googleapis.com/token'
    const options = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
    }

    return axios.post(url, qs.stringify(options), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((res) => res.data)
    .catch(err => console.log(err))
}



router.get('/login', (req,res)=>{
    // creating consent screen url
    res.redirect(getGoogleAuthURL())
})

const OAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
)

router.get('/callback', async (req, res)=>{
    const code = req.query.code

    // getting access tokens
    const token = await OAuth2Client.getToken(code);

    console.log(token)

    // getting user data
    const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${token.tokens.access_token}`,{
        headers : {
            Authorization: `Bearer ${token.tokens.id_token}`
        }
    }).then(res => res.data)
    .catch(err => console.log(err))

    
    Users.findOne({email: googleUser.email})
    .then((doc)=>{
        if(doc){
            //login
            req.session.user = doc
            res.redirect('/dashboard')
        }else{
            //register
            const newUser = new Users({
                name: googleUser.name,
                email: googleUser.email,
                pfp: googleUser.picture,
                access_token: token.tokens.access_token,
                refresh_token: token.tokens.refresh_token
            })

            newUser.save()
            .then((resp)=>{
                req.session.user = resp
                res.redirect('/dashboard')
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

module.exports = router, OAuth2Client;