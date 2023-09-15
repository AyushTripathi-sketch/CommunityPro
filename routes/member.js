const db = require("../models")
const Community = db.community;
const Member = db.member;
const Role = db.role;
const User = db.user;
const {Snowflake} = require("@theinternetfolks/snowflake")
const router = require("express").Router();
const { body,validationResult } = require("express-validator");
const auth = require('../middleware/auth');

//add a member to the community if the looged in user is owner
router.post('/',auth,
    body("community","Id of the community is required"),
    body("user","Id of the user is required"),
    body("role","Id of the role is required"),
    async(req,res)=>{
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            return res.status(400).json({status:false,errors: errs.array()});
        }

        try{
            
            const community = await Community.findOne({where:{id:req.body.community}});
            if(!community){
                return res.status(400).json({status:false,message:"Community not found."})
            }
            
            if(req.user.id != community.owner){
                return res.status(400).json({status:false,message:"You are not authorized to perform this action."})
            }
            
            const role = await Role.findOne({where:{id:req.body.role}});
            if(!role){
                return res.status(400).json({status:false,message:"Role not found."})
            }

            const user = await User.findOne({where:{id:req.body.user}});
            if(!user){
                return res.status(400).json({status:false,message:"User not found."})
            }

            let member = await Member.findOne({where:{community:req.body.community, user:req.body.user}});
            if(member){
                return res.status(400).json({status:false,message:"User is already added in the community."})
            }

            const id = Snowflake.generate();
            member = await Member.create({
                id,
                community: req.body.community,
                user: req.body.user,
                role: req.body.role
            })

            return res.status(200).json({
                status: true,
                content:{
                    data:member,
                }
            });

        } catch(errs){
            return res.status(500).json({status:false,message:errs.message});
        }
    }
)

//delete a member if the logged in user is Community Admin or Community Moderator
router.delete('/:id',auth, async(req,res)=>{
    try{
        let member = await Member.findOne({where:{id:req.params.id}});
        if(!member){
            return res.status(400).json({status:false, errors:{message:"Member Not Found"}});
        }
        let signedmemberroles = await Member.findAll({
            where:{user:req.user.id},
            include:[
                {model: Role, as:'roles', attributes:['id','name']},
            ],
            attributes:['community']
        });
        
        let flag = false;
        signedmemberroles.forEach((element) => {
            if((element.community==member.community) && (element.roles.name=="Community Admin" || element.roles.name=="Community Moderator")){
                flag=true;
                return
            }
        });
        if (flag){
            await member.destroy();
            return res.status(200).json({status:true});
        }
        return res.status(400).json({status:false, errors:{message:"Not Allowed Access"}});

    } catch(errs){
        return res.status(500).json({status:false,message:errs.message});
    }
})

module.exports=router;