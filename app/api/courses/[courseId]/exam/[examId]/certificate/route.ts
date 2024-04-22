import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
const sgMail = require('@sendgrid/mail');

import { db } from "@/lib/db";


sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

export async function POST(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { userId   } = auth();
    const user = await currentUser()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const exam = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        course: true,
      },
    });

    if (!exam) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const certificate = await db.certificate.create({
      data: {
        examId: params.examId,
        courseTitle: exam.course.title,
      },
    });
    const userEmail = user?.emailAddresses[0]?.emailAddress
    if(userEmail){
      const msg = {
        to: userEmail ,
        from: "roamiocityexplorer@gmail.com", // Use the email address or domain you verified above
        subject: `${certificate.courseTitle} Certaficate`,
        text: `Congratulation! ${user.firstName} , you have succussfully completed ${certificate.courseTitle} course  , please click here to see and download your certaficate : ${process.env.NEXT_PUBLIC_APP_URL}/courses/${exam.courseId}/exam/${exam.id}/certificate/${certificate.id}`,
        html: `<p><strong>Congratulation!<strong/> , you have succussfully completed ${certificate.courseTitle} course  , please click here to see and download your certaficate : <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses/${exam.courseId}/exam/${exam.id}/certificate/${certificate.id}">click here</a></p>`,
      };
      sgMail.send(msg)
  .then(() => {}, (error : any)=> {
    console.error( "error when sending email" , error);

    if (error.response) {
      console.error(error.response.body)
    }
  });
    }
    
    return NextResponse.json(certificate);
  } catch (error) {
    console.error("CERTIFICATE_ID_EXAM", error);
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
