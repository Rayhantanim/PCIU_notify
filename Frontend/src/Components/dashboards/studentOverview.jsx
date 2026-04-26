import React from 'react'

const StudentOverview = () => {
  return (
    <div className='p-6'>
      <div className='flex flex-col md:flex-row gap-6'>
        {/* Notices Section */}
        <div className='flex-1 bg-white rounded-xl shadow-lg p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <img 
              className='w-8 h-8' 
              src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" 
              alt="notice" 
            />
            <h2 className='text-2xl font-bold text-gray-800'>Notices</h2>
          </div>
          <div className='space-y-4'>
            <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
              <h3 className='font-semibold text-gray-800'>Mid Term Exam Schedule</h3>
              <p className='text-sm text-gray-600 mt-1'>Published on: 15 Jan 2024</p>
              <p className='text-gray-700 mt-2'>Mid term examination will start from 1st February 2024. Check the detailed schedule...</p>
            </div>
            <div className='bg-green-50 p-4 rounded-lg border-l-4 border-green-500'>
              <h3 className='font-semibold text-gray-800'>Cultural Fest 2024</h3>
              <p className='text-sm text-gray-600 mt-1'>Published on: 10 Jan 2024</p>
              <p className='text-gray-700 mt-2'>Annual cultural fest will be held on 25th January. All students are invited to participate...</p>
            </div>
            <div className='bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500'>
              <h3 className='font-semibold text-gray-800'>Library Hours Extended</h3>
              <p className='text-sm text-gray-600 mt-1'>Published on: 5 Jan 2024</p>
              <p className='text-gray-700 mt-2'>Library timings extended till 10 PM on weekdays starting from next week...</p>
            </div>
          </div>
        </div>

        {/* Routine Section */}
        <div className='flex-1 bg-white rounded-xl shadow-lg p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <img 
              className='w-8 h-8' 
              src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" 
              alt="routine" 
            />
            <h2 className='text-2xl font-bold text-gray-800'>Routine</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700'>Day</th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700'>Time</th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700'>Course</th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700'>Room</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-gray-200 hover:bg-gray-50'>
                  <td className='p-3 text-gray-700'>Saturday</td>
                  <td className='p-3 text-gray-700'>10:00 AM</td>
                  <td className='p-3 text-gray-700'>CSE 301</td>
                  <td className='p-3 text-gray-700'>Room 401</td>
                </tr>
                <tr className='border-b border-gray-200 hover:bg-gray-50'>
                  <td className='p-3 text-gray-700'>Sunday</td>
                  <td className='p-3 text-gray-700'>11:30 AM</td>
                  <td className='p-3 text-gray-700'>CSE 302</td>
                  <td className='p-3 text-gray-700'>Room 302</td>
                </tr>
                <tr className='border-b border-gray-200 hover:bg-gray-50'>
                  <td className='p-3 text-gray-700'>Monday</td>
                  <td className='p-3 text-gray-700'>09:00 AM</td>
                  <td className='p-3 text-gray-700'>CSE 303</td>
                  <td className='p-3 text-gray-700'>Room 405</td>
                </tr>
                <tr className='border-b border-gray-200 hover:bg-gray-50'>
                  <td className='p-3 text-gray-700'>Tuesday</td>
                  <td className='p-3 text-gray-700'>02:00 PM</td>
                  <td className='p-3 text-gray-700'>CSE 304</td>
                  <td className='p-3 text-gray-700'>Room 201</td>
                </tr>
                <tr className='border-b border-gray-200 hover:bg-gray-50'>
                  <td className='p-3 text-gray-700'>Wednesday</td>
                  <td className='p-3 text-gray-700'>10:00 AM</td>
                  <td className='p-3 text-gray-700'>CSE 305</td>
                  <td className='p-3 text-gray-700'>Room 403</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentOverview