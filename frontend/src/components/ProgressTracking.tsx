// Progress Tracking Components
'use client';

import { useState } from 'react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'comment' | 'file_upload' | 'status_change' | 'meeting';
  status?: 'completed' | 'in-progress' | 'pending' | 'overdue';
  user_name?: string;
  user_role?: 'student' | 'advisor';
}

interface ProgressTrackingProps {
  projectId: string;
  currentProgress: number;
  timeline: TimelineEvent[];
  onUpdateProgress: (progress: number, notes: string) => void;
  onAddMilestone: (milestone: { title: string; description: string; due_date: string }) => void;
  onAddComment: (comment: string) => void;
  readOnly?: boolean;
}

export function ProgressTrackingSystem({ 
  projectId, 
  currentProgress, 
  timeline, 
  onUpdateProgress, 
  onAddMilestone, 
  onAddComment,
  readOnly = false 
}: ProgressTrackingProps) {
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [newComment, setNewComment] = useState('');
  const [progressValue, setProgressValue] = useState(currentProgress);
  const [progressNotes, setProgressNotes] = useState('');

  const handleUpdateProgress = () => {
    onUpdateProgress(progressValue, progressNotes);
    setProgressNotes('');
  };

  const handleAddMilestone = () => {
    if (newMilestone.title && newMilestone.due_date) {
      onAddMilestone(newMilestone);
      setNewMilestone({ title: '', description: '', due_date: '' });
      setShowAddMilestone(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
      setShowAddComment(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return '🎯';
      case 'comment':
        return '💬';
      case 'file_upload':
        return '📄';
      case 'status_change':
        return '📋';
      case 'meeting':
        return '👥';
      default:
        return '📌';
    }
  };

  const getEventColor = (type: string, status?: string) => {
    if (status === 'completed') return 'text-green-600 border-green-200 bg-green-50';
    if (status === 'overdue') return 'text-red-600 border-red-200 bg-red-50';
    
    switch (type) {
      case 'milestone':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'comment':
        return 'text-gray-600 border-gray-200 bg-gray-50';
      case 'file_upload':
        return 'text-purple-600 border-purple-200 bg-purple-50';
      case 'status_change':
        return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'meeting':
        return 'text-indigo-600 border-indigo-200 bg-indigo-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">ความคืบหน้าโปรเจค</h3>
          <span className="text-2xl font-bold text-blue-600">{currentProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${currentProgress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>เริ่มต้น</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>เสร็จสิ้น</span>
        </div>

        {!readOnly && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium mb-3">อัปเดตความคืบหน้า</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความคืบหน้าใหม่ ({progressValue}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุการอัปเดต
                </label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="อธิบายการเปลี่ยนแปลงหรือความคืบหน้าที่เกิดขึ้น..."
                />
              </div>
              
              <button
                onClick={handleUpdateProgress}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                บันทึกความคืบหน้า
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddMilestone(!showAddMilestone)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            + เพิ่ม Milestone
          </button>
          <button
            onClick={() => setShowAddComment(!showAddComment)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            + เพิ่มความคิดเห็น
          </button>
        </div>
      )}

      {/* Add Milestone Form */}
      {showAddMilestone && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold mb-4">เพิ่ม Milestone ใหม่</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ Milestone</label>
              <input
                type="text"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น วิเคราะห์ระบบเสร็จ, ทดสอบระบบ, เตรียมเอกสาร"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
              <textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="อธิบายรายละเอียดและเป้าหมายของ milestone นี้"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">กำหนดส่ง</label>
              <input
                type="date"
                value={newMilestone.due_date}
                onChange={(e) => setNewMilestone({...newMilestone, due_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddMilestone}
                disabled={!newMilestone.title || !newMilestone.due_date}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:bg-gray-400"
              >
                เพิ่ม Milestone
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

      {/* Add Comment Form */}
      {showAddComment && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
          <h3 className="text-lg font-semibold mb-4">เพิ่มความคิดเห็น</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ความคิดเห็น</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="แสดงความคิดเห็น คำแนะนำ หรือข้อเสนอแนะ..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:bg-gray-400"
              >
                เพิ่มความคิดเห็น
              </button>
              <button
                onClick={() => setShowAddComment(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">Timeline โปรเจค</h3>
        
        {timeline.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              📋
            </div>
            <p className="text-gray-500">ยังไม่มีกิจกรรมในโปรเจคนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex">
                {/* Timeline line */}
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === 'completed' ? 'bg-green-500' :
                    event.status === 'overdue' ? 'bg-red-500' :
                    event.status === 'in-progress' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}></div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-16 bg-gray-200 mt-2"></div>
                  )}
                </div>
                
                {/* Event content */}
                <div className={`flex-1 p-4 rounded-lg border ${getEventColor(event.type, event.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getEventIcon(event.type)}</span>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm opacity-75 mt-1">{event.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75">{formatDate(event.date)}</div>
                      {event.user_name && (
                        <div className="text-xs opacity-60 mt-1">
                          โดย {event.user_name} ({event.user_role === 'advisor' ? 'อาจารย์' : 'นักเรียน'})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Milestone Status Component
export function MilestoneStatus({ 
  milestones,
  onUpdateMilestone 
}: {
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    progress_percentage: number;
  }>;
  onUpdateMilestone?: (id: string, status: string, progress: number) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-3">
      {milestones.map((milestone) => {
        const overdue = isOverdue(milestone.due_date, milestone.status);
        const displayStatus = overdue && milestone.status !== 'completed' ? 'overdue' : milestone.status;
        
        return (
          <div key={milestone.id} className={`p-4 rounded-lg border-2 ${getStatusColor(displayStatus)}`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{milestone.title}</h4>
              <span className="text-xs font-semibold px-2 py-1 rounded">
                {displayStatus === 'completed' ? 'เสร็จสิ้น' :
                 displayStatus === 'overdue' ? 'เลยกำหนด' :
                 displayStatus === 'in-progress' ? 'กำลังทำ' : 'รอดำเนินการ'}
              </span>
            </div>
            
            <p className="text-sm opacity-75 mb-3">{milestone.description}</p>
            
            <div className="flex items-center justify-between text-sm">
              <span>กำหนดส่ง: {new Date(milestone.due_date).toLocaleDateString('th-TH')}</span>
              <span>{milestone.progress_percentage}% เสร็จสิ้น</span>
            </div>
            
            <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  displayStatus === 'completed' ? 'bg-green-600' :
                  displayStatus === 'overdue' ? 'bg-red-600' :
                  'bg-blue-600'
                }`}
                style={{ width: `${milestone.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}