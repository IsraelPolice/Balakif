const express = require('express');
const cors = require('cors');
const questionsRouter = require('./routes/questions');
const guessRouter = require('./routes/guess');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/questions', questionsRouter);
app.use('/api/guess', guessRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
