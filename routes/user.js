const db = require("../models")
const User = db.user;
const {Snowflake} = require("@theinternetfolks/snowflake")
const router = require("express").Router();
const { body,validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require('../middleware/auth')

//register user using name, email and password
router.post("/signup",
    body("name","Name should be at least 2 characters.").isLength({min: 2}),
    body("email","Enter a valid email").isEmail(),
    body("password","Password should be at least 6 characters.").isLength({min: 6}),
    async(req,res)=>{
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            return res.status(400).json({status:false,errors: errs.array()})
        }
        try {
            let {email, password} = req.body;
            console.log(User);
            let user = await User.findOne({where:{email:email}});
            if(user){
                return res.status(400).json({status:false,message: "User with this email address already exists."});
            }

            const id = Snowflake.generate();

            const salt = await bcrypt.genSalt(10); // 10 rounds of salts
            password = await bcrypt.hash(password,salt);
            
            user = await User.create({id,...req.body,password})
            delete user.dataValues.password;
            
            const token = jwt.sign({user}, process.env.JWT_SECRET, {
                expiresIn: "6hr",
            });

            return res.status(200).json({
                status: true,
                content:{
                    data:user,
                    meta:{access_token:token}
                }
            });

        } catch (errors) {
            console.log(errors);
            return res.status(400).json({msg:errors.message});
        }
    }
)

//log in user using email password
router.post("/signin",
    body("email","Please provide a valid email").isEmail(),
    async(req,res)=>{
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            return res.status(400).json({status:false,errors: errs.array()})
        }
        const {email, password} = req.body;
        try {
            let user = await User.findOne({where:{email:email}});
            if(!user){
                return res.status(404).json({status:false,message:"The credentials you provided are invalid."});
            }
            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch){
                return res.status(400).json({status:false,message:"The credentials you provided are invalid."});
            }
            delete user.dataValues.password;

            const token = jwt.sign({user}, process.env.JWT_SECRET, {
                expiresIn: "6hr",
            });

            return res.status(200).json({
                status: true,
                content:{
                    data:user,
                    meta:{access_token:token}
                }
            });

        } catch (errors) {
            return res.status(400).json({msg:errors.message});
        }
    }
)

//get details of logged in user
router.get('/me',auth,(req,res)=>{
    try {
        return res.status(200).json({
            status: true,
            content:{
                data:req.user,
            }
        });
    } catch (error) {
        return res.status(500).json({msg:error.message});
    }
})
module.exports = router;