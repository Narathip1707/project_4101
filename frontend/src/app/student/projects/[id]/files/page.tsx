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

export default function ProjectFiles({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    }
    getParams();
  }, [params]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("progress_report");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadFiles();
    }
  }, [id]);

  const loadFiles = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:3001";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${baseUrl}/api/projects/${id}/files`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedFiles: FileItem[] = data.map((file: any) => ({
          id: file.id,
          file_name: file.file_name,
          file_category: file.file_category,
          file_status: file.file_status || 'pending',
          uploaded_at: file.created_at || file.uploaded_at,
          file_size: file.file_size || 0,
          comments: file.description || file.comments,
        }));
        setFiles(formattedFiles);
      } else {
        console.error('Failed to load files');
        setFiles([]);
      }
    } catch (error) {
      console.error("Error loading files:", error);
      setFiles([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("กรุณาเลือกไฟล์ก่อน");
      return;
    }

    if (!fileDescription.trim()) {
      alert("กรุณากรอกรายละเอียดไฟล์");
      return;
    }

    setUploading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("project_id", id);
      formData.append("file_category", selectedCategory);
      formData.append("description", fileDescription);

      const response = await fetch(`${baseUrl}/api/projects/${id}/files`, {
        method: "POST",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (response.ok) {
        await loadFiles(); // Reload files list
        // Reset form
        setSelectedFile(null);
        setFileDescription("");
        setSelectedCategory("progress_report");
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        alert("อัปโหลดไฟล์สำเร็จ!");
      } else {
        const error = await response.json();
        alert(`ไม่สามารถอัปโหลดไฟล์ได้: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId: string, fileName: string) => {
    // Real API download
    const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:3001";
    const link = document.createElement("a");
    link.href = `${baseUrl}/api/files/${fileId}/download`;
    link.download = fileName;
    link.target = "_blank";
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
            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่ไฟล์ <span className="text-red-500">*</span>
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

              {/* File Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดไฟล์ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  rows={3}
                  placeholder="อธิบายเนื้อหาในไฟล์ เช่น รายงานความก้าวหน้าครั้งที่ 1, เอกสารการออกแบบระบบ"
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  ช่วยให้อาจารย์ที่ปรึกษาเข้าใจเนื้อหาในไฟล์ได้ง่ายขึ้น
                </p>
              </div>

              {/* File Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกไฟล์ <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex-shrink-0 cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    เลือกไฟล์
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png"
                    />
                  </label>
                  {selectedFile && (
                    <div className="flex-1 flex items-center space-x-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{selectedFile.name}</span>
                      <span className="text-gray-400">({formatFileSize(selectedFile.size)})</span>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  รองรับไฟล์ PDF, DOC, DOCX, PPT, PPTX, ZIP, RAR, TXT, JPG, PNG (ขนาดไม่เกิน 10MB)
                </p>
              </div>

              {/* Upload Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFileDescription("");
                    const fileInput = document.getElementById('file-input') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading || !selectedFile || !fileDescription.trim()}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {uploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังอัปโหลด...
                    </span>
                  ) : (
                    'ยืนยันส่งไฟล์'
                  )}
                </button>
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