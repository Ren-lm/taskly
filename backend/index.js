// //Backend/index.js
// const express = require("express");
// const { google } = require("googleapis");
// const bodyParser = require("body-parser");
// const fs = require("fs");
// const path = require("path");
// const cors = require("cors");
// const multer = require("multer");
// const mongoose = require("mongoose");
// const authRoutes = require("./routes/auth");
// const { authenticateToken } = require("./utils");

// // Initialize Express app
// const app = express();
// const port = 3000;

// // Set up bodyParser to handle JSON requests with a larger payload
// app.use(bodyParser.json({ limit: "50mb" }));

// // Configure CORS to allow requests from any origin
// const corsOptions = {
//   origin: "*", // Adjust this URL to match where your frontend is running
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

// // Use authentication routes
// app.use("/api/auth", authRoutes);

// // Load Google API credentials
// let credentials;
// try {
//   credentials = JSON.parse(fs.readFileSync("credentials.json"));
// } catch (error) {
//   console.error("Error loading credentials.json:", error);
//   process.exit(1); // Exit if credentials are not found
// }

// // Set up OAuth2 client for Google APIs
// const { client_secret, client_id } = credentials.web;
// const redirect_uris = credentials.web.redirect_uris || [
//   "http://localhost:3000/auth/google/callback",
// ];
// const oAuth2Client = new google.auth.OAuth2(
//   client_id,
//   client_secret,
//   redirect_uris[0]
// );

// // Configure Multer for file uploads such as destination and filename
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// // Connect to MongoDB database
// mongoose
//   .connect("mongodb://localhost:27017/taskly", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.error("Failed to connect to MongoDB", err);
//   });

// // Define Mongoose schemas for categories, files, tasks, and lists
// const CategorySchema = new mongoose.Schema({
//   name: String,
//   color: String,
// });

// const FileSchema = new mongoose.Schema({
//   uri: String,
//   name: String,
//   type: String,
// });

// const TaskSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   dueDate: Date,
//   completed: Boolean,
//   important: Boolean,
//   files: [FileSchema],
//   category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
// });

// const ListSchema = new mongoose.Schema({
//   name: String,
//   tasks: [TaskSchema],
//   uid: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
// });

// // Create Mongoose models based on the schemas
// const List = mongoose.model("List", ListSchema);
// const Category = mongoose.model("Category", CategorySchema);

// // Route to get all lists for the authenticated user
// app.get("/lists", authenticateToken, async (req, res) => {
//   const lists = await List.find({
//     uid: req?.user?.userId,
//   });
//   res.send(lists);
// });

// // Route to create a new list
// app.post("/lists", async (req, res) => {
//   const newList = new List(req.body);
//   await newList.save();
//   res.send(newList);
// });

// // Route to delete a list by its ID
// app.delete("/lists/:id", async (req, res) => {
//   await List.findByIdAndDelete(req.params.id);
//   res.send({ message: "List deleted" });
// });

// // Route to get tasks for a specific list
// app.get("/tasks", async (req, res) => {
//   const { listId } = req.query;
//   const list = await List.findById(listId).populate("tasks.category");
//   if (list) {
//     res.send(list.tasks);
//   } else {
//     res.status(404).send({ message: "List not found" });
//   }
// });

// // Route to create a new task in a specific list
// app.post("/tasks", async (req, res) => {
//   const { listId, task } = req.body;
//   const list = await List.findById(listId);
//   if (list) {
//     const newTask = {
//       ...task,
//       important: task.important || false, // Set important field, defaulting to false if not provided
//       _id: new mongoose.Types.ObjectId(),
//     };
//     list.tasks.push(newTask);
//     await list.save();
//     res.send(newTask);
//   } else {
//     res.status(404).send({ message: "List not found" });
//   }
// });

