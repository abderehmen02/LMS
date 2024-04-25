import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
import { AttachmentForm } from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/attachment-form";
import formidable from "formidable"
import  fs from 'fs';


const sgMail = require('@sendgrid/mail');



sgMail.setApiKey(process.env.SEND_GRID_API_KEY);




export default async  function handler (req  : NextApiRequest , res : NextApiResponse){
console.log("getting a mail request")
const form = formidable({})
const [fields , files] = await form.parse(req)
// const file = files.file
console.log("fields" , fields.file)
const body = req.body
console.log("body" , body)
// console.log( "fs" ,  fs.readFile)

// const blobData = await req.blob()
// const arrayBuffer = await  blobData.arrayBuffer()



// const buffer = req.file.buffer
// console.log("buffer" ,buffer)

// const user = await currentUser()
// const userEmail = user?.emailAddresses[0].emailAddress
// if(userEmail){
  
    const msg = {
        to: "abderehmen02@gmail.com" ,
        from: "roamiocityexplorer@gmail.com", 
        subject: ` Certaficate`,
        text: `you can download the pdf certaficate from here`,
        html: `you can download the pdf certaficate from here`,
        attachments: [
            {
              content: fields.file,
              filename: "certificat.pdf",
              encoding: "base64"            }
          ]
      };
      console.log("sending the message" )
      sgMail.send(msg)
    .then(() => {}, (error : any)=> {
    console.error( "error when sending email" , error);
    
    if (error.response) {
      console.error(error.response.body)
    }
    });
    
// }
res.json({done: true })

}


export const config = {
    api: {
        bodyParser: false
    }
}