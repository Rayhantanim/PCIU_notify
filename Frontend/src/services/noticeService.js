// services/noticeService.js
// Use production URL consistently
const API = "https://pciunotifybackend.onrender.com";
// const API = "http://localhost:5000"; 

export const noticeService = {
  async getNotices() {
    try {
      const userRole = localStorage.getItem("role");
      const response = await fetch(`${API}/api/notices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Role": userRole || ""
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching notices:", error);
      throw error;
    }
  },

  async likeNotice(noticeId, userId) {
    try {
      console.log(`📤 Sending like request to: ${API}/api/notice/${noticeId}/like`);
      
      const response = await fetch(`${API}/api/notice/${noticeId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error("Error liking notice:", error);
      return { success: false, message: error.message };
    }
  },

  async addComment(noticeId, commentData) {
    try {
      const response = await fetch(`${API}/api/notice/${noticeId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error("Error adding comment:", error);
      return { success: false, message: error.message };
    }
  },

  async editComment(noticeId, commentId, text, userId) {
    try {
      const response = await fetch(`${API}/api/notice/${noticeId}/comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, userId }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error("Error editing comment:", error);
      return { success: false, message: error.message };
    }
  },

  async deleteComment(noticeId, commentId, userId) {
    try {
      const response = await fetch(`${API}/api/notice/${noticeId}/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { success: false, message: error.message };
    }
  },
};