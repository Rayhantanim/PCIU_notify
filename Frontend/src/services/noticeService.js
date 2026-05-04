// services/noticeService.js
const API = "https://pciunotifybackend.onrender.com";

export const noticeService = {
  // Like a notice
  async likeNotice(noticeId, userId) {
    try {
      const response = await fetch(`${API}/api/notices/${noticeId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) throw new Error('Failed to like notice');
      return await response.json();
    } catch (error) {
      console.error('Error liking notice:', error);
      throw error;
    }
  },

  // Add a comment
  async addComment(noticeId, commentData) {
    try {
      const response = await fetch(`${API}/api/notices/${noticeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Edit a comment
  async editComment(noticeId, commentId, text, userId) {
    try {
      const response = await fetch(`${API}/api/notices/${noticeId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, userId }),
      });
      
      if (!response.ok) throw new Error('Failed to edit comment');
      return await response.json();
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(noticeId, commentId, userId) {
    try {
      const response = await fetch(`${API}/api/notices/${noticeId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) throw new Error('Failed to delete comment');
      return await response.json();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Get all notices (with comments and likes)
  async getNotices() {
    try {
      const response = await fetch(`${API}/api/notices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch notices');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  },
};