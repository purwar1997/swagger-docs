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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.post('/course/add', (req, res) => {
  try {
    let { id, course, price } = req.body;

    if (!(id && course && price)) {
      throw new CustomError('Please provide all the details', 400);
    }

    price = Number(price);

    if (isNaN(price) || price <= 0) {
      throw new CustomError('Price should be a positive number', 400);
    }

    courses.push({ id, course, price });

    res.status(201).json(courses);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
});

app.put('/course/update/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    let { id, course, price } = req.body;

    if (!courseId) {
      throw new CustomError('Course ID not present', 400);
    }

    if (!(id && course && price)) {
      throw new CustomError('Please provide all the details', 400);
    }

    price = Number(price);

    if (isNaN(price) || price <= 0) {
      throw new CustomError('Price should be a positive number', 400);
    }

    const courseIndex = courses.findIndex(({ id }) => id === courseId);

    if (courseIndex === -1) {
      throw new CustomError('Course not found', 404);
    }

    courses.splice(courseIndex, 1, { id, course, price });

    res.status(201).json(courses);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
});

app.delete('/course/delete/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      throw new CustomError('Course ID not present', 400);
    }

    const courseIndex = courses.findIndex(({ id }) => id === courseId);

    if (courseIndex === -1) {
      throw new CustomError('Course not found', 404);
    }

    courses.splice(courseIndex, 1);

    res.status(200).json(courses);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
