# WingIt Social Media Platform - Use Cases Documentation

## 📋 Tổng Quan (Overview)

Tài liệu này mô tả tất cả các use case chính cho nền tảng mạng xã hội WingIt, bao gồm các chức năng quản lý người dùng, tương tác xã hội, nhắn tin thời gian thực, và quản trị hệ thống.

## 🎯 Danh Sách Use Cases Chính

### 1. 👤 **Quản Lý Người Dùng (User Management)**

#### UC001: Đăng Ký Tài Khoản
- **Mô tả**: Người dùng tạo tài khoản mới trên hệ thống
- **Actor**: Người dùng chưa đăng ký
- **Luồng chính**:
  1. Người dùng nhập thông tin đăng ký (username, email, password)
  2. Hệ thống xác thực thông tin
  3. Gửi email xác nhận
  4. Tạo tài khoản thành công
- **Điều kiện tiên quyết**: Không có
- **Kết quả**: Tài khoản được tạo và kích hoạt

#### UC002: Đăng Nhập Hệ Thống
- **Mô tả**: Người dùng đăng nhập vào hệ thống
- **Actor**: Người dùng đã đăng ký
- **Luồng chính**:
  1. Nhập thông tin đăng nhập (username/email + password)
  2. Xác thực thông tin
  3. Tạo session/JWT token
  4. Chuyển hướng đến trang chủ
- **Luồng phụ**: Đăng nhập bằng OAuth2 (Google, Facebook)

#### UC003: Quản Lý Hồ Sơ Cá Nhân
- **Mô tả**: Người dùng chỉnh sửa thông tin cá nhân
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Truy cập trang profile
  2. Chỉnh sửa thông tin (tên hiển thị, bio, ngày sinh)
  3. Upload ảnh đại diện/ảnh bìa
  4. Lưu thay đổi
- **Tính năng bổ sung**: Crop ảnh, preview thay đổi

#### UC004: Đổi Mật Khẩu
- **Mô tả**: Người dùng thay đổi mật khẩu
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Nhập mật khẩu cũ
  2. Nhập mật khẩu mới và xác nhận
  3. Xác thực mật khẩu cũ
  4. Cập nhật mật khẩu mới

#### UC005: Quản Lý Cài Đặt Riêng Tư
- **Mô tả**: Người dùng điều chỉnh các cài đặt về quyền riêng tư
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Truy cập trang settings
  2. Điều chỉnh mức độ riêng tư (public/private/friends only)
  3. Cài đặt hiển thị trạng thái online
  4. Cho phép/không cho phép tìm kiếm từ search engines

### 2. 📝 **Quản Lý Bài Viết (Post Management)**

#### UC006: Tạo Bài Viết
- **Mô tả**: Người dùng tạo bài viết mới
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Mở form tạo bài viết
  2. Nhập nội dung text
  3. Upload hình ảnh (tùy chọn)
  4. Chọn vị trí (tùy chọn)
  5. Đăng bài viết
- **Tính năng bổ sung**: Preview, AI content moderation

#### UC007: Xem Bài Viết
- **Mô tả**: Người dùng xem chi tiết bài viết
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Click vào bài viết từ feed/profile
  2. Mở modal chi tiết bài viết
  3. Tracking view analytics
  4. Hiển thị thông tin đầy đủ (author, content, media, stats)

#### UC008: Tương Tác Với Bài Viết
- **Mô tả**: Người dùng like/dislike bài viết
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Click nút like/dislike
  2. Cập nhật reaction trong database
  3. Cập nhật UI real-time
  4. Gửi notification cho tác giả (nếu like)

#### UC009: Lưu Bài Viết (Bookmark)
- **Mô tả**: Người dùng lưu bài viết để xem lại sau
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Click nút bookmark trên bài viết
  2. Thêm/xóa bookmark trong database
  3. Cập nhật trạng thái UI

#### UC010: Báo Cáo Bài Viết
- **Mô tả**: Người dùng báo cáo nội dung không phù hợp
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Click nút "Báo cáo"
  2. Chọn lý do báo cáo
  3. Nhập mô tả chi tiết (tùy chọn)
  4. Gửi báo cáo cho admin

### 3. 💬 **Hệ Thống Bình Luận (Comment System)**

#### UC011: Viết Bình Luận
- **Mô tả**: Người dùng bình luận trên bài viết
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Nhập nội dung bình luận
  2. Click "Gửi"
  3. Lưu comment vào database
  4. Cập nhật UI real-time
  5. Gửi notification cho tác giả bài viết

