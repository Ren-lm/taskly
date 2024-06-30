const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/taskly', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TaskSchema = new mongoose.Schema({
  name: String,
  description: String,
  dueDate: Date,
  completed: Boolean,
  file: String,
});

const ListSchema = new mongoose.Schema({
  name: String,
  tasks: [TaskSchema],
});

const List = mongoose.model('List', ListSchema);

app.get('/lists', async (req, res) => {
  console.log('Fetching lists'); // Debugging log
  const lists = await List.find();
  res.send(lists);
});

app.post('/lists', async (req, res) => {
  console.log('Creating a new list:', req.body); // Debugging log
  const newList = new List(req.body);
  await newList.save();
  res.send(newList);
});

app.delete('/lists/:id', async (req, res) => {
  console.log('Deleting list with ID:', req.params.id); // Debugging log
  await List.findByIdAndDelete(req.params.id);
  res.send({ message: 'List deleted' });
});

app.get('/tasks', async (req, res) => {
  const { listId } = req.query;
  console.log('Fetching tasks for list ID:', listId); // Debugging log
  const list = await List.findById(listId);
  if (list) {
    res.send(list.tasks);
  } else {
    res.status(404).send({ message: 'List not found' });
  }
});

app.post('/tasks', async (req, res) => {
  const { listId, task } = req.body;
  console.log('Adding task to list ID:', listId, 'Task:', task); // Debugging log
  const list = await List.findById(listId);
  if (list) {
    const newTask = {
      ...task,
      _id: new mongoose.Types.ObjectId(), // Ensure _id is generated for the task
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
  console.log('Updating task with ID:', taskId, 'in list with ID:', listId); // Debugging log
  const { name, description, dueDate, completed, file } = req.body;
  const list = await List.findById(listId);
  if (list) {
    const task = list.tasks.id(taskId);
    if (task) {
      task.name = name;
      task.description = description;
      task.dueDate = dueDate;
      task.completed = completed;
      task.file = file;
      await list.save();
      res.send(task);
    } else {
      res.status(404).send({ message: 'Task not found' });
    }
  } else {
    res.status(404).send({ message: 'List not found' });
  }
});

app.delete('/tasks/:listId/:taskId', async (req, res) => {
  const { listId, taskId } = req.params;
  console.log(`Deleting task with ID: ${taskId} from list ID: ${listId}`); // Debugging log
  const list = await List.findById(listId);
  if (list) {
    const task = list.tasks.id(taskId);
    if (task) {
      task.remove();
      await list.save();
      res.send(list.tasks);
    } else {
      res.status(404).send({ message: 'Task not found' });
    }
  } else {
    res.status(404).send({ message: 'List not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
