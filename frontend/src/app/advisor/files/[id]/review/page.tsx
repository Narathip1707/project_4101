"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FileReview = {
  id: string;
  file_name: string;
  file_size: number;
  file_category: string;
  uploaded_at: string;
  student_name: string;
  student_id: string;
  project_title: string;
  project_id: string;
  current_status: "pending" | "approved" | "rejected";
  previous_comments?: string;
};

export default function FileReview({ params }: { params: { id: string } }) {
  const { id } = params;
  const [file, setFile] = useState<FileReview | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | "">("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadFileDetails();
  }, [id]);

  const loadFileDetails = async () => {
    try {
      // Mock data for now
      setFile({
        id: id,
        file_name: "รายงานความก้าวหน้าครั้งที่ 2.pdf",
        file_size: 2048000,
        file_category: "progress_report",
        uploaded_at: "2024-09-12T09:15:00Z",
        student_name: "นางสาวสมใจ ใจดี",
        student_id: "6401234567",
        project_title: "ระบบจัดการข้อมูลนักศึกษา",
        project_id: "proj1",
        current_status: "pending",
      });
    } catch (error) {
      console.error("Error loading file details:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) return;

    setSubmitting(true);
    try {
      const reviewData = {
        file_id: id,
        status: decision,
        comments: comments.trim(),
        reviewed_at: new Date().toISOString(),
      };

      // Mock API call
      setTimeout(() => {
        console.log("Review submitted:", reviewData);
        setSubmitting(false);
        router.push("/advisor/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryText = (category: string) => {
    const categories = {
      progress_report: "รายงานความก้าวหน้า",
      final_report: "รายงานฉบับสุดท้าย",
      source_code: "ซอร์สโค้ด",
      documentation: "เอกสารประกอบ",
      presentation: "งานนำเสนอ",
      other: "อื่นๆ",
    };
    return categories[category as keyof typeof categories] || category;
  };

  if (!file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ตรวจสอบไฟล์</h1>
              <p className="mt-2 text-gray-600">ตรวจสอบและให้ความเห็นไฟล์ของนักศึกษา</p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← กลับ
            </button>
          </div>
        </div>

        {/* File Information */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">ข้อมูลไฟล์</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ชื่อไฟล์</label>
                    <p className="mt-1 text-sm text-gray-900">{file.file_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">หมวดหมู่</label>
                    <p className="mt-1 text-sm text-gray-900">{getCategoryText(file.file_category)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ขนาดไฟล์</label>
                    <p className="mt-1 text-sm text-gray-900">{formatFileSize(file.file_size)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">วันที่อัปโหลด</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(file.uploaded_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">นักศึกษา</label>
                    <p className="mt-1 text-sm text-gray-900">{file.student_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">รหัสนักศึกษา</label>
                    <p className="mt-1 text-sm text-gray-900">{file.student_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">โครงงาน</label>
                    <p className="mt-1 text-sm text-gray-900">{file.project_title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">สถานะปัจจุบัน</label>
                    <span className="mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      รอการตรวจสอบ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                📥 ดาวน์โหลดไฟล์
              </button>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">ตรวจสอบไฟล์</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">การตัดสินใจ</label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="approved"
                      name="decision"
                      type="radio"
                      value="approved"
                      checked={decision === "approved"}
                      onChange={(e) => setDecision(e.target.value as "approved" | "rejected")}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="approved" className="ml-3 block text-sm font-medium text-gray-700">
                      ✅ อนุมัติ - ไฟล์ผ่านการตรวจสอบ
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="rejected"
                      name="decision"
                      type="radio"
                      value="rejected"
                      checked={decision === "rejected"}
                      onChange={(e) => setDecision(e.target.value as "approved" | "rejected")}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <label htmlFor="rejected" className="ml-3 block text-sm font-medium text-gray-700">
                      ❌ ไม่อนุมัติ - ไฟล์ต้องปรับปรุง
                    </label>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                  ความเห็น/ข้อเสนอแนะ
                  {decision === "rejected" && <span className="text-red-500"> *</span>}
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows={5}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    decision === "approved" 
                      ? "ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)"
                      : decision === "rejected"
                      ? "กรุณาระบุสาเหตุและข้อเสนอแนะในการปรับปรุง"
                      : "ข้อเสนอแนะสำหรับนักศึกษา"
                  }
                  required={decision === "rejected"}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {decision === "rejected" 
                    ? "กรุณาให้คำแนะนำที่ชัดเจนเพื่อให้นักศึกษาสามารถปรับปรุงได้"
                    : "ข้อเสนอแนะจะถูกส่งไปยังนักศึกษา"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!decision || submitting || (decision === "rejected" && !comments.trim())}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    decision === "approved" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : decision === "rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      {decision === "approved" ? "✅ อนุมัติไฟล์" : decision === "rejected" ? "❌ ไม่อนุมัติ" : "บันทึกการตรวจสอบ"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-blue-400 text-xl">💡</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">แนวทางการตรวจสอบไฟล์</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>ตรวจสอบความถูกต้องของเนื้อหาและรูปแบบ</li>
                  <li>ให้ข้อเสนอแนะที่สร้างสรรค์และชัดเจน</li>
                  <li>หากไม่อนุมัติ ให้ระบุสาเหตุและวิธีแก้ไขอย่างละเอียด</li>
                  <li>ส่งเสริมการเรียนรู้และพัฒนาของนักศึกษา</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}