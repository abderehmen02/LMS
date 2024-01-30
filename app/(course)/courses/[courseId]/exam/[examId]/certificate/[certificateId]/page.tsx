"use client";

import { useEffect, useRef, useState } from "react";
import { htmlToPdf } from "@/lib/html-to-pdf";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import axios from "axios";
import { Certificate } from "@prisma/client";

const CertificatePage = ({
  params,
}: {
  params: { courseId: string; examId: string; certificateId: string };
}) => {
  const htmlRef = useRef<HTMLDivElement>(null);

  const { userId } = useAuth();

  const [certificate, setCertificate] = useState<Certificate>();

  const [isGettingCertificate, setisGettingCertificate] = useState(false);

  useEffect(() => {
    (async () => {
      setisGettingCertificate(true);
      try {
        const response = await axios.get(
          `/api/courses/${params.courseId}/exam//${params.examId}/certificate/${params.certificateId}}`
        );

        setCertificate(response.data);

        console.log("====================================");
        console.log(response.data);
        console.log("====================================");
      } catch (error) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
        toast.error("Something went wrong");
      } finally {
        setisGettingCertificate(false);
      }
    })();
  }, [params.certificateId, params.courseId, params.examId]);

  if (!userId) {
    return redirect("/");
  }

  const handleDownload = async () => {
    if (!htmlRef.current) {
      toast.error("no ref");
      return;
    }

    try {
      const pdfBlob = await htmlToPdf(htmlRef.current);
      const url = URL.createObjectURL(pdfBlob as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "certificate.pdf");
      link.click();
    } catch (error) {
      console.error(error);
      // Handle download failure gracefully
    }
  };

  return (
    <>
      {isGettingCertificate ? (
        <div className="flex items-center justify-center h-full w-full">
          <p className="font-bold text-2xl text-slate-500 animate-pulse">
            Preparing your certificate...
          </p>
        </div>
      ) : certificate ? (
        <div className="flex flex-col space-y-8 ml-10 mb-8 mt-8 mr-8">
          <button
            className="self-end rounded-lg text-white font-bold bg-emerald-600 max-w-fit py-2 px-3"
            onClick={handleDownload}
          >
            <p> Download PDF</p>
          </button>
          <div
            ref={htmlRef}
            id="certificate"
            className="w-full h-[450px] shadow-lg flex"
          >
            <div className="h-full flex-[.9] flex flex-col justify-center px-12 pt-2 pb-12 mb-12 space-y-4">
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
                  {certificate?.nameOfStudent}
                </p>
                <p className="text-xl text-sky-700">
                  has Successfully completed
                </p>
              </div>
              <div>
                <p className="text-3xl text-sky-700 font-bold">
                  {certificate?.courseTitle}
                </p>
                <p className="text-xl text-sky-700">
                  completed on the{" "}
                  <span className="font-semibold">
                    {" "}
                    {certificate?.dateOfIssuance.toLocaleString().split("T")[0]}
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
                <Image
                  src="/badge.jpg"
                  alt="badge"
                  width={180}
                  height={180}
                  className="aspect-auto mt-8 h-fit rounded-full absolute top-10"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full">
          <p className="font-bold text-xl text-slate-500">
            No certificate found for this course. You will be notified when the
            certificate is ready.
          </p>
        </div>
      )}
    </>
  );
};

export default CertificatePage;
