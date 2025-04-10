require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const shoppingRoutes = require('./routes/shopping');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const app = express();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-assistant', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/admin', adminRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 