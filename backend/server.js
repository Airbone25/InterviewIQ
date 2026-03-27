require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const resumeRoutes = require('./routes/resume')
const interviewRoutes = require('./routes/interviews')
const reportRoutes = require('./routes/reports')
const speechRoutes = require('./routes/speech')

const app = express()
const PORT = process.env.PORT

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests — try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}))

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'AI rate limit hit — wait a moment.' },
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/interviews', aiLimiter, interviewRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/speech', speechRoutes)

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV || 'development',
}))

app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ─── Database + Start ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'interviewiq',
})
.then(() => {
  console.log('✅ MongoDB connected')
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message)
  process.exit(1)
})

module.exports = app
