const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectToDB = require("./db/db");
const userRoutes = require("./routes/user.routes");
const captionRoutes = require("./routes/caption.routes");
const cookieParser = require("cookie-parser");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

// ✅ Correct CORS middleware
app.use(
  cors({
    origin: [
      "https://uber-clone-frontend-eta.vercel.app", // ✅ new domain
      "https://uber-clone-frontend-mnq7hbgth-yash-barbates-projects.vercel.app", // old domain (optional)
      "http://localhost:5173", // for local dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to DB
connectToDB();

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Hello Brother");
});

app.use("/users", userRoutes);
app.use("/captions", captionRoutes);
app.use("/maps", mapsRoutes);
app.use("/rides", rideRoutes);

module.exports = app;
