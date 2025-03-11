const express=require('express');
const userController=require('../controllers/userController');
const router=express.Router();
const authenticate=require('../middleware/authMiddleware')
router.post('/register',userController.register);
router.post('/login',userController.login);
router.post('/updateLocation',userController.updateLocation);
router.get('/getAllUser',userController.getAllUser);
router.get('/profile',authenticate,(req,res)=>{
    res.status(200).json({message:"proted route"});
})
module.exports=router;