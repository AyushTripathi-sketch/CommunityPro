const db = require("../models")
const Community = db.community;
const Member = db.member;
const Role = db.role;
const User = db.user;
const {Snowflake} = require("@theinternetfolks/snowflake")
const router = require("express").Router();
const { body,validationResult } = require("express-validator");
const auth = require('../middleware/auth');

//create community 
router.post('/',auth,
    body("name","Name should be at least 2 characters.").isLength({min: 2}),
    async(req,res)=>{
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            return res.status(400).json({status:false,errors: errs.array()});
        }
        try{
            const name = req.body.name;
            let slug= name.toLowerCase();
            const owner = req.user.id;
            const id = Snowflake.generate();
            const community = await Community.create({id,name,slug,owner});

            const role = await Role.findOne({where:{name:"Community Admin"}})

            const memberId = Snowflake.generate();
            await Member.create({id:memberId,user:owner,community:id,role:role.id});

            return res.status(200).json({
                status: true,
                content:{
                    data:community,
                }
            });

        } catch(errs){
            res.status(500).json({status:false,message:errs.message});
        } 

    }
)

//get all communities
router.get('/',auth,async(req,res)=>{
    try{
        let limit = 10;
        let page = Number(req.query.page?req.query.page:1);
        let offset = 0 + (page - 1) * limit;
        const communities = await Community.findAndCountAll({
            include:[
                {
                    model:User,
                    attributes:['id','name'],
                    as:'communityowner'
                }
            ],
            offset:offset,
            limit:limit,
            attributes:{exclude:['owner']}
        });
        return res.status(200).json({
            status:true,
            content:{
                meta:{
                    total: communities.count,
                    pages: Math.ceil(communities.count/limit),
                    page: page
                },
                data:communities.rows
            }
        });
    }catch(errs){
        return res.status(500).json({status:false,message:errs.message});
    }
})

//get all members of a community their role and user details
router.get('/:id/members',async(req,res)=>{
    try{
        let limit = 10;
        let page = Number(req.query.page?req.query.page:1);
        let offset = 0 + (page - 1) * limit;

        const data = await Member.findAndCountAll({
            where:{community:req.params.id},
            include:[
                {model: Role, as:'roles', attributes:['id','name']},
                {model: User, as:'users', attributes:['id','name']}
            ],
            attributes:['id','community','createdAt'],
            offset:offset,
            limit:limit
        })

        return res.status(200).json({
            status:true,
            content:{
                meta:{
                    total: data.count,
                    pages: Math.ceil(data.count/limit),
                    page: page
                },
                data:data.rows
            }
        });
    } catch(errs){
        return res.status(500).json({status:false,message:errs.message});
    }
})

//get all communities that loggedin user is owner of
router.get('/me/owner',auth,async(req,res)=>{
    try{
        let limit = 10;
        let page = Number(req.query.page?req.query.page:1);
        let offset = 0 + (page - 1) * limit;
        const data = await Community.findAndCountAll({where:{owner:req.user.id}, offset:offset, limit:limit});

        return res.status(200).json({
            status:true,
            content:{
                meta:{
                    total: data.count,
                    pages: Math.ceil(data.count/limit),
                    page: page
                },
                data:data.rows
            }
        });

    } catch(errs){
        return res.status(500).json({status:false,message:errs.message});
    }
})

//get all communities and their owner details that logged in user is member of
router.get('/me/member',auth,async(req,res)=>{
    try{
        let limit = 10;
        let page = Number(req.query.page?req.query.page:1);
        let offset = 0 + (page - 1) * limit;
        const data = await User.findAndCountAll({
            where:{id:req.user.id},
            include:[
                {
                    model: Community,
                    as:'communities',
                    include:[
                        {
                            model:User,
                            attributes:['id','name'],
                            as:'communityowner'
                        }
                    ],
                    through: {
                        attributes: []
                    },
                }
            ],
            offset:offset,
            limit:limit,
            attributes:[]
        });

        return res.status(200).json({
            status:true,
            content:{
                meta:{
                    total: data.count,
                    pages: Math.ceil(data.count/limit),
                    page: page
                },
                data:data.rows[0].communities
            }
        });

    } catch(errs){
        return res.status(500).json({status:false,message:errs.message});
    }
})

module.exports = router;