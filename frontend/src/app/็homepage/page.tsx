import React from 'react'

const homepage = () => {
  return (
    <>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center"></div>
      <div className="text-center text-black">
        <h1 className="text-3xl font-bold mb-4">ระบบจัดการโครงงานพิเศษ</h1>
        <p className="text-2xl mb-4">กรุณาเข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้น</p>
        <div className="flex justify-center space-x-4">
          <a href="/login" className="text-blue-500 hover:underline">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                เข้าสู่ระบบ
            </button>
            </a>
            <a href="/signup" className="text-blue-500 hover:underline ml-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                ลงทะเบียน
            </button>
            </a>
        </div>
      </div>
    </>
  )
}

export default homepage