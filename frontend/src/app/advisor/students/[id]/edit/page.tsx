'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

interface StudentDetail {
  id: string;
  user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  year?: number;
  project?: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';
    progress_percentage: number;
    created_at: string;
    deadline?: string;
    objectives?: string[];
    milestones?: Milestone[];
  };
  notes?: string;
  performance_metrics: {
    attendance_score: number;
    submission_score: number;
    quality_score: number;
    overall_score: number;
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress_percentage: number;
  notes?: string;
}

interface ProgressUpdate {
  milestone_id?: string;
  progress_percentage: number;
  notes: string;
  updated_by: string;
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [projectStatus, setProjectStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    due_date: '',
  });
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (studentId) {
      loadStudentDetail();
    }
  }, [studentId, router]);

  const loadStudentDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`http://localhost:8081/api/students/${studentId}`, {
        headers
      });

      if (response.ok) {
        const studentData = await response.json();
        const formattedStudent: StudentDetail = {
          id: studentData.id,
          user_id: studentData.user_id,
          student_id: studentData.user?.student_id || 'ไม่มีรหัส',
          full_name: studentData.user?.full_name || 'ไม่มีชื่อ',
          email: studentData.user?.email || '',
          phone: studentData.user?.phone || '',
          department: studentData.department || 'ไม่ระบุ',
          year: studentData.year || 0,
          project: studentData.projects?.[0] ? {
            id: studentData.projects[0].id,
            title: studentData.projects[0].title,
            description: studentData.projects[0].description,
            status: studentData.projects[0].status,
            progress_percentage: studentData.projects[0].progress_percentage || 0,
            created_at: studentData.projects[0].created_at,
            deadline: studentData.projects[0].deadline,
            objectives: studentData.projects[0].objectives || [],
            milestones: studentData.projects[0].milestones || []
          } : undefined,
          notes: studentData.notes || '',
          performance_metrics: {
            attendance_score: studentData.performance_metrics?.attendance_score || 80,
            submission_score: studentData.performance_metrics?.submission_score || 75,
            quality_score: studentData.performance_metrics?.quality_score || 85,
            overall_score: studentData.performance_metrics?.overall_score || 80
          }
        };
        
        setStudent(formattedStudent);
        setProgressPercentage(formattedStudent.project?.progress_percentage || 0);
        setProjectStatus(formattedStudent.project?.status || '');
        setNotes(formattedStudent.notes || '');
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        setError('ไม่สามารถโหลดข้อมูลนักศึกษาได้');
      }
    } catch (err) {
      console.error('Error loading student:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!student?.project) return;
    
    setSaving(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Update project progress
      const progressUpdate: ProgressUpdate = {
        progress_percentage: progressPercentage,
        notes: notes,
        updated_by: 'advisor'
      };

      const progressResponse = await fetch(`http://localhost:8081/api/projects/${student.project.id}/progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify(progressUpdate)
      });

      // Update project status if changed
      if (projectStatus !== student.project.status) {
        const statusResponse = await fetch(`http://localhost:8081/api/projects/${student.project.id}/status`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: projectStatus })
        });
        
        if (!statusResponse.ok) {
          throw new Error('ไม่สามารถอัปเดตสถานะโปรเจคได้');
        }
      }

      // Update student notes
      const studentResponse = await fetch(`http://localhost:8081/api/students/${studentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ notes: notes })
      });

      if (progressResponse.ok && studentResponse.ok) {
        setSuccessMessage('อัปเดตข้อมูลสำเร็จ');
        setTimeout(() => setSuccessMessage(''), 3000);
        await loadStudentDetail(); // Refresh data
      } else {
        throw new Error('ไม่สามารถอัปเดตข้อมูลได้');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!student?.project || !newMilestone.title) return;
    
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`http://localhost:8081/api/projects/${student.project.id}/milestones`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...newMilestone,
          status: 'pending',
          progress_percentage: 0
        })
      });

      if (response.ok) {
        setNewMilestone({ title: '', description: '', due_date: '' });
        setShowAddMilestone(false);
        setSuccessMessage('เพิ่ม Milestone สำเร็จ');
        await loadStudentDetail(); // Refresh data
      } else {
        throw new Error('ไม่สามารถเพิ่ม Milestone ได้');
      }
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError('เกิดข้อผิดพลาดในการเพิ่ม Milestone');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'เสร็จสิ้น';
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'in-progress':
        return 'กำลังดำเนินการ';
      case 'pending':
        return 'รอการอนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'overdue':
        return 'เลยกำหนด';
      default:
        return 'ไม่ระบุ';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลนักศึกษา...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">ไม่พบข้อมูลนักศึกษา</p>
            <Link href="/advisor/students">
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                กลับไปหน้ารายชื่อนักศึกษา
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/advisor/students">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                ← กลับรายชื่อนักศึกษา
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">จัดการ {student.full_name}</h1>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">ข้อมูลนักศึกษา</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</label>
                  <p className="text-gray-900">{student.full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">รหัสนักศึกษา</label>
                  <p className="text-gray-900">{student.student_id}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">อีเมล</label>
                  <p className="text-gray-900">{student.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">เบอร์โทร</label>
                  <p className="text-gray-900">{student.phone || 'ไม่ระบุ'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">สาขา</label>
                  <p className="text-gray-900">{student.department}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">ปีการศึกษา</label>
                  <p className="text-gray-900">{student.year || 'ไม่ระบุ'}</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">คะแนนผลงาน</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>การเข้าชั้นเรียน</span>
                    <span>{student.performance_metrics.attendance_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${student.performance_metrics.attendance_score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>การส่งงาน</span>
                    <span>{student.performance_metrics.submission_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${student.performance_metrics.submission_score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>คุณภาพงาน</span>
                    <span>{student.performance_metrics.quality_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${student.performance_metrics.quality_score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>รวม</span>
                    <span className="text-blue-600">{student.performance_metrics.overall_score}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Management */}
          <div className="lg:col-span-2">
            {student.project ? (
              <div className="space-y-6">
                {/* Project Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">ข้อมูลโปรเจค</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">ชื่อโปรเจค</label>
                      <p className="text-gray-900">{student.project.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">คำอธิบาย</label>
                      <p className="text-gray-900">{student.project.description}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">วันที่สร้าง</label>
                      <p className="text-gray-900">{formatDate(student.project.created_at)}</p>
                    </div>
                    
                    {student.project.deadline && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">กำหนดส่ง</label>
                        <p className="text-gray-900">{formatDate(student.project.deadline)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Management */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">จัดการความคืบหน้า</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ความคืบหน้า ({progressPercentage}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressPercentage}
                        onChange={(e) => setProgressPercentage(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">สถานะโปรเจค</label>
                      <select
                        value={projectStatus}
                        onChange={(e) => setProjectStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">รอการอนุมัติ</option>
                        <option value="approved">อนุมัติแล้ว</option>
                        <option value="in-progress">กำลังดำเนินการ</option>
                        <option value="completed">เสร็จสิ้น</option>
                        <option value="rejected">ปฏิเสธ</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ/ข้อเสนอแนะ</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="เพิ่มหมายเหตุหรือข้อเสนอแนะสำหรับนักศึกษา..."
                      />
                    </div>
                    
                    <button
                      onClick={handleUpdateProgress}
                      disabled={saving}
                      className={`w-full px-4 py-2 rounded-md text-white transition-colors ${
                        saving 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                  </div>
                </div>

                {/* Milestones */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Milestones</h2>
                    <button
                      onClick={() => setShowAddMilestone(!showAddMilestone)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      + เพิ่ม Milestone
                    </button>
                  </div>

                  {showAddMilestone && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="font-medium mb-3">เพิ่ม Milestone ใหม่</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="ชื่อ Milestone"
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          placeholder="รายละเอียด"
                          value={newMilestone.description}
                          onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={newMilestone.due_date}
                          onChange={(e) => setNewMilestone({...newMilestone, due_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddMilestone}
                            disabled={saving || !newMilestone.title}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:bg-gray-400"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() => setShowAddMilestone(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {student.project.milestones && student.project.milestones.length > 0 ? (
                    <div className="space-y-3">
                      {student.project.milestones.map((milestone) => (
                        <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(milestone.status)}`}>
                              {getStatusText(milestone.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>กำหนดส่ง: {formatDate(milestone.due_date)}</span>
                            <span>{milestone.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                            <div 
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${milestone.progress_percentage}%` }}
                            ></div>
                          </div>
                          {milestone.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">หมายเหตุ: {milestone.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">ยังไม่มี Milestones</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">นักศึกษายังไม่มีโปรเจค</h3>
                <p className="text-gray-500 mb-4">นักศึกษาคนนี้ยังไม่ได้สร้างโปรเจคหรือยังไม่ได้รับการอนุมัติ</p>
                <Link href="/advisor/pending-projects">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                    ดูโปรเจคที่รอการอนุมัติ
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}