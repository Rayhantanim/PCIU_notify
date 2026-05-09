// data/noticeTemplates.js

export const noticeTemplates = {
  academic: [
    {
      id: "class_schedule_change",
      title: "Class Schedule Change Notice",
      category: "academic",
      priority: "high",
      content: `
        <div class="notice-template">
          <h3>📚 Important: Class Schedule Change</h3>
          <p>Dear Students,</p>
          <p>This is to inform you that the <strong>[COURSE_NAME]</strong> class schedule has been changed.</p>
          <div class="schedule-info">
            <p><strong>Previous Schedule:</strong><br/>
            Day: [OLD_DAY]<br/>
            Time: [OLD_TIME]<br/>
            Room: [OLD_ROOM]</p>
            
            <p><strong>New Schedule:</strong><br/>
            Day: [NEW_DAY]<br/>
            Time: [NEW_TIME]<br/>
            Room: [NEW_ROOM]</p>
          </div>
          <p>Please note the changes and plan accordingly.</p>
          <p>Thank you for your understanding.</p>
          <p>Regards,<br/>[TEACHER_NAME]<br/>Department of [DEPARTMENT]</p>
        </div>
      `,
      fields: [
        { name: "COURSE_NAME", label: "Course Name", type: "text", placeholder: "e.g., Web Development" },
        { name: "OLD_DAY", label: "Previous Day", type: "select", options: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] },
        { name: "OLD_TIME", label: "Previous Time", type: "text", placeholder: "e.g., 10:00 AM - 11:30 AM" },
        { name: "OLD_ROOM", label: "Previous Room", type: "text", placeholder: "e.g., Room 401" },
        { name: "NEW_DAY", label: "New Day", type: "select", options: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] },
        { name: "NEW_TIME", label: "New Time", type: "text", placeholder: "e.g., 11:30 AM - 1:00 PM" },
        { name: "NEW_ROOM", label: "New Room", type: "text", placeholder: "e.g., Room 405" },
        { name: "TEACHER_NAME", label: "Teacher Name", type: "text", placeholder: "e.g., Dr. Smith" },
        { name: "DEPARTMENT", label: "Department", type: "text", placeholder: "e.g., Computer Science" }
      ]
    },
    {
      id: "assignment_deadline",
      title: "Assignment Deadline Extension",
      category: "academic",
      priority: "medium",
      content: `
        <div class="notice-template">
          <h3>📝 Assignment Deadline Extension Notice</h3>
          <p>Dear Students,</p>
          <p>This is to inform you that the deadline for the <strong>[ASSIGNMENT_NAME]</strong> has been extended.</p>
          <div class="deadline-info">
            <p><strong>Previous Deadline:</strong> [OLD_DEADLINE]</p>
            <p><strong>New Deadline:</strong> [NEW_DEADLINE]</p>
            <p><strong>Course:</strong> [COURSE_NAME]</p>
            <p><strong>Submitted by:</strong> [SUBMISSION_METHOD]</p>
          </div>
          <p>Please submit your assignments before the new deadline.</p>
          <p>For any queries, contact the course teacher.</p>
          <p>Best regards,<br/>[TEACHER_NAME]<br/>Department of [DEPARTMENT]</p>
        </div>
      `,
      fields: [
        { name: "ASSIGNMENT_NAME", label: "Assignment Name", type: "text", placeholder: "e.g., Final Project Report" },
        { name: "OLD_DEADLINE", label: "Previous Deadline", type: "date" },
        { name: "NEW_DEADLINE", label: "New Deadline", type: "date" },
        { name: "COURSE_NAME", label: "Course Name", type: "text", placeholder: "e.g., Web Development" },
        { name: "SUBMISSION_METHOD", label: "Submission Method", type: "select", options: ["Online Portal", "Email", "Hard Copy", "Both Online & Hard Copy"] },
        { name: "TEACHER_NAME", label: "Teacher Name", type: "text", placeholder: "e.g., Dr. Johnson" },
        { name: "DEPARTMENT", label: "Department", type: "text", placeholder: "e.g., Computer Science" }
      ]
    },
    {
      id: "class_cancellation",
      title: "Class Cancellation Notice",
      category: "academic",
      priority: "urgent",
      content: `
        <div class="notice-template">
          <h3>⚠️ Class Cancellation Notice</h3>
          <p>Dear Students,</p>
          <p>This is to inform you that the <strong>[COURSE_NAME]</strong> class scheduled on <strong>[DATE]</strong> at <strong>[TIME]</strong> has been cancelled.</p>
          <div class="cancellation-info">
            <p><strong>Reason:</strong> [REASON]</p>
            <p><strong>Make-up Class:</strong> [MAKEUP_INFO]</p>
          </div>
          <p>We regret any inconvenience caused.</p>
          <p>Sincerely,<br/>[TEACHER_NAME]<br/>Department of [DEPARTMENT]</p>
        </div>
      `,
      fields: [
        { name: "COURSE_NAME", label: "Course Name", type: "text", placeholder: "e.g., Database Management" },
        { name: "DATE", label: "Cancellation Date", type: "date" },
        { name: "TIME", label: "Class Time", type: "text", placeholder: "e.g., 10:00 AM - 11:30 AM" },
        { name: "REASON", label: "Reason for Cancellation", type: "text", placeholder: "e.g., Teacher on leave" },
        { name: "MAKEUP_INFO", label: "Make-up Class Info", type: "textarea", placeholder: "Will be scheduled later / Check department notice board" },
        { name: "TEACHER_NAME", label: "Teacher Name", type: "text", placeholder: "e.g., Prof. Williams" },
        { name: "DEPARTMENT", label: "Department", type: "text", placeholder: "e.g., Computer Science" }
      ]
    }
  ],
  
  exam: [
    {
      id: "exam_routine",
      title: "Exam Routine Notice",
      category: "exam",
      priority: "high",
      content: `
        <div class="notice-template">
          <h3>📋 Mid/Final Exam Routine</h3>
          <p>Dear Students,</p>
          <p>The examination schedule for <strong>[EXAM_NAME]</strong> is hereby published.</p>
          <div class="exam-info">
            <p><strong>Exam Period:</strong> [START_DATE] to [END_DATE]</p>
            <p><strong>Exam Time:</strong> [EXAM_TIME]</p>
          </div>
          <table class="exam-table">
            <thead>
              <tr><th>Date</th><th>Course Code</th><th>Course Name</th><th>Time</th><th>Room</th></tr>
            </thead>
            <tbody>
              [EXAM_TABLE]
            </tbody>
          </table>
          <p><strong>Important Instructions:</strong></p>
          <ul>
            <li>Bring your student ID card to the exam hall</li>
            <li>Arrive at least 15 minutes before exam starts</li>
            <li>No electronic devices allowed</li>
            <li>[ADDITIONAL_INSTRUCTIONS]</li>
          </ul>
          <p>Best of luck!</p>
          <p>Office of the Controller of Examinations</p>
        </div>
      `,
      fields: [
        { name: "EXAM_NAME", label: "Exam Name", type: "text", placeholder: "e.g., Mid Semester Examination" },
        { name: "START_DATE", label: "Start Date", type: "date" },
        { name: "END_DATE", label: "End Date", type: "date" },
        { name: "EXAM_TIME", label: "Exam Time", type: "text", placeholder: "e.g., 10:00 AM - 1:00 PM" },
        { name: "ADDITIONAL_INSTRUCTIONS", label: "Additional Instructions", type: "textarea", placeholder: "Any special instructions..." }
      ]
    },
    {
      id: "result_published",
      title: "Result Published Notice",
      category: "exam",
      priority: "high",
      content: `
        <div class="notice-template">
          <h3>📊 Result Published Notice</h3>
          <p>Dear Students,</p>
          <p>The result of <strong>[EXAM_NAME]</strong> for <strong>[COURSE_NAME]</strong> has been published.</p>
          <div class="result-info">
            <p><strong>Result Date:</strong> [RESULT_DATE]</p>
            <p><strong>Passing Percentage:</strong> [PASSING_PERCENTAGE]%</p>
          </div>
          <p>Students can view their results by:</p>
          <ul>
            <li>Logging into the student portal at [PORTAL_LINK]</li>
            <li>Checking the department notice board</li>
            <li>Contacting the course teacher</li>
          </ul>
          <p><strong>Re-evaluation Request:</strong> [RE_EVALUATION_INFO]</p>
          <p>Congratulations to all successful students!</p>
          <p>Regards,<br/>Examination Department</p>
        </div>
      `,
      fields: [
        { name: "EXAM_NAME", label: "Exam Name", type: "text", placeholder: "e.g., Final Examination" },
        { name: "COURSE_NAME", label: "Course Name", type: "text", placeholder: "e.g., Web Development" },
        { name: "RESULT_DATE", label: "Result Date", type: "date" },
        { name: "PASSING_PERCENTAGE", label: "Passing Percentage", type: "number", placeholder: "e.g., 85" },
        { name: "PORTAL_LINK", label: "Portal Link", type: "text", placeholder: "e.g., https://pciu.edu.bd/results" },
        { name: "RE_EVALUATION_INFO", label: "Re-evaluation Info", type: "textarea", placeholder: "Last date for re-evaluation request" }
      ]
    }
  ],
  
  event: [
    {
      id: "seminar_workshop",
      title: "Seminar/Workshop Notice",
      category: "event",
      priority: "medium",
      content: `
        <div class="notice-template">
          <h3>🎓 Seminar/Workshop Notice</h3>
          <p>Dear Students and Faculty,</p>
          <p>We are pleased to announce a seminar/workshop on <strong>[TOPIC]</strong>.</p>
          <div class="event-info">
            <p><strong>🗓️ Date:</strong> [DATE]</p>
            <p><strong>⏰ Time:</strong> [TIME]</p>
            <p><strong>📍 Venue:</strong> [VENUE]</p>
            <p><strong>🎤 Speaker:</strong> [SPEAKER_NAME]</p>
            <p><strong>🏢 Organized by:</strong> [ORGANIZER]</p>
          </div>
          <p><strong>Topics to be covered:</strong></p>
          <ul>€[TOPICS_LIST]</ul>
          <p><strong>Registration Details:</strong></p>
          <ul>
            <li>Registration Link: [REGISTRATION_LINK]</li>
            <li>Registration Fee: [REGISTRATION_FEE]</li>
            <li>Last Date: [LAST_DATE]</li>
          </ul>
          <p>All are cordially invited to attend.</p>
          <p>For queries, contact: [CONTACT_INFO]</p>
          <p>Best regards,<br/>[ORGANIZER] Committee</p>
        </div>
      `,
      fields: [
        { name: "TOPIC", label: "Seminar/Workshop Topic", type: "text", placeholder: "e.g., Artificial Intelligence in Modern Era" },
        { name: "DATE", label: "Event Date", type: "date" },
        { name: "TIME", label: "Event Time", type: "text", placeholder: "e.g., 10:00 AM - 4:00 PM" },
        { name: "VENUE", label: "Venue", type: "text", placeholder: "e.g., Auditorium" },
        { name: "SPEAKER_NAME", label: "Speaker Name", type: "text", placeholder: "e.g., Dr. John Doe" },
        { name: "ORGANIZER", label: "Organizer", type: "text", placeholder: "e.g., CSE Department" },
        { name: "TOPICS_LIST", label: "Topics List (comma separated)", type: "textarea", placeholder: "Topic 1, Topic 2, Topic 3" },
        { name: "REGISTRATION_LINK", label: "Registration Link", type: "text", placeholder: "https://forms.gle/..." },
        { name: "REGISTRATION_FEE", label: "Registration Fee", type: "text", placeholder: "e.g., Free / 500 TK" },
        { name: "LAST_DATE", label: "Last Registration Date", type: "date" },
        { name: "CONTACT_INFO", label: "Contact Information", type: "text", placeholder: "e.g., 017XXXXXXXX" }
      ]
    },
    {
      id: "cultural_event",
      title: "Cultural Event Notice",
      category: "event",
      priority: "low",
      content: `
        <div class="notice-template">
          <h3>🎭 Cultural Event Notice</h3>
          <p>Dear All,</p>
          <p>We are excited to announce our upcoming cultural event <strong>[EVENT_NAME]</strong>!</p>
          <div class="event-info">
            <p><strong>📅 Date:</strong> [DATE]</p>
            <p><strong>⏰ Time:</strong> [TIME]</p>
            <p><strong>📍 Venue:</strong> [VENUE]</p>
          </div>
          <p><strong>Event Highlights:</strong></p>
          <ul>€[HIGHLIGHTS]</ul>
          <p><strong>Competition Categories:</strong></p>
          <ul>€[CATEGORIES]</ul>
          <p><strong>Registration Link:</strong> [REGISTRATION_LINK]</p>
          <p><strong>Last Date to Register:</strong> [LAST_DATE]</p>
          <p>Attractive prizes for winners!</p>
          <p>Come and showcase your talents!</p>
          <p>For more information, contact:[CONTACT_INFO]</p>
          <p>Regards,<br/>Cultural Committee</p>
        </div>
      `,
      fields: [
        { name: "EVENT_NAME", label: "Event Name", type: "text", placeholder: "e.g., University Cultural Festival" },
        { name: "DATE", label: "Event Date", type: "date" },
        { name: "TIME", label: "Event Time", type: "text", placeholder: "e.g., 3:00 PM - 8:00 PM" },
        { name: "VENUE", label: "Venue", type: "text", placeholder: "e.g., University Ground" },
        { name: "HIGHLIGHTS", label: "Event Highlights (comma separated)", type: "textarea", placeholder: "Music, Dance, Drama, Art Competition" },
        { name: "CATEGORIES", label: "Competition Categories (comma separated)", type: "textarea", placeholder: "Singing, Dancing, Recitation, Photography" },
        { name: "REGISTRATION_LINK", label: "Registration Link", type: "text", placeholder: "https://forms.gle/..." },
        { name: "LAST_DATE", label: "Last Registration Date", type: "date" },
        { name: "CONTACT_INFO", label: "Contact Information", type: "text", placeholder: "e.g., 017XXXXXXXX" }
      ]
    }
  ],
  
  holiday: [
    {
      id: "holiday_announcement",
      title: "Holiday Announcement",
      category: "holiday",
      priority: "low",
      content: `
        <div class="notice-template">
          <h3>🏖️ Holiday Announcement</h3>
          <p>Dear Students, Faculty, and Staff,</p>
          <p>This is to inform you that the university/institute will remain closed on the occasion of <strong>[OCCASION]</strong>.</p>
          <div class="holiday-info">
            <p><strong>Closure Dates:</strong> [START_DATE] to [END_DATE]</p>
            <p><strong>Re-opening Date:</strong> [REOPEN_DATE]</p>
          </div>
          <p><strong>Instructions:</strong></p>
          <ul>
            <li>All pending assignments should be submitted before the holidays</li>
            <li>Online support will be limited</li>
            <li>For urgent issues, contact: [EMERGENCY_CONTACT]</li>
          </ul>
          <p>Wishing you all a happy and enjoyable [OCCASION]!</p>
          <p>Regards,<br/>Administration Office</p>
        </div>
      `,
      fields: [
        { name: "OCCASION", label: "Occasion", type: "text", placeholder: "e.g., Eid-ul-Fitr, Victory Day" },
        { name: "START_DATE", label: "Start Date", type: "date" },
        { name: "END_DATE", label: "End Date", type: "date" },
        { name: "REOPEN_DATE", label: "Re-opening Date", type: "date" },
        { name: "EMERGENCY_CONTACT", label: "Emergency Contact", type: "text", placeholder: "e.g., 017XXXXXXXX" }
      ]
    }
  ],
  
  general: [
    {
      id: "general_announcement",
      title: "General Announcement",
      category: "general",
      priority: "medium",
      content: `
        <div class="notice-template">
          <h3>📌 General Announcement</h3>
          <p>Dear All,</p>
          <p>This is to bring to your attention the following important announcement:</p>
          <div class="announcement-content">
            <p><strong>Title:</strong> [ANNOUNCEMENT_TITLE]</p>
            <p><strong>Details:</strong> [ANNOUNCEMENT_DETAILS]</p>
            <p><strong>Effective From:</strong> [EFFECTIVE_DATE]</p>
            <p><strong>Applicable to:</strong> [APPLICABLE_TO]</p>
          </div>
          <p><strong>Action Required:</strong> [ACTION_REQUIRED]</p>
          <p>Please comply accordingly.</p>
          <p>For further clarification, contact: [CONTACT_INFO]</p>
          <p>Regards,<br/>[AUTHORITY]</p>
        </div>
      `,
      fields: [
        { name: "ANNOUNCEMENT_TITLE", label: "Announcement Title", type: "text", placeholder: "e.g., New Library Timings" },
        { name: "ANNOUNCEMENT_DETAILS", label: "Announcement Details", type: "textarea", placeholder: "Detailed information about the announcement" },
        { name: "EFFECTIVE_DATE", label: "Effective Date", type: "date" },
        { name: "APPLICABLE_TO", label: "Applicable to", type: "text", placeholder: "e.g., All Students" },
        { name: "ACTION_REQUIRED", label: "Action Required", type: "text", placeholder: "e.g., Submit form by date" },
        { name: "CONTACT_INFO", label: "Contact Information", type: "text", placeholder: "e.g., Admin Office" },
        { name: "AUTHORITY", label: "Issuing Authority", type: "text", placeholder: "e.g., Registrar Office" }
      ]
    }
  ]
};

export const getAllTemplates = () => {
  const allTemplates = [];
  Object.keys(noticeTemplates).forEach(category => {
    noticeTemplates[category].forEach(template => {
      allTemplates.push({
        ...template,
        category: category
      });
    });
  });
  return allTemplates;
};

export const getTemplatesByCategory = (category) => {
  return noticeTemplates[category] || [];
};

export const getTemplateById = (id) => {
  for (const category of Object.keys(noticeTemplates)) {
    const template = noticeTemplates[category].find(t => t.id === id);
    if (template) return { ...template, category };
  }
  return null;
};