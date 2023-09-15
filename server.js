const express = require("express");
const app = express();
const db = require("./models");
const dotenv = require("dotenv")
//middleware
dotenv.config()
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//routes
const userRoutes = require("./routes/user");
const communityRoutes = require("./routes/community");
const roleRoutes = require("./routes/role");
const memberRoutes = require("./routes/member");

app.use("/v1/auth", userRoutes);
app.use("/v1/community", communityRoutes);
app.use("/v1/role",roleRoutes);
app.use("/v1/member",memberRoutes);

//database
const PORT = process.env.PORT||5000;
db.sequelize.sync({force: false})
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`serverlistening on port ${PORT}`);
    })
}).catch((err)=>{
    console.log(err);
})