#### UC012: Trả Lời Bình Luận
- **Mô tả**: Người dùng trả lời bình luận của người khác
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Click "Trả lời" trên comment
  2. Nhập nội dung reply
  3. Gửi reply
  4. Hiển thị nested reply structure

#### UC013: Like/Dislike Bình Luận
- **Mô tả**: Người dùng reaction với bình luận
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Click nút like/dislike trên comment
  2. Cập nhật reaction count
  3. Thay đổi trạng thái UI

### 4. 👥 **Hệ Thống Bạn Bè (Friend System)**

#### UC014: Gửi Lời Mời Kết Bạn
- **Mô tả**: Người dùng gửi lời mời kết bạn
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Tìm kiếm user hoặc vào profile
  2. Click "Thêm bạn bè"
  3. Gửi friend request
  4. Gửi notification cho người nhận

#### UC015: Chấp Nhận/Từ Chối Lời Mời
- **Mô tả**: Người dùng xử lý lời mời kết bạn
- **Actor**: Người dùng nhận lời mời
- **Luồng chính**:
  1. Xem notification/friend request
  2. Click "Chấp nhận" hoặc "Từ chối"
  3. Cập nhật trạng thái relationship
  4. Gửi notification phản hồi

#### UC016: Quản Lý Danh Sách Bạn Bè
- **Mô tả**: Người dùng xem và quản lý danh sách bạn bè
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Truy cập trang Friends
  2. Xem danh sách bạn bè hiện tại
  3. Xem lời mời đã gửi/nhận
  4. Hủy kết bạn (nếu cần)

#### UC017: Theo Dõi Người Dùng (Follow)
- **Mô tả**: Người dùng theo dõi user khác (không cần chấp nhận)
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Vào profile người khác
  2. Click "Theo dõi"
  3. Thêm vào danh sách following
  4. Nhận bài viết của người được follow trong feed

### 5. 💬 **Hệ Thống Nhắn Tin (Messaging System)**

#### UC018: Bắt Đầu Cuộc Trò Chuyện
- **Mô tả**: Người dùng tạo chat room mới
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Click nút "+" trong Messages
  2. Chọn bạn bè để chat
  3. Chọn loại chat (direct/group)
  4. Tạo chat room
  5. Bắt đầu nhắn tin

#### UC019: Gửi Tin Nhắn
- **Mô tả**: Người dùng gửi tin nhắn trong chat
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Nhập nội dung tin nhắn
  2. Click "Gửi" hoặc Enter
  3. Gửi tin nhắn qua WebSocket
  4. Cập nhật UI real-time
  5. Gửi notification cho người nhận

#### UC020: Nhận Tin Nhắn Real-time
- **Mô tả**: Người dùng nhận tin nhắn ngay lập tức
- **Actor**: Người dùng trong chat room
- **Luồng chính**:
  1. Nhận tin nhắn qua WebSocket
  2. Cập nhật UI chat interface
  3. Hiển thị notification (nếu không focus)
  4. Phát âm thanh thông báo

#### UC021: Hiển Thị Trạng Thái Typing
- **Mô tả**: Hiển thị khi ai đó đang gõ tin nhắn
- **Actor**: Người dùng trong chat room
- **Luồng chính**:
  1. Detect typing trong input field
  2. Broadcast typing status qua WebSocket
  3. Hiển thị "đang nhập..." cho other users
  4. Ẩn indicator khi ngừng gõ

#### UC022: Quản Lý Chat Room
- **Mô tả**: Admin quản lý thành viên và cài đặt chat
- **Actor**: Admin/Moderator của chat room
- **Luồng chính**:
  1. Mở chat management modal
  2. Thêm/xóa thành viên
  3. Thay đổi quyền thành viên (Admin/Moderator/Member)
  4. Đổi tên chat room
  5. Mute/unmute thành viên

### 6. 🔔 **Hệ Thống Thông Báo (Notification System)**

#### UC023: Nhận Thông Báo Real-time
- **Mô tả**: Người dùng nhận các thông báo ngay lập tức
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Có hoạt động liên quan đến user (like, comment, friend request)
  2. Hệ thống tạo notification
  3. Gửi qua WebSocket real-time
  4. Hiển thị trong notification page
  5. Cập nhật notification counter

#### UC024: Quản Lý Thông Báo
- **Mô tả**: Người dùng xem và quản lý thông báo
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Truy cập trang Notifications
  2. Xem danh sách thông báo
  3. Đánh dấu đã đọc
  4. Xóa thông báo không cần thiết

### 7. 🔍 **Hệ Thống Tìm Kiếm (Search System)**

#### UC025: Tìm Kiếm Người Dùng
- **Mô tả**: Người dùng tìm kiếm user khác
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Nhập từ khóa trong search box
  2. Hệ thống tìm theo username, display name
  3. Hiển thị kết quả search
  4. Click để vào profile

