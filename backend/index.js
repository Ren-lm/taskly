// //Backend code: index.js // -------- category disappearing fix

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const port = 3000;

// app.use(bodyParser.json({ limit: '50mb' }));

// // Configure CORS to allow requests from the frontend
// const corsOptions = {
//   origin: 'http://192.168.100.197:8081', // Adjust this URL to match where your frontend is running
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// mongoose.connect('mongodb://localhost:27017/taskly', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch((err) => {
//   console.error('Failed to connect to MongoDB', err);
// });

// // Define your schemas and routes here

// const CategorySchema = new mongoose.Schema({
//   name: String,
//   color: String,
// });

// const TaskSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   dueDate: Date,
//   completed: Boolean,
//   files: [
//     {
//       uri: String,
//       name: String,
//       type: String,
//     },
//   ],
//   category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
// });

// const ListSchema = new mongoose.Schema({
//   name: String,
//   tasks: [TaskSchema],
// });

// const List = mongoose.model('List', ListSchema);
// const Category = mongoose.model('Category', CategorySchema);

// app.get('/lists', async (req, res) => {
//   console.log('Fetching lists');
//   const lists = await List.find();
//   res.send(lists);
// });

// app.post('/lists', async (req, res) => {
//   console.log('Creating a new list:', req.body);
//   const newList = new List(req.body);
//   await newList.save();
//   res.send(newList);
// });

// app.delete('/lists/:id', async (req, res) => {
//   console.log('Deleting list with ID:', req.params.id);
//   await List.findByIdAndDelete(req.params.id);
//   res.send({ message: 'List deleted' });
// });

// app.get('/tasks', async (req, res) => {
//   const { listId } = req.query;
//   console.log('Fetching tasks for list ID:', listId);
//   const list = await List.findById(listId).populate('tasks.category');
//   if (list) {
//     res.send(list.tasks);
//   } else {
//     res.status(404).send({ message: 'List not found' });
//   }
// });

// app.post('/tasks', async (req, res) => {
//   const { listId, task } = req.body;
//   console.log('Adding task to list ID:', listId, 'Task:', task);
//   const list = await List.findById(listId);
//   if (list) {
//     const newTask = {
//       ...task,
//       _id: new mongoose.Types.ObjectId(),
//     };
//     list.tasks.push(newTask);
//     await list.save();
//     res.send(newTask);
//   } else {
//     res.status(404).send({ message: 'List not found' });
//   }
// });

// app.put('/tasks/:listId/:taskId', async (req, res) => {
//   const { listId, taskId } = req.params;
//   console.log('Updating task with ID:', taskId, 'in list with ID:', listId);
//   const { name, description, dueDate, completed, files, category } = req.body;
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
//       await list.save();
//       const updatedList = await List.findById(listId).populate('tasks.category');
//       const updatedTask = updatedList.tasks.id(taskId);
//       res.send(updatedTask);
//     } else {
//       res.status(404).send({ message: 'Task not found' });
//     }
//   } else {
//     res.status(404).send({ message: 'List not found' });
//   }
// });


 
// app.delete('/tasks/:listId/:taskId', async (req, res) => {
//   const { listId, taskId } = req.params;
//   console.log(`Deleting task with ID: ${taskId} from list ID: ${listId}`);
//   try {
//     const list = await List.findById(listId);
//     if (list) {
//       const task = list.tasks.id(taskId);
//       if (task) {
//         task.remove();
//         await list.save();
//         res.send({ message: 'Task deleted' });
//       } else {
//         res.status(404).send({ message: 'Task not found' });
//       }
//     } else {
//       res.status(404).send({ message: 'List not found' });
//     }
//   } catch (error) {
//     console.error('Error deleting task:', error);
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });

// app.get('/categories', async (req, res) => {
//   console.log('Fetching categories');
//   try {
//     const categories = await Category.find();
//     res.send(categories);
//   } catch (error) {
//     console.error('Failed to fetch categories:', error);
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });

