const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

let isOccupied = false;

// Login page
app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"login.html"));
});

// Login
app.post("/login",(req,res)=>{

  const {username,password} = req.body;

  if(username==="gaurav" && password==="kakwan"){

    if(isOccupied){
      return res.json({success:false,msg:"User Limit Reached"});
    }

    isOccupied=true;
    return res.json({success:true});
  }

  res.json({success:false,msg:"Invalid Login"});
});

// Logout
app.post("/logout",(req,res)=>{
  isOccupied=false;
  res.json({success:true});
});

// Send mail
app.post("/send", async (req,res)=>{

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

      service:"gmail",

      auth:{
        user:gmail,
        pass:apppass
      }

    });

    let sent = 0;

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

  }catch(err){

    console.log(err);

    res.json({
      success:false,
      msg:"Email send failed"
    });
  }

});

app.listen(port,()=>{
  console.log("Server running on port "+port);
});
