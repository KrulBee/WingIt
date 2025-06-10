// Date utility functions for admin components

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'Không có sẵn';
  }
  
  try {    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
};

export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'Không có sẵn';
  }
  
  try {    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
};

export const formatDateShort = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'Không có sẵn';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
};

export const formatTimeAgo = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'Không có sẵn';
  }
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
    
    if (diffSeconds < 30) return 'Vừa xong';
    if (diffSeconds < 60) return `${diffSeconds} giây trước`;
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
    if (diffMonths < 12) return `${diffMonths} tháng trước`;
    if (diffYears > 0) return `${diffYears} năm trước`;
    
    // For dates older than 30 days, show the formatted date
    return formatDateShort(dateString);
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
};
