
const express            = require('express');
const profilerouter      = express.Router();
const profilecontroller  = require('../controllers/profilecontroller.js');
const passwordcontroller = require('../controllers/passwordcontroller.js');  
profilerouter.get('/profile',  profilecontroller.postprofile);
profilerouter.get('/orders',  profilecontroller.postorder);
profilerouter.get('/profile/edit',profilecontroller.geteditprofile);
profilerouter.post('/profile/edit', profilecontroller.posteditprofile);
profilerouter.get('/settings', profilecontroller.settings);

profilerouter.get('/changepassword', passwordcontroller.getchangepassword);
profilerouter.post('/changepassword/old', passwordcontroller.changebyoldpassword);  
profilerouter.post('/changepassword/sendotp',  passwordcontroller.sendotp);              
profilerouter.post('/changepassword/verifyotp',  passwordcontroller.verifyotp);            


module.exports=profilerouter;
