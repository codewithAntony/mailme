const express = require('express')
const { google } = require('googleapis')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
const port = 3000

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
)

app.get('/auth/google', (req, res) => {
    const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    })
    res.redirect(url)
})

app.get('/auth/callback', async(req, res) => {
    const { code } = req.query
    const { tokens } = await oAuth2Client.getToken(code)
    oAuth2Client.setCredentials(tokens)
    res.send('Authentification successful! You can close this window.')
});

app.get('/emails', async (req, res) => {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })
    const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
    })
    res.json(response.data)
})

app.listen(port, () => {
    console.log(`Server running on port:${port}`)
})