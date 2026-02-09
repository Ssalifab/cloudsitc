require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SALES_EMAIL = process.env.SALES_EMAIL || 'sales@cloudsitc.com';

// Create nodemailer transporter using SMTP settings from env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

const validate = (data) => {
  const errors = {};
  if (!data.name || String(data.name).trim().length < 2) errors.name = 'Name required';
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Valid email required';
  if (!data.phone || String(data.phone).trim().length < 7) errors.phone = 'Phone required';
  if (!data.service || String(data.service).trim().length < 2) errors.service = 'Service required';
  if (!data.message || String(data.message).trim().length < 10) errors.message = 'Message too short';
  return errors;
};

app.post('/api/contact', async (req, res) => {
  try {
    const data = req.body || {};
    const errors = validate(data);
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

    const subject = `Website quote request: ${data.service} — ${data.company || data.name}`;
    const html = `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Company:</strong> ${data.company || ''}</p>
      <p><strong>Service:</strong> ${data.service}</p>
      <p><strong>Budget:</strong> ${data.budget || ''}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${(data.message || '').replace(/\n/g, '<br/>')}</p>
    `;

    const mailOpts = {
      from: process.env.FROM_EMAIL || (process.env.SMTP_USER || `no-reply@${req.hostname}`),
      to: process.env.SALES_EMAIL || SALES_EMAIL,
      subject,
      html
    };

    await transporter.sendMail(mailOpts);

    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to send message' });
  }
});

app.listen(PORT, () => console.log(`Contact API listening on http://localhost:${PORT}`));