// // Route to update a specific task in a specific list
// app.put("/tasks/:listId/:taskId", async (req, res) => {
//   const { listId, taskId } = req.params;
//   const { name, description, dueDate, completed, files, category, important } =
//     req.body;

//   console.log(`Received update request for task ${taskId} in list ${listId}`);
//   console.log("Update details:", req.body); // Log the incoming task details

//   try {
//     const list = await List.findById(listId);
//     if (list) {
//       const task = list.tasks.id(taskId);
//       if (task) {
//         // Update task details
//         task.name = name;
//         task.description = description;
//         task.dueDate = dueDate;
//         task.completed = completed;
//         task.files = files;
//         task.category = category;
//         task.important = important; // Ensure the important field is updated

//         await list.save();
//         console.log("Task updated successfully:", task); // Log the task after update
//         res.send(task);
//       } else {
//         res.status(404).send({ message: "Task not found" });
//       }
//     } else {
//       res.status(404).send({ message: "List not found" });
//     }
//   } catch (error) {
//     console.error("Error updating task:", error);
//     res
//       .status(500)
//       .send({ message: "Internal Server Error", error: error.message });
//   }
// });

// // Route to handle file uploads
// app.post("/upload", upload.single("file"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send({ message: "No file uploaded" });
//     }
//     return res.send({
//       uri: `http://localhost:3000/uploads/${req.file.filename}`,
//       name: req.file.originalname,
//       type: req.file.mimetype,
//     });
//   } catch (ex) {
//     console.log(ex);
//   }
// });

// // Route to delete a task by its ID from a specific list
// app.delete("/tasks/:listId/:taskId", async (req, res) => {
//   const { listId, taskId } = req.params;

//   try {
//     await List.findOneAndUpdate(
//       {
//         _id: listId,
//       },
//       {
//         $pull: {
//           tasks: {
//             _id: taskId,
//           },
//         },
//       },
//       {
//         new: true,
//       }
//     );
//     return res.send({ message: "Task deleted" });
//   } catch (ex) {
//     res.status(404).send({ message: "Error" });
//   }
// });

// // Route to get all categories
// app.get("/categories", async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.send(categories);
//   } catch (error) {
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });

// // Route to create a new category
// app.post("/categories", async (req, res) => {
//   try {
//     const newCategory = new Category(req.body);
//     await newCategory.save();
//     res.send(newCategory);
//   } catch (error) {
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });

// // Route to delete a category by its ID
// app.delete("/categories/:id", async (req, res) => {
//   try {
//     await Category.findByIdAndDelete(req.params.id);
//     res.send({ message: "Category deleted" });
//   } catch (error) {
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });

// // Route to get tasks due today for the authenticated user
// app.get("/tasks/today", authenticateToken, async (req, res) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);

//   try {
//     const lists = await List.find({
//       "tasks.dueDate": { $gte: today, $lt: tomorrow },
//       uid: req?.user?.userId,
//     }).populate("tasks.category");

//     const tasksDueToday = lists.reduce((acc, list) => {
//       const tasks = list.tasks.filter((task) => {
//         if (!task.dueDate) return false;
//         const dueDate = new Date(task.dueDate);
//         return dueDate >= today && dueDate < tomorrow;
//       });
//       return acc.concat(
//         tasks.map((task) => ({ ...task.toObject(), listId: list._id }))
//       );
//     }, []);

//     res.send(tasksDueToday);
//   } catch (error) {
//     res
//       .status(500)
//       .send({ message: "Internal Server Error", error: error.message });
//   }
// });

// // Route to get important tasks for the authenticated user
// app.get("/tasks/important", authenticateToken, async (req, res) => {
//   console.log("Fetching important tasks...");

//   try {
//     const lists = await List.find({
//       "tasks.important": true,
//       uid: req?.user?.userId,
//     }).populate("tasks.category");

