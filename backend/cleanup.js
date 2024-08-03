const mongoose = require('mongoose');
const List = require('./models/List'); // Adjust the path as needed

mongoose.connect('mongodb://localhost:27017/taskly', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cleanupNullTasks = async () => {
  const lists = await List.find();
  lists.forEach(async (list) => {
    list.tasks = list.tasks.filter(task => task !== null);
    await list.save();
  });
  console.log('Cleanup completed');
};

cleanupNullTasks().then(() => mongoose.disconnect());
