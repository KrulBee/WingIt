package com.example.server.repository;

import com.example.server.model.Entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    // Find reports by status
    List<Report> findByStatus(Report.ReportStatus status);
    
    // Find reports by reporter
    List<Report> findByReporterId(Integer reporterId);
    
    // Find reports for a specific user
    List<Report> findByReportedUserId(Integer reportedUserId);
    
    // Find reports for a specific post
    List<Report> findByPostId(Long postId);
    
    // Find reports for a specific comment
    List<Report> findByCommentId(Long commentId);
    
    // Check if a user has already reported a specific post
    @Query("SELECT COUNT(r) > 0 FROM Report r WHERE r.reporter.id = :reporterId AND r.post.id = :postId")
    boolean existsByReporterIdAndPostId(@Param("reporterId") Integer reporterId, @Param("postId") Long postId);
    
    // Check if a user has already reported a specific comment
    @Query("SELECT COUNT(r) > 0 FROM Report r WHERE r.reporter.id = :reporterId AND r.comment.id = :commentId")
    boolean existsByReporterIdAndCommentId(@Param("reporterId") Integer reporterId, @Param("commentId") Long commentId);
    
    // Check if a user has already reported a specific user
    @Query("SELECT COUNT(r) > 0 FROM Report r WHERE r.reporter.id = :reporterId AND r.reportedUser.id = :reportedUserId")
    boolean existsByReporterIdAndReportedUserId(@Param("reporterId") Integer reporterId, @Param("reportedUserId") Integer reportedUserId);
    
    // Admin analytics methods - count by status enum
    long countByStatus(Report.ReportStatus status);
    
    // Method for cascade deletion
    void deleteByPostId(Long postId);
}