//     const importantTasks = lists.reduce((acc, list) => {
//       const tasks = list.tasks.filter((task) => task.important);
//       const tasksWithListId = tasks.map((task) => {
//         const taskWithListId = {
//           ...task.toObject(),
//           listId: list._id, // Add listId to each task
//         };
//         console.log("Task with listId:", taskWithListId); // Log the task with listId
//         return taskWithListId;
//       });
//       return acc.concat(tasksWithListId);
//     }, []);

//     res.send(importantTasks);
//   } catch (error) {
//     console.error("Error fetching important tasks:", error);
//     res
//       .status(500)
//       .send({ message: "Internal Server Error", error: error.message });
//   }
// });

// // Serve the uploaded files as static assets
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Middleware
// app.use(bodyParser.json());

// // Google Calendar API Setup
// const SCOPES = ["https://www.googleapis.com/auth/calendar"];
// const TOKEN_PATH = "token.json";

// // Route to get Google authentication URL
// app.get("/google-auth-url", (req, res) => {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: SCOPES,
//   });
//   res.send({ authUrl });
// });

// // Callback route for Google OAuth
// app.get("/auth/google/callback", async (req, res) => {
//   const code = req.query.code;
//   const { tokens } = await oAuth2Client.getToken(code);
//   oAuth2Client.setCredentials(tokens);
//   fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
//   res.send("Google Calendar setup successful!");
// });

// // Route to create a Google Calendar event
// app.post("/create-event", async (req, res) => {
//   const { summary, description, location, startDateTime, endDateTime } =
//     req.body;

//   const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

//   const event = {
//     summary,
//     location,
//     description,
//     start: {
//       dateTime: startDateTime,
//       timeZone: "America/Los_Angeles",
//     },
//     end: {
//       dateTime: endDateTime,
//       timeZone: "America/Los_Angeles",
//     },
//   };

//   try {
//     const eventResponse = await calendar.events.insert({
//       calendarId: "primary",
//       resource: event,
//     });
//     res.send({ eventUrl: eventResponse.data.htmlLink });
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });


const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const { authenticateToken } = require("./utils");

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: "50mb" }));

const corsOptions = {
  origin: "*", // Adjust this URL to match where your frontend is running
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Use auth routes
app.use("/api/auth", authRoutes);

// Load Google API credentials and setup OAuth2 client
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync("credentials.json"));
} catch (error) {
  console.error("Error loading credentials.json:", error);
  process.exit(1);
}

const { client_secret, client_id } = credentials.web;
const redirect_uris = credentials.web.redirect_uris || [
  "http://localhost:3000/auth/google/callback",
];
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Function to refresh the token if expired
async function checkAndRefreshToken() {
  try {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));

    // Check if the access token is expired
    if (oAuth2Client.credentials.expiry_date <= Date.now()) {
      // Refresh the token if expired
      const tokenResponse = await oAuth2Client.getAccessToken();
      if (tokenResponse.token) {
        console.log("Token refreshed successfully");
        oAuth2Client.setCredentials(tokenResponse.token);
      }
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}

// Call the function to check and refresh the token
checkAndRefreshToken();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

