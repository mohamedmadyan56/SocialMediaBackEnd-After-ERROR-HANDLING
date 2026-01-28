const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoute = require("./routes/users");
const authRoute = require("./routes/auths");
const postRoute = require("./routes/posts");
const globalErrorHandler = require('./Handlers/errorHandler');


process.on('uncaughtException',(err)=>{
  console.log('UNCAUGHT EXCEPTION SHUTTING DOWN ...');
  console.log(err.name,err.message);
  process.exit(1);
  
  
})





dotenv.config();
//connect to mongodb
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB ✅"))
  .catch((err) => console.log("Error connecting to MongoDB: ", err));

//Middleware

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/users",userRoute);
app.use("/api/auths",authRoute);
app.use("/api/posts",postRoute);






const server =app.listen(8800,()=>{
    console.log("Backend server is running .. !");
    
})


process.on('unhandledRejection',(err)=>{
  console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(()=>{
      process.exit(1);
    })
  
})
app.use(globalErrorHandler);
