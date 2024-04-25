import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer"
import formidable from "formidable";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "abderehmen02@gmail.com",
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
  });

export default async  function handler (req  : NextApiRequest , res : NextApiResponse){
    try {
    const form = formidable({})
    const [fields , files] = await form.parse(req)
    
console.log("sending mail")
console.log("files" , typeof fields.file)
const response = await transporter.sendMail({
    from : "abderehmen02@gmail.com" ,
    to : "rahimoco@gmail.com" ,
    subject : "certaficate" ,
    text : "see the attached certaficate" , 
    html : "<p>please see the attached certaficate</p>" , 
    attachments : [{
        content : fields.file as string ,
        filename : "certaficate.pdf" , 
        encoding : "base64" 

    }]
})
console.log("response" , response)
res.status(200).json({done : true})}
catch(err){
    console.log("errr" , err)
}
}



export const config = {
    api: {
        bodyParser: false
    }
}