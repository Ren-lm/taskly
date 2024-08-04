//Backend code: index.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

const corsOptions = {
  origin: 'http://192.168.100.197:8081', // Adjust this URL to match where your frontend is running
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

mongoose.connect('mongodb://localhost:27017/taskly', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

const CategorySchema = new mongoose.Schema({
  name: String,
  color: String,
});

const TaskSchema = new mongoose.Schema({
  name: String,
  description: String,
  dueDate: Date,
  completed: Boolean,
  important: Boolean,
  files: [
    {
      uri: String,
      name: String,
      type: String,
    },
  ],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
});

const ListSchema = new mongoose.Schema({
  name: String,
  tasks: [TaskSchema],
});

const List = mongoose.model('List', ListSchema);
const Category = mongoose.model('Category', CategorySchema);

app.get('/lists', async (req, res) => {
  const lists = await List.find();
  res.send(lists);
});

app.post('/lists', async (req, res) => {
  const newList = new List(req.body);
  await newList.save();
  res.send(newList);
});

app.delete('/lists/:id', async (req, res) => {
  await List.findByIdAndDelete(req.params.id);
  res.send({ message: 'List deleted' });
});

app.get('/tasks', async (req, res) => {
  const { listId } = req.query;
  const list = await List.findById(listId).populate('tasks.category');
  if (list) {
    res.send(list.tasks);
  } else {
    res.status(404).send({ message: 'List not found' });
  }
});

app.post('/tasks', async (req, res) => {
  const { listId, task } = req.body;
  const list = await List.findById(listId);
  if (list) {
    const newTask = {
      ...task,
      important: task.important || false, // Set important field, defaulting to false if not provided
      _id: new mongoose.Types.ObjectId(),
    };
    list.tasks.push(newTask);
    await list.save();
    res.send(newTask);
  } else {
    res.status(404).send({ message: 'List not found' });
  }
});

// app.put('/tasks/:listId/:taskId', async (req, res) => {
//   const { listId, taskId } = req.params;
//   const { name, description, dueDate, completed, files, category, important } = req.body;
//   const list = await List.findById(listId);
//   if (list) {
//     const task = list.tasks.id(taskId);
//     if (task) {
//       task.name = name;
//       task.description = description;
//       task.dueDate = dueDate;
//       task.completed = completed;
//       task.files = files;
//       task.category = category;
//       task.important = important; // Ensure the important field is updated
//       await list.save();
//       res.send(task);
//     } else {
//       res.status(404).send({ message: 'Task not found' });
//     }
//   } else {
//     res.status(404).send({ message: 'List not found' });
//   }
// });

app.put('/tasks/:listId/:taskId', async (req, res) => {
  const { listId, taskId } = req.params;
  const { name, description, dueDate, completed, files, category, important } = req.body;

  console.log(`Received update request for task ${taskId} in list ${listId}`);
  console.log('Update details:', req.body); // Log the incoming task details

  try {
    const list = await List.findById(listId);
    if (list) {
      const task = list.tasks.id(taskId);
      if (task) {
        task.name = name;
        task.description = description;
        task.dueDate = dueDate;
        task.completed = completed;
        task.files = files;
        task.category = category;
        task.important = important; // Ensure the important field is updated

        await list.save();
        console.log('Task updated successfully:', task); // Log the task after update
        res.send(task);
      } else {
        res.status(404).send({ message: 'Task not found' });
      }
    } else {
      res.status(404).send({ message: 'List not found' });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
});


app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  res.send({
    uri: `http://localhost:3000/uploads/${req.file.filename}`,
    name: req.file.originalname,
    type: req.file.mimetype,
  });
});

app.delete('/tasks/:listId/:taskId', async (req, res) => {
  const { listId, taskId } = req.params;
  const list = await List.findById(listId);
  if (list) {
    const task = list.tasks.id(taskId);
    if (task) {
      task.remove();
      await list.save();
      res.send({ message: 'Task deleted' });
    } else {
      res.status(404).send({ message: 'Task not found' });
    }
  } else {
    res.status(404).send({ message: 'List not found' });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.send(categories);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.post('/categories', async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.send(newCategory);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.send({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.get('/tasks/today', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const lists = await List.find({
      "tasks.dueDate": { $gte: today, $lt: tomorrow }
    }).populate('tasks.category');

    const tasksDueToday = lists.reduce((acc, list) => {
      const tasks = list.tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      });
      return acc.concat(tasks.map(task => ({ ...task.toObject(), listId: list._id })));
    }, []);

    res.send(tasksDueToday);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
});

app.get('/tasks/important', async (req, res) => {
  console.log('Fetching important tasks...');

  try {
    const lists = await List.find({
      "tasks.important": true
    }).populate('tasks.category');

    const importantTasks = lists.reduce((acc, list) => {
      const tasks = list.tasks.filter(task => task.important);
      const tasksWithListId = tasks.map(task => {
        const taskWithListId = {
          ...task.toObject(),
          listId: list._id, // Add listId to each task
        };
        console.log('Task with listId:', taskWithListId); // Log the task with listId
        return taskWithListId;
      });
      return acc.concat(tasksWithListId);
    }, []);

    res.send(importantTasks);
  } catch (error) {
    console.error('Error fetching important tasks:', error);
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
});





app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