mongoose
  .connect("mongodb://localhost:27017/taskly", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const CategorySchema = new mongoose.Schema({
  name: String,
  color: String,
});

const FileSchema = new mongoose.Schema({
  uri: String,
  name: String,
  type: String,
});

const TaskSchema = new mongoose.Schema({
  name: String,
  description: String,
  dueDate: Date,
  completed: Boolean,
  important: Boolean,
  files: [FileSchema],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

const ListSchema = new mongoose.Schema({
  name: String,
  tasks: [TaskSchema],
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const List = mongoose.model("List", ListSchema);
const Category = mongoose.model("Category", CategorySchema);

app.get("/lists", authenticateToken, async (req, res) => {
  const lists = await List.find({
    uid: req?.user?.userId,
  });
  res.send(lists);
});

app.post("/lists", async (req, res) => {
  const newList = new List(req.body);
  await newList.save();
  res.send(newList);
});

app.delete("/lists/:id", async (req, res) => {
  await List.findByIdAndDelete(req.params.id);
  res.send({ message: "List deleted" });
});

app.get("/tasks", async (req, res) => {
  const { listId } = req.query;
  const list = await List.findById(listId).populate("tasks.category");
  if (list) {
    res.send(list.tasks);
  } else {
    res.status(404).send({ message: "List not found" });
  }
});

app.post("/tasks", async (req, res) => {
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
    res.status(404).send({ message: "List not found" });
  }
});

app.put("/tasks/:listId/:taskId", async (req, res) => {
  const { listId, taskId } = req.params;
  const { name, description, dueDate, completed, files, category, important } =
    req.body;

  console.log(`Received update request for task ${taskId} in list ${listId}`);
  console.log("Update details:", req.body); // Log the incoming task details

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
        console.log("Task updated successfully:", task); // Log the task after update
        res.send(task);
      } else {
        res.status(404).send({ message: "Task not found" });
      }
    } else {
      res.status(404).send({ message: "List not found" });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }
    return res.send({
      uri: `http://localhost:3000/uploads/${req.file.filename}`,
      name: req.file.originalname,
      type: req.file.mimetype,
    });
  } catch (ex) {
    console.log(ex);
  }
});

app.delete("/tasks/:listId/:taskId", async (req, res) => {
  const { listId, taskId } = req.params;

  try {
    await List.findOneAndUpdate(
      {
        _id: listId,
      },
      {
        $pull: {
          tasks: {
            _id: taskId,
          },
        },
      },
      {
        new: true,
      }
    );
    return res.send({ message: "Task deleted" });
  } catch (ex) {
    res.status(404).send({ message: "Error" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.send(categories);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/categories", async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.send(newCategory);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.delete("/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.send({ message: "Category deleted" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.get("/tasks/today", authenticateToken, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const lists = await List.find({
      "tasks.dueDate": { $gte: today, $lt: tomorrow },
      uid: req?.user?.userId,
    }).populate("tasks.category");

    const tasksDueToday = lists.reduce((acc, list) => {
      const tasks = list.tasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      });
      return acc.concat(
        tasks.map((task) => ({ ...task.toObject(), listId: list._id }))
      );
    }, []);

    res.send(tasksDueToday);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

app.get("/tasks/important", authenticateToken, async (req, res) => {
  console.log("Fetching important tasks...");

  try {
    const lists = await List.find({
      "tasks.important": true,
      uid: req?.user?.userId,
    }).populate("tasks.category");

    const importantTasks = lists.reduce((acc, list) => {
      const tasks = list.tasks.filter((task) => task.important);
      const tasksWithListId = tasks.map((task) => {
        const taskWithListId = {
          ...task.toObject(),
          listId: list._id, // Add listId to each task
        };
        console.log("Task with listId:", taskWithListId); // Log the task with listId
        return taskWithListId;
      });
      return acc.concat(tasksWithListId);
    }, []);

    res.send(importantTasks);
  } catch (error) {
    console.error("Error fetching important tasks:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Google Calendar API Setup
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "token.json";

// Route to get Google authentication URL
app.get("/google-auth-url", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.send({ authUrl });
});

// Callback route for Google OAuth
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  res.send("Google Calendar setup successful!");
});

// Route to create an event
app.post("/create-event", async (req, res) => {
  const { summary, description, location, startDateTime, endDateTime } = req.body;

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const event = {
    summary,
    location,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: endDateTime,
      timeZone: "America/Los_Angeles",
    },
  };

  try {
    console.log("Inserting event:", event); // Log the event details
    const eventResponse = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    console.log("Event created successfully:", eventResponse.data); // Log the response data
    res.send({ eventUrl: eventResponse.data.htmlLink });
  } catch (error) {
    console.error("Error creating event:", error); // Log the error
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
