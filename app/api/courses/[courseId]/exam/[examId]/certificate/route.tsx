import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
const sgMail = require('@sendgrid/mail');
import { db } from "@/lib/db";


sgMail.setApiKey(process.env.SEND_GRID_API_KEY);


// async function generatePdf(htmlContent : string) {
//   return new Promise((resolve, reject) => {
//       html_to_pdf.generatePdf({ content: htmlContent } , {format : "A4"} ).then((buffer   : Buffer)=>{
//         resolve(buffer)
//       })
//   });
// }

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
      const htmlContent =        ` <div className="flex flex-col space-y-8 ml-10 pb-8 mt-8 mr-8">
      <div
        id="certificate"
        className="w-full h-[450px] shadow-lg flex flex-row-reverse text-right"
      >
        <div className="h-full flex-[.9] flex flex-col items-end justify-center px-12 pt-2 pb-12 mb-12 space-y-4">
          <div className="flex -space-x-3">
            <p className="font-extrabold text-sky-700 text-5xl italic">L</p>
            <p className="font-extrabold text-green-700 text-5xl">M</p>
            <p className="font-extrabold text-sky-300 text-5xl italic">S</p>
          </div>
  
          <div>
            <p className="text-4xl text-sky-700 font-bold">
              Certification of Completion
            </p>
            <p className="text-2xl text-sky-700 font-light">
              Congratulations,
            </p>
          </div>
          <div>
            <p className="text-3xl text-sky-700 font-bold">
              ${certificate?.nameOfStudent}
            </p>
            <p className="text-xl text-sky-700">
              has Successfully completed
            </p>
          </div>
          <div>
            <p className="text-3xl text-sky-700 font-bold">
              ${certificate?.courseTitle}
            </p>
            <p className="text-xl text-sky-700">
              completed on the
              <span className="font-semibold">
                ${certificate?.dateOfIssuance?.toLocaleString()?.split("T")[0]}
              </span>
            </p>
          </div>
          <div className="-space-y-2">
            <p className="text-base text-sky-700">
              By completing this course, you have added to you knowledge and
              skills,
            </p>
            <p className="text-base text-sky-700">
              And created new opportunities for you
            </p>
          </div>
        </div>
        <div className="min-h-full h-full bg-sky-700 w-40 flex justify-center border-r-8 border-l-8 border-green-700">
          <div className="bg-sky-700 h-full w-full relative">
            <img
              src='${process.env.NEXT_PUBLIC_APP_URL}/favicon.ico'}
              alt="badge"
              width={180}
              height={180}
              className="aspect-auto mt-8 h-fit rounded-full absolute top-10"
            />
          </div>
        </div>
      </div>
    </div>`
    // `<p><strong>Congratulation!<strong/> , you have succussfully completed ${certificate.courseTitle} course  , please click here to see and download your certaficate : <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses/${exam.courseId}/exam/${exam.id}/certificate/${certificate.id}">click here</a></p>`
    //  const pdfBuffer = await generatePdf(htmlContent) as Buffer
      const msg = {
        to: userEmail ,
        from: "roamiocityexplorer@gmail.com", // Use the email address or domain you verified above
        subject: `${certificate.courseTitle} Certaficate`,
        text: `Congratulation! ${user.firstName} , you have succussfully completed ${certificate.courseTitle} course  , please click here to see and download your certaficate : ${process.env.NEXT_PUBLIC_APP_URL}/courses/${exam.courseId}/exam/${exam.id}/certificate/${certificate.id}`,
        html: htmlContent,
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
