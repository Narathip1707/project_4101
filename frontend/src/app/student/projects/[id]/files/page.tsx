"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FileItem = {
  id: string;
  file_name: string;
  file_category: string;
  file_status: "pending" | "approved" | "rejected";
  uploaded_at: string;
  file_size?: number;
  comments?: string;
};

export default function ProjectFiles({ params }: { params: { id: string } }) {
  const { id } = params;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("progress_report");
  const router = useRouter();

  useEffect(() => {
    loadFiles();
  }, [id]);

  const loadFiles = async () => {
    try {
      // Mock data for now
      setFiles([
        {
          id: "1",
          file_name: "รายงานความก้าวหน้าครั้งที่ 1.pdf",
          file_category: "progress_report",
          file_status: "approved",
          uploaded_at: "2024-09-10T14:30:00Z",
          file_size: 2048000,
        },
        {
          id: "2",
          file_name: "ซอร์สโค้ด_เวอร์ชัน_1.zip",
          file_category: "source_code",
          file_status: "pending",
          uploaded_at: "2024-09-12T09:15:00Z",
          file_size: 5120000,
        },
        {
          id: "3",
          file_name: "เอกสารการออกแบบระบบ.docx",
          file_category: "documentation",
          file_status: "rejected",
          uploaded_at: "2024-09-08T16:45:00Z",
          file_size: 1024000,
          comments: "กรุณาเพิ่มรายละเอียดของ Use Case Diagram",
        },
      ]);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_category", selectedCategory);
      formData.append("project_id", id);

      // Mock upload - replace with actual API call
      setTimeout(() => {
        const newFile: FileItem = {
          id: Date.now().toString(),
          file_name: file.name,
          file_category: selectedCategory,
          file_status: "pending",
          uploaded_at: new Date().toISOString(),
          file_size: file.size,
        };
        setFiles(prev => [newFile, ...prev]);
        setUploading(false);
        // Reset file input
        if (event.target) {
          event.target.value = "";
        }
      }, 2000);

    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const statusText = {
      pending: "รอการตรวจ",
      approved: "อนุมัติ",
      rejected: "ไม่อนุมัติ",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (fileId: string, fileName: string) => {
    // Mock download - replace with actual API call
    const link = document.createElement("a");
    link.href = `${process.env.NEXT_PUBLIC_API}/project-files/${fileId}/download`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการไฟล์โครงงาน</h1>
              <p className="mt-2 text-gray-600">อัปโหลดและจัดการไฟล์ของโครงงาน</p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← กลับ
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">อัปโหลดไฟล์ใหม่</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่ไฟล์
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="progress_report">รายงานความก้าวหน้า</option>
                  <option value="final_report">รายงานฉบับสุดท้าย</option>
                  <option value="source_code">ซอร์สโค้ด</option>
                  <option value="documentation">เอกสารประกอบ</option>
                  <option value="presentation">งานนำเสนอ</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกไฟล์
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">กำลังอัปโหลด...</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  รองรับไฟล์ PDF, DOC, DOCX, ZIP, RAR (ขนาดไม่เกิน 10MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">ไฟล์ทั้งหมด ({files.length})</h3>
          </div>
          <div className="overflow-hidden">
            {files.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📁</div>
                <p className="text-gray-500 text-lg">ยังไม่มีไฟล์ที่อัปโหลด</p>
                <p className="text-gray-400 text-sm mt-2">เริ่มต้นด้วยการอัปโหลดไฟล์แรกของคุณ</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {files.map((file) => (
                  <div key={file.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-medium">
                                {file.file_name.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {file.file_name}
                            </h4>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{getCategoryText(file.file_category)}</span>
                              {file.file_size && <span>{formatFileSize(file.file_size)}</span>}
                              <span>
                                {new Date(file.uploaded_at).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            {file.comments && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm text-red-800">
                                  <strong>ความคิดเห็น:</strong> {file.comments}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(file.file_status)}
                        {file.file_status === "approved" && (
                          <button
                            onClick={() => handleDownload(file.id, file.file_name)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            ดาวน์โหลด
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}