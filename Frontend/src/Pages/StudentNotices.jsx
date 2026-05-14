import { useEffect, useState } from "react";

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [comments, setComments] = useState({});
  const API = "https://pciunotifybackend.onrender.com";


  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API}/api/notices`);
        const data = await res.json();
        setNotices(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotices();
  }, []);

 
  const handleLike = async (id) => {
    // await fetch(`${API}/api/notices/${id}/like`, {
    //   method: "POST",
    // });

    setNotices((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, likes: (n.likes || 0) + 1 } : n
      )
    );
  };


  const handleCommentChange = (id, value) => {
    setComments({ ...comments, [id]: value });
  };

  // 🔥 submit comment
  const handleCommentSubmit = async (id) => {
    const text = comments[id];
    if (!text) return;

    // await fetch(`${API}/api/notices/${id}/comment`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ text }),
    // });

    setNotices((prev) =>
      prev.map((n) =>
        n._id === id
          ? {
              ...n,
              comments: [...(n.comments || []), { text }],
            }
          : n
      )
    );

    setComments({ ...comments, [id]: "" });
  };

  return (
    <div className="p-5 space-y-6">
      {notices.map((notice) => (
        <div
          key={notice._id}
          className="bg-white shadow-md rounded-xl p-5 border"
        >
          {/* Title */}
          <h2 className="text-xl font-bold">{notice.title}</h2>

          {/* Meta */}
          <p className="text-sm text-gray-500">
            {notice.category} • {new Date(notice.createdAt).toLocaleString()}
          </p>

          {/* Content */}
          <p className="mt-3 text-gray-700">{notice.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => handleLike(notice._id)}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg"
            >
              👍 Like ({notice.likes || 0})
            </button>
          </div>

          {/* Comments */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Comments:</h4>

            <div className="space-y-2">
              {(notice.comments || []).map((c, i) => (
                <div key={i} className="bg-gray-100 p-2 rounded">
                  {c.text}
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex mt-3 gap-2">
              <input
                type="text"
                value={comments[notice._id] || ""}
                onChange={(e) =>
                  handleCommentChange(notice._id, e.target.value)
                }
                placeholder="Write a comment..."
                className="border p-2 rounded w-full"
              />
              <button
                onClick={() => handleCommentSubmit(notice._id)}
                className="bg-green-500 text-white px-3 rounded"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentNotices;