const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const CustomError = require('./CustomError');

dotenv.config();

const PORT = process.env.PORT || 4000;
const file = fs.readFileSync('./swagger.yaml', { encoding: 'utf8' });
const swaggerDocument = YAML.parse(file);

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

let courses = [
  {
    id: '100',
    course: 'Frontend using React.js',
    price: 500,
  },
  {
    id: '200',
    course: 'Frontend using Vue.js',
    price: 400,
  },
  {
    id: '300',
    course: 'Backend using Node.js',
    price: 700,
  },
];

app.get('/api/v1', (_req, res) => {
  res.status(200).send('<h1>Swagger Docs</h1>');
});

app.get('/api/v1/course', (_req, res) => {
  res.status(200).json(courses[0]);
});

app.get('/api/v1/courses', (_req, res) => {
  res.status(200).json(courses);
});

app.get('/api/v1/course/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      throw new CustomError('Course ID not present', 400);
    }

    const course = courses.find(({ id }) => id === courseId);

    if (!course) {
      throw new CustomError('Course not found', 404);
    }

    res.status(200).json(course);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
