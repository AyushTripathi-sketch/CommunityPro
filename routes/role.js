const db = require("../models")
const Role = db.role;
const {Snowflake} = require("@theinternetfolks/snowflake")
const router = require("express").Router();
const { body,validationResult } = require("express-validator");

//create a role
router.post('/',
    body("name","Name should be at least 2 characters."),
    async(req,res)=>{
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            return res.status(400).json({status:false,errors:errs.array()});
        }
        try{
            const name = req.body.name;
            const id = Snowflake.generate();
            const role = await Role.create({id,name});

            return res.status(200).json({
                status: true,
                content:{
                    data:role,
                }
            });
        } catch(errs){
            return res.status(500).json({status:false, message:errs.message})
        }
    }
);

//get all roles
router.get('/',async(req,res)=>{
    try{
        let limit = 10;
        let page = Number(req.query.page?req.query.page:1);
        let offset = 0 + (page - 1) * limit;

        const roles = await Role.findAndCountAll({limit:limit,offset:offset});
        
        return res.status(200).json({
            status:true,
            content:{
                meta:{
                    total: roles.count,
                    pages: Math.ceil(roles.count/limit),
                    page: page
                },
                data:roles.rows
            }
        });
    } catch(errs){
        return res.status(500).json({status:false, message:errs.message})
    }
})

module.exports = router;