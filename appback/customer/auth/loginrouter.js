const express = require('express');
const loginrouter = express.Router();
const logincontroller = require('./logincontroller.js');
const changepwcontroller = require('./changepwcontroller.js'); 

loginrouter.post('/login', logincontroller.postLogin);
loginrouter.post('/logout', logincontroller.postLogout);
loginrouter.post('/signup', logincontroller.signupuser);

loginrouter.post('/sendotp', logincontroller.sendotp);
loginrouter.post('/verifyotp', logincontroller.verifyotp);

loginrouter.post('/changepassword/sendotp',  changepwcontroller.sendChangePasswordOTP);
loginrouter.post('/changepassword/verifyotp', changepwcontroller.verifyChangePasswordOTP);
loginrouter.post('/changepassword/old',       changepwcontroller.changePasswordWithOld);

loginrouter.get('/session', logincontroller.getSession);

module.exports = loginrouter;