// app.post('/categories', async (req, res) => {
//   console.log('Adding a new category:', req.body);
//   try {
//     const newCategory = new Category(req.body);
//     await newCategory.save();
//     res.send(newCategory);
//   } catch (error) {
//     console.error('Failed to add category:', error);
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });

// app.delete('/categories/:id', async (req, res) => {
//   console.log('Deleting category with ID:', req.params.id);
//   try {
//     await Category.findByIdAndDelete(req.params.id);
//     res.send({ message: 'Category deleted' });
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

//---- file attachment fix
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');

// const app = express();
// const port = 3000;

// app.use(bodyParser.json({ limit: '50mb' }));

// // Configure CORS to allow requests from the frontend
// const corsOptions = {
//   origin: 'http://192.168.100.197:8081', // Adjust this URL to match where your frontend is running
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// // Ensure the uploads directory exists
// const fs = require('fs');
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// mongoose.connect('mongodb://localhost:27017/taskly', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch((err) => {
//   console.error('Failed to connect to MongoDB', err);
// });

// // Define your schemas and routes here

// const CategorySchema = new mongoose.Schema({
//   name: String,
//   color: String,
// });

// const TaskSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   dueDate: Date,
//   completed: Boolean,
//   files: [
//     {
//       uri: String,
//       name: String,
//       type: String,
//     },
//   ],
//   category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
// });

// const ListSchema = new mongoose.Schema({
//   name: String,
//   tasks: [TaskSchema],
// });

// const List = mongoose.model('List', ListSchema);
// const Category = mongoose.model('Category', CategorySchema);

// app.get('/lists', async (req, res) => {
//   console.log('Fetching lists');
//   const lists = await List.find();
//   res.send(lists);
// });

// app.post('/lists', async (req, res) => {
//   console.log('Creating a new list:', req.body);
//   const newList = new List(req.body);
//   await newList.save();
//   res.send(newList);
// });

// app.delete('/lists/:id', async (req, res) => {
//   console.log('Deleting list with ID:', req.params.id);
//   await List.findByIdAndDelete(req.params.id);
//   res.send({ message: 'List deleted' });
// });

// app.get('/tasks', async (req, res) => {
//   const { listId } = req.query;
//   console.log('Fetching tasks for list ID:', listId);
//   const list = await List.findById(listId).populate('tasks.category');
//   if (list) {
//     res.send(list.tasks);
//   } else {
//     res.status(404).send({ message: 'List not found' });
//   }
// });

// app.post('/tasks', async (req, res) => {
//   const { listId, task } = req.body;
//   console.log('Adding task to list ID:', listId, 'Task:', task);
//   const list = await List.findById(listId);
//   if (list) {
//     const newTask = {
//       ...task,
//       _id: new mongoose.Types.ObjectId(),
//     };
//     list.tasks.push(newTask);
//     await list.save();
//     res.send(newTask);
//   } else {
//     res.status(404).send({ message: 'List not found' });
//   }
// });

// app.put('/tasks/:listId/:taskId', async (req, res) => {
//   const { listId, taskId } = req.params;
//   console.log('Updating task with ID:', taskId, 'in list with ID:', listId);
//   const { name, description, dueDate, completed, files, category } = req.body;
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
//       await list.save();
//       const updatedList = await List.findById(listId).populate('tasks.category');
//       const updatedTask = updatedList.tasks.id(taskId);
//       res.send(updatedTask);
//     } else {
//       res.status(404).send({ message: 'Task not found' });
//     }
//   } else {
//     res.status(404).send({ message: 'List not found' });
//   }
// });

// app.post('/upload', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({ message: 'No file uploaded' });
//   }
//   res.send({
//     uri: `http://localhost:3000/uploads/${req.file.filename}`,
//     name: req.file.originalname,
//     type: req.file.mimetype,
//   });
// });

