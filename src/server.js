require('dotenv').config();
import express from "express";
import configViewEngine from "./config/viewEngine";
import initRoutes from "./routes/web";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import passPort from "passport";
import session from "./config/session";


let app = express();
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//config session
session.configSession(app);

configViewEngine(app);

// config Passportjs
app.use(passPort.initialize());
app.use(passPort.session());

initRoutes(app);

let port = process.env.PORT;
app.listen(port || 8080, () => console.log(`Doctors care app is running on port ${port}!`));
