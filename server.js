// backend/server.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cors = require('cors'); 

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.use(cors());

app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;
  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const referral = await prisma.referral.create({
      data: { referrerName, referrerEmail, refereeName, refereeEmail },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: refereeEmail,
      subject: 'You have been referred!',
      text: `Hi ${refereeName},\n\n${referrerName} has referred you. Check out our course!`,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json(referral);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('Server is running on port');
});
