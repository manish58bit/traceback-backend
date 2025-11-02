const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");
const userRouter = require("./routes/userRouter.js");
const postRouter = require("./routes/postRouter.js");
dotenv.config();
const app = express();
connectDB();

app.use(express.json()); // to accept json data
app.use(cors());

// Serve static files from storage directory
app.use("/storage", express.static(path.join(__dirname, "..", "storage")));

app.use("/user", userRouter);
app.use("/post", postRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is Listening at: ${process.env.port}`.cyan.italic);
});