// app.delete('/tasks/:listId/:taskId', async (req, res) => {
//   const { listId, taskId } = req.params;
//   console.log(`Deleting task with ID: ${taskId} from list ID: ${listId}`);
//   try {
//     const list = await List.findById(listId);
//     if (list) {
//       const task = list.tasks.id(taskId);
//       if (task) {
//         task.remove();
//         await list.save();
//         res.send({ message: 'Task deleted' });
//       } else {
//         res.status(404).send({ message: 'Task not found' });
//       }
//     } else {
//       res.status(404).send({ message: 'List not found' });
//     }
//   } catch (error) {
//     console.error('Error deleting task:', error);
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });

// app.get('/categories', async (req, res) => {
//   console.log('Fetching categories');
//   try {
//     const categories = await Category.find();
//     res.send(categories);
//   } catch (error) {
//     console.error('Failed to fetch categories:', error);
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });

// app.post('/categories', async (req, res) => {
//   console.log('Adding a new category:', req.body);
//   try {
//     const newCategory = new Category(req.body);
//     await newCategory.save();
//     res.send(newCategory);
//   } catch (error) {
//     console.error('Failed to add category:', error);
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });

// app.delete('/categories/:id', async (req, res) => {
//   console.log('Deleting category with ID:', req.params.id);
//   try {
//     await Category.findByIdAndDelete(req.params.id);
//     res.send({ message: 'Category deleted' });
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

//------- description fix

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

// Configure CORS to allow requests from the frontend
const corsOptions = {
  origin: 'http://192.168.100.197:8081', // Adjust this URL to match where your frontend is running
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Ensure the uploads directory exists
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

// Define your schemas and routes here

const CategorySchema = new mongoose.Schema({
  name: String,
  color: String,
});

const TaskSchema = new mongoose.Schema({
  name: String,
  description: String,  // Make sure description is part of the schema
  dueDate: Date,
  completed: Boolean,
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
  console.log('Fetching lists');
  const lists = await List.find();
  res.send(lists);
});

app.post('/lists', async (req, res) => {
  console.log('Creating a new list:', req.body);
  const newList = new List(req.body);
  await newList.save();
  res.send(newList);
});

app.delete('/lists/:id', async (req, res) => {
  console.log('Deleting list with ID:', req.params.id);
  await List.findByIdAndDelete(req.params.id);
  res.send({ message: 'List deleted' });
});

app.get('/tasks', async (req, res) => {
  const { listId } = req.query;
  console.log('Fetching tasks for list ID:', listId);
  const list = await List.findById(listId).populate('tasks.category');
  if (list) {
    res.send(list.tasks);
  } else {
    res.status(404).send({ message: 'List not found' });
  }
});

app.post('/tasks', async (req, res) => {
  const { listId, task } = req.body;
  console.log('Adding task to list ID:', listId, 'Task:', task);
  const list = await List.findById(listId);
  if (list) {
    const newTask = {
      ...task,
      _id: new mongoose.Types.ObjectId(),
    };
    list.tasks.push(newTask);
    await list.save();
    res.send(newTask);
  } else {
    res.status(404).send({ message: 'List not found' });
  }
});

app.put('/tasks/:listId/:taskId', async (req, res) => {
  const { listId, taskId } = req.params;
  console.log('Updating task with ID:', taskId, 'in list with ID:', listId);
  const { name, description, dueDate, completed, files, category } = req.body;
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
      await list.save();
      const updatedList = await List.findById(listId).populate('tasks.category');
      const updatedTask = updatedList.tasks.id(taskId);
      res.send(updatedTask);
    } else {
      res.status(404).send({ message: 'Task not found' });
    }
  } else {
    res.status(404).send({ message: 'List not found' });
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
  console.log(`Deleting task with ID: ${taskId} from list ID: ${listId}`);
  try {
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
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.get('/categories', async (req, res) => {
  console.log('Fetching categories');
  try {
    const categories = await Category.find();
    res.send(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.post('/categories', async (req, res) => {
  console.log('Adding a new category:', req.body);
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.send(newCategory);
  } catch (error) {
    console.error('Failed to add category:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.delete('/categories/:id', async (req, res) => {
  console.log('Deleting category with ID:', req.params.id);
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.send({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