#### UC026: Tìm Kiếm Bài Viết
- **Mô tả**: Người dùng tìm kiếm nội dung bài viết
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Nhập từ khóa tìm kiếm
  2. Search trong content của posts
  3. Hiển thị relevant posts
  4. Click để xem chi tiết

### 8. 📊 **Analytics và Báo Cáo (Analytics & Reporting)**

#### UC027: Xem Thống Kê Bài Viết
- **Mô tả**: Người dùng xem analytics bài viết của mình
- **Actor**: Tác giả bài viết
- **Luồng chính**:
  1. Vào profile cá nhân
  2. Xem post analytics
  3. Hiển thị view count, engagement rate
  4. Phân tích view source (feed, modal, profile, etc.)

#### UC028: Tracking Post Views
- **Mô tả**: Hệ thống track lượt xem bài viết
- **Actor**: Hệ thống
- **Luồng chính**:
  1. User click vào bài viết
  2. Track view với metadata (source, duration, user info)
  3. Lưu vào PostView entity
  4. Cập nhật analytics

### 9. 🛡️ **Kiểm Duyệt Nội Dung (Content Moderation)**

#### UC029: AI Content Moderation
- **Mô tả**: Hệ thống AI kiểm tra nội dung độc hại
- **Actor**: Hệ thống AI
- **Luồng chính**:
  1. User submit bài viết/comment
  2. Gửi content đến AI moderation service
  3. AI phân tích và trả về kết quả (allow/flag/review/block)
  4. Xử lý theo kết quả moderation

#### UC030: Xử Lý Báo Cáo
- **Mô tả**: Admin xử lý các báo cáo từ user
- **Actor**: Administrator
- **Luồng chính**:
  1. Xem danh sách reports
  2. Review nội dung được báo cáo
  3. Quyết định hành động (approve/remove/warn/ban)
  4. Gửi notification cho user liên quan

### 10. 🔐 **Bảo Mật và Quyền Truy Cập (Security & Access Control)**

#### UC031: Quản Lý Session
- **Mô tả**: Hệ thống quản lý phiên đăng nhập
- **Actor**: Hệ thống
- **Luồng chính**:
  1. Tạo JWT token khi login
  2. Validate token cho mỗi request
  3. Refresh token khi cần
  4. Logout và invalidate token

#### UC032: Block/Unblock User
- **Mô tả**: Người dùng chặn user khác
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Vào profile người cần block
  2. Click "Block user"
  3. Xác nhận block
  4. Ẩn all content từ user đó
  5. Ngăn interaction giữa 2 users

### 11. 🔄 **Tính Năng Real-time (Real-time Features)**

#### UC033: Online Status Tracking
- **Mô tả**: Hiển thị trạng thái online của users
- **Actor**: Tất cả users đã đăng nhập
- **Luồng chính**:
  1. User login → broadcast online status
  2. Update presence khi user active
  3. Hiển thị green dot cho online users
  4. Broadcast offline khi user logout/inactive

#### UC034: Real-time Feed Updates
- **Mô tả**: Feed cập nhật real-time khi có bài viết mới
- **Actor**: Người dùng đang xem feed
- **Luồng chính**:
  1. User khác tạo bài viết mới
  2. Broadcast post update qua WebSocket
  3. Cập nhật feed ngay lập tức
  4. Hiển thị "Cập nhật trực tuyến" indicator

### 12. 👨‍💼 **Quản Trị Hệ Thống (System Administration)**

#### UC035: Quản Lý Người Dùng
- **Mô tả**: Admin quản lý accounts và permissions
- **Actor**: System Administrator
- **Luồng chính**:
  1. Xem danh sách all users
  2. View user details và activity
  3. Ban/unban users
  4. Reset passwords
  5. Assign roles (Admin/Moderator/User)

#### UC036: Thống Kê Hệ Thống
- **Mô tả**: Admin xem analytics tổng quan
- **Actor**: System Administrator
- **Luồng chính**:
  1. Truy cập admin dashboard
  2. Xem user growth statistics
  3. Monitor system performance
  4. View content moderation reports
  5. Analyze engagement metrics

#### UC037: Quản Lý Nội Dung
- **Mô tả**: Admin moderate và quản lý content
- **Actor**: Administrator/Moderator
- **Luồng chính**:
  1. Review flagged content
  2. Remove inappropriate posts/comments
  3. Issue warnings to users
  4. Monitor AI moderation results
  5. Handle user appeals

### 13. 📱 **Tương Thích Mobile (Mobile Compatibility)**

