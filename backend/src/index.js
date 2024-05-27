

import { connectDB } from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({path: "./.env"});

import { app } from "./app.js";
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`server is listening at ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("something went wrong in database");
    });
