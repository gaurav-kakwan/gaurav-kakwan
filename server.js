const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const dns = require("dns");

dns.setServers(["8.8.8.8","8.8.4.4"]);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

let isOccupied = false;

app.get('/', (req,res)=>{
res.sendFile(path.join(__dirname,'login.html'));
});

app.post('/login',(req,res)=>{

const {username,password}=req.body;

if(username==="gaurav" && password==="kakwan"){

if(isOccupied){
return res.json({success:false,msg:"User Limit Reached"});
}

isOccupied=true;
return res.json({success:true});

}

return res.json({success:false,msg:"Invalid Login"});
});

app.post('/logout',(req,res)=>{
isOccupied=false;
res.json({success:true});
});

app.post('/send', async (req,res)=>{

const {senderName,gmail,apppass,subject,message,to} = req.body;

if(!gmail || !apppass || !to){
return res.json({success:false,msg:"Missing fields"});
}

const recipients = to
.split(/[\n,]/)
.map(e=>e.trim())
.filter(e=>e);

if(recipients.length > 25){
return res.json({success:false,msg:"Max 25 recipients allowed"});
}

try{

const transporter = nodemailer.createTransport({

host:"smtp.gmail.com",
port:587,
secure:false,
requireTLS:true,

auth:{
user:gmail,
pass:apppass
},

connectionTimeout:30000,
greetingTimeout:30000,
socketTimeout:30000

});

let sent=0;

for(const email of recipients){

await transporter.sendMail({

from:`"${senderName}" <${gmail}>`,
to:email,
subject:subject,
text:message

});

sent++;

await new Promise(r=>setTimeout(r,2000));

}

res.json({success:true,sent:sent});

}catch(error){

console.log("MAIL ERROR:",error);

res.json({success:false,msg:error.message});

}

});

app.listen(port,()=>{
console.log("Server running on port "+port);
});
