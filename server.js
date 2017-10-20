'use strict';

const express = require('express')
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express()
const port = process.env['PORT'] || 80
const smtpHost = process.env['SMTP_HOST'] || 'localhost';
const smtpPort = process.env['SMTP_PORT'] || 1025;

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('POST to /v3/mail/send');
});

const flatten = (acc, list) => [...acc, ...list];
const toNameAddress = ({email, name}) => ({name, address: email});
const getReceiverList = ({ to = [] }) => to.map(toNameAddress);
const getReceivers = ({ body: { personalizations = [] } }) => personalizations.map(getReceiverList).reduce(flatten);
const getFrom = ({body: { from }}) => toNameAddress(from);
const getSubject = ({body: { subject }}) => subject;
const getValue = ({ value } = {}) => value || '';
const getPlainText = ({body: { content = [] }}) => getValue(content.find((c) => c.type === 'text/plain') || {});
const getHtml = ({body: { content = [] } }) => getValue(content.find((c) => c.type === 'text/html') || {});

app.post('/v3/mail/send', (req, res) => {
    const mailOptions = {
        from: getFrom(req), // sender address
        to: getReceivers(req),
        subject: getSubject(req),
        text: getPlainText(req),
        html: getHtml(req),
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.sendStatus(500).send(error.message);
        }
        res.sendStatus(202);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

process.once('SIGTERM', process.exit);