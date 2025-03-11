const userService=require('../services/userService');
exports.register=async(req,res)=>{
    try{
        const user=await userService.register(req.body);
        res.status(201).json(user);
    }
    catch(error)
    {
        res.status(400).json({message:error.message});
    }
};
exports.login=async(req,res)=>{
   try{
     const token=await userService.login((req.body));
     res.status(201).json(token);
   }catch(error){
    res.status(400).json({message:error.message});
   }
}
exports.updateLocation=async(req,res)=>{
    try{
      console.log(req.body);
      const response=await userService.updateLocation(req.body);
      res.status(201).json(response);
    }
    catch(error){
        res.status(400).json({message:error.message});
    }
}
exports.getAllUser=async(req,res)=>{
    try{
      const response=await userService.getAllUser();
      res.status(201).json(response);
    }
    catch(error){
        res.status(400).json({message:error.message});
    }
}

