package com.example.server.service;

import com.example.server.dto.BookmarkDTO;
import com.example.server.model.Entity.Bookmark;
import com.example.server.model.Entity.Post;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.PostMedia;
import com.example.server.model.Entity.Comment;
import com.example.server.repository.BookmarkRepository;
import com.example.server.repository.PostRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.PostReactionRepository;
import com.example.server.repository.PostMediaRepository;
import com.example.server.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookmarkService {    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostReactionRepository postReactionRepository;
    private final PostMediaRepository postMediaRepository;
    private final CommentRepository commentRepository;    public BookmarkService(BookmarkRepository bookmarkRepository, PostRepository postRepository, 
                          UserRepository userRepository, PostReactionRepository postReactionRepository,
                          PostMediaRepository postMediaRepository, CommentRepository commentRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postReactionRepository = postReactionRepository;
        this.postMediaRepository = postMediaRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public BookmarkDTO addBookmark(Long postId, Integer userId) {
        // Check if bookmark already exists
        if (bookmarkRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new RuntimeException("Post is already bookmarked");
        }

        // Get user and post entities
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Create and save bookmark
        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setPost(post);
        bookmark.setCreatedAt(LocalDateTime.now());

        Bookmark savedBookmark = bookmarkRepository.save(bookmark);
        return convertToDTO(savedBookmark);
    }

    @Transactional
    public void removeBookmark(Long postId, Integer userId) {
        if (!bookmarkRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new RuntimeException("Bookmark not found");
        }
        bookmarkRepository.deleteByUserIdAndPostId(userId, postId);
    }

    public boolean isBookmarked(Long postId, Integer userId) {
        return bookmarkRepository.existsByUserIdAndPostId(userId, postId);
    }

    public List<BookmarkDTO> getUserBookmarks(Integer userId) {
        return bookmarkRepository.findBookmarksWithPostsByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getBookmarkCount(Long postId) {
        return bookmarkRepository.countByPostId(postId);
    }

    private BookmarkDTO convertToDTO(Bookmark bookmark) {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setId(bookmark.getId());
        dto.setUserId(bookmark.getUser().getId());
        dto.setPostId(bookmark.getPost().getId());
        dto.setCreatedAt(bookmark.getCreatedAt());
        
        // Include post details if available
        if (bookmark.getPost() != null) {
            dto.setPost(convertPostToDTO(bookmark.getPost()));
        }
        
        return dto;
    }    private BookmarkDTO.PostDTO convertPostToDTO(Post post) {
        BookmarkDTO.PostDTO postDTO = new BookmarkDTO.PostDTO();
        postDTO.setId(post.getId());
        postDTO.setContent(post.getContent());
        postDTO.setCreatedDate(post.getCreatedDate());
        postDTO.setUserId(post.getUser().getId());
        
        // Set user information
        if (post.getUser() != null) {
            BookmarkDTO.UserDTO userDTO = new BookmarkDTO.UserDTO();
            userDTO.setId(post.getUser().getId());
            userDTO.setUsername(post.getUser().getUsername());
            // Add user data if available
            if (post.getUser().getUserData() != null) {
                userDTO.setDisplayName(post.getUser().getUserData().getDisplayName());
                userDTO.setProfilePicture(post.getUser().getUserData().getProfilePicture());
            }
            postDTO.setUser(userDTO);
        }
        
        // Get media URLs
        List<PostMedia> mediaList = postMediaRepository.findByPostIdOrderByUploadedAtAsc(post.getId());
        List<String> mediaUrls = mediaList.stream()
                .map(PostMedia::getMediaUrl)
                .collect(Collectors.toList());
        postDTO.setMediaUrls(mediaUrls);
        
        // Get reaction counts
        long likesCount = postReactionRepository.countByPostIdAndReactionTypeId(post.getId(), 1L); // Like = 1
        long dislikesCount = postReactionRepository.countByPostIdAndReactionTypeId(post.getId(), 2L); // Dislike = 2
        postDTO.setLikesCount((int) likesCount);
        postDTO.setDislikesCount((int) dislikesCount);
          // Get comments count
        long commentsCount = commentRepository.countByPostId(post.getId());
        postDTO.setCommentsCount((int) commentsCount);
        
        return postDTO;
    }
}