#### UC038: Responsive Interface
- **Mô tả**: Giao diện tự động thích ứng với mobile devices
- **Actor**: Mobile users
- **Luồng chính**:
  1. Truy cập từ mobile browser
  2. UI tự động adapt cho mobile screen
  3. Touch-friendly interactions
  4. Optimized performance cho mobile

#### UC039: Mobile Notifications
- **Mô tả**: Push notifications cho mobile browsers
- **Actor**: Mobile users
- **Luồng chính**:
  1. Request notification permission
  2. Register for push notifications
  3. Receive notifications khi app không active
  4. Click notification để mở app

### 14. 🔧 **Cài Đặt và Tùy Chỉnh (Settings & Customization)**

#### UC040: Theme Customization
- **Mô tả**: Người dùng tùy chỉnh giao diện
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**:
  1. Truy cập Settings
  2. Chọn theme (Light/Dark/Auto)
  3. Tùy chỉnh màu sắc
  4. Lưu preferences

#### UC041: Language Settings
- **Mô tả**: Đổi ngôn ngữ interface
- **Actor**: Người dùng
- **Luồng chính**:
  1. Vào Language settings
  2. Chọn ngôn ngữ (Vietnamese/English)
  3. Apply changes
  4. Reload interface với ngôn ngữ mới

### 15. 🔗 **Tích Hợp Bên Ngoài (External Integrations)**

#### UC042: OAuth2 Login
- **Mô tả**: Đăng nhập bằng social accounts
- **Actor**: Người dùng
- **Luồng chính**:
  1. Click "Login with Google/Facebook"
  2. Redirect đến OAuth provider
  3. User authorize application
  4. Nhận user info và tạo account
  5. Login successful

#### UC043: Media Upload to Cloud
- **Mô tả**: Upload hình ảnh lên cloud storage (Cloudinary)
- **Actor**: Người dùng upload media
- **Luồng chính**:
  1. User chọn file để upload
  2. Validate file type và size
  3. Upload to Cloudinary
  4. Nhận URL và lưu vào database
  5. Hiển thị media trong UI

## 🎯 Các Use Case Nâng Cao (Advanced Use Cases)

### UC044: Live Streaming (Future)
- **Mô tả**: Người dùng live stream video
- **Actor**: Content creator
- **Luồng chính**: Tạo live stream → Broadcast → Viewer interaction

### UC045: Story/Status Updates (Future)
- **Mô tả**: Chia sẻ story 24h như Instagram
- **Actor**: Người dùng đã đăng nhập
- **Luồng chính**: Upload story → Hiển thị 24h → Auto delete

### UC046: E-commerce Integration (Future)
- **Mô tả**: Bán hàng qua social platform
- **Actor**: Business users
- **Luồng chính**: Tạo shop → List products → Process orders

### UC047: Event Management (Future)
- **Mô tả**: Tạo và quản lý sự kiện
- **Actor**: Event organizers
- **Luồng chính**: Tạo event → Invite users → RSVP management

### UC048: Hashtag System (Future)
- **Mô tả**: Tag và categorize content
- **Actor**: Người dùng tạo content
- **Luồng chính**: Add hashtags → Trending topics → Discover content

### UC049: Content Scheduling (Future)
- **Mô tả**: Lên lịch đăng bài
- **Actor**: Content creators
- **Luồng chính**: Tạo post → Schedule time → Auto publish

### UC050: Advanced Analytics (Future)
- **Mô tả**: Deep analytics cho business accounts
- **Actor**: Business users
- **Luồng chính**: View insights → Export reports → Optimize content

## 📊 Ma Trận Use Case theo Độ Ưu Tiên

| Độ Ưu Tiên | Use Cases | Trạng Thái |
|-------------|-----------|------------|
| **Cao** | UC001-UC025 | ✅ Đã triển khai |
| **Trung Bình** | UC026-UC035 | 🔄 Đang phát triển |
| **Thấp** | UC036-UC043 | 📋 Kế hoạch |
| **Tương Lai** | UC044-UC050 | 🔮 Roadmap |

## 🔗 Liên Kết Tài Liệu

- [Sequence Diagrams](./SEQUENCE_DIAGRAM_PROMPT.md)
- [Activity Diagrams](./SEQUENCE_DIAGRAM_PROMPT.md)
- [WebSocket Integration](./fe/WEBSOCKET_INTEGRATION_SUMMARY.md)
- [Messaging System](./fe/MESSAGING_SYSTEM_SUMMARY.md)
- [AI Moderation](./AI/README.md)

---

**Lưu ý**: Tài liệu này sẽ được cập nhật thường xuyên khi có thêm tính năng mới hoặc thay đổi requirements.
