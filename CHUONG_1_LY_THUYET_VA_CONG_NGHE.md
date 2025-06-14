# CHƯƠNG 1: LÝ THUYẾT VÀ CÔNG NGHỆ

Hệ thống này tận dụng các công nghệ đương đại, được áp dụng rộng rãi và được tích hợp một cách chiến lược để cung cấp một giải pháp phản hồi nhanh và tập trung vào người dùng, đáp ứng hiệu quả nhu cầu và kỳ vọng của người dùng.

Để cung cấp cái nhìn sâu sắc hơn về nền tảng kỹ thuật của dự án này, tôi sẽ giới thiệu các khái niệm cốt lõi đằng sau những công nghệ chính được sử dụng.

## 1.1. PhoBERT - Mô hình BERT Tiếng Việt

PhoBERT là một mô hình ngôn ngữ dựa trên kiến trúc BERT (Bidirectional Encoder Representations from Transformers) được pre-train đặc biệt cho tiếng Việt. Nó được phát triển để giải quyết các thách thức đặc thù của ngôn ngữ tiếng Việt trong xử lý ngôn ngữ tự nhiên.

### 1.1.1. Kiến Trúc Transformer

PhoBERT dựa trên kiến trúc Transformer, sử dụng cơ chế Self-Attention để hiểu ngữ cảnh của từng token trong câu. Kiến trúc này bao gồm:

**a. Multi-Head Self-Attention**
Cơ chế attention cho phép mô hình tập trung vào các phần khác nhau của input sequence đồng thời:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Trong đó:
- Q (Query), K (Key), V (Value) là các ma trận được học từ input
- $d_k$ là dimension của key vectors
- Softmax đảm bảo tổng trọng số attention = 1

**b. Multi-Head Attention**
Mở rộng cơ chế attention để capture các loại thông tin khác nhau:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h)W^O$$

$$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

### 1.1.2. Bidirectional Context Understanding

Khác với các mô hình ngôn ngữ truyền thống chỉ đọc từ trái sang phải, BERT sử dụng Masked Language Modeling (MLM) để học ngữ cảnh từ cả hai hướng:

- **Masked Language Modeling**: Ngẫu nhiên che giấu 15% tokens trong input và dự đoán chúng
- **Next Sentence Prediction**: Dự đoán xem câu B có theo sau câu A hay không

### 1.1.3. Vietnamese Language Adaptations

PhoBERT được thiết kế đặc biệt để xử lý các đặc điểm của tiếng Việt:

**a. Tokenization**
- Sử dụng word-level tokenization thay vì subword cho tiếng Việt
- Xử lý dấu thanh và các ký tự đặc biệt của tiếng Việt

**b. Pre-training Corpus**
- Được train trên corpus tiếng Việt lớn (20GB text)
- Bao gồm dữ liệu từ Wikipedia, báo chí, sách, và web crawling

### 1.1.4. Mathematical Foundation

**Input Representation:**
$$\text{Input} = \text{Token Embeddings} + \text{Position Embeddings} + \text{Segment Embeddings}$$

**Transformer Block:**
$$\text{Output} = \text{LayerNorm}(\text{x} + \text{MultiHead}(\text{x}))$$
$$\text{Final} = \text{LayerNorm}(\text{Output} + \text{FFN}(\text{Output}))$$

### 1.1.5. Fine-tuning Capabilities

PhoBERT có thể được fine-tune cho nhiều tác vụ NLP khác nhau:
- Text Classification
- Named Entity Recognition
- Question Answering
- Sentiment Analysis

## 1.2. Spring Boot Framework

Spring Boot là một lightweight và flexible framework được viết bằng Java. Nó được phân loại là một framework đơn giản hóa việc phát triển các ứng dụng Spring bằng cách không yêu cầu các công cụ hoặc thư viện phức tạp, cho phép các nhà phát triển chỉ thêm những thành phần họ cần.

### 1.2.1. Các Tính Năng Chính
- **Auto-Configuration**: Tự động cấu hình dựa trên dependencies có sẵn
- **Embedded Servers**: Tích hợp sẵn Tomcat, Jetty hoặc Undertow  
- **Production-Ready**: Actuator để monitoring và health checks
- **Starter Dependencies**: Các gói dependency được định nghĩa sẵn
- **Convention over Configuration**: Sử dụng các quy ước mặc định

## 1.3. JSON Web Token (JWT)

JWT là một tiêu chuẩn mở (RFC 7519) cho việc truyền thông tin an toàn giữa các bên dưới dạng JSON object được ký số. Nó cho phép xác thực và authorization stateless.

### 1.3.1. Các Tính Năng Chính
- **Stateless Authentication**: Server không cần lưu trữ session state
- **Self-contained**: Chứa tất cả thông tin cần thiết trong token
- **Cross-domain Support**: Có thể sử dụng across multiple domains  
- **Scalable**: Phù hợp với kiến trúc microservices
- **Security**: Hỗ trợ nhiều thuật toán ký (HMAC, RSA, ECDSA)

## 1.4. Next.js

Next.js là một powerful React framework cho phép server-side rendering (SSR), static site generation (SSG), và client-side rendering (CSR) trong một thiết lập thống nhất. Khi kết hợp với TypeScript, nó mang lại type safety và enhanced developer experience.

### 1.4.1. Các Tính Năng Chính
- **Built-in TypeScript Support**: Next.js có first-class TypeScript support
- **Flexible Data Fetching**: SSR, SSG, và CSR options
- **Automatic Code Splitting**: Tối ưu hóa performance tự động
- **API Routes**: Built-in API endpoints  
- **Image Optimization**: Automatic image optimization và lazy loading

## 1.5. WebSocket Protocol

WebSocket là một giao thức truyền thông cung cấp kênh full-duplex communication qua một TCP connection duy nhất. Được thiết kế cho real-time, low latency communication giữa client và server.

### 1.5.1. Các Tính Năng Chính
- **Real-time Communication**: Bidirectional communication
- **Low Latency**: Nhanh hơn HTTP polling
- **Persistent Connection**: Duy trì kết nối liên tục
- **Cross-platform Support**: Hoạt động trên mọi modern browsers
- **Protocol Upgrade**: Upgrade từ HTTP connection

## 1.6. PostgreSQL

PostgreSQL là một powerful, open-source object-relational database management system (ORDBMS) nhấn mạnh extensibility và SQL compliance. Được phát triển ban đầu tại University of California, Berkeley, nó đã phát triển thành một robust, enterprise-grade database được sử dụng rộng rãi.

### 1.6.1. Các Tính Năng Chính
- **ACID Compliance**: Đảm bảo atomicity, consistency, isolation, và durability
- **Advanced SQL Support**: Hỗ trợ complex queries, foreign keys, triggers, views
- **Extensibility**: Cho phép users định nghĩa custom data types, operators, functions
- **MVCC**: Multi-Version Concurrency Control cho high concurrent performance
- **JSON Support**: Native JSON và JSONB support cho semi-structured data

## 1.7. Cloudinary

Cloudinary là một cloud-based media management platform cung cấp end-to-end image và video management solution. Nó bao gồm upload, storage, manipulation, optimization và delivery.

### 1.7.1. Các Tính Năng Chính
- **Global CDN Network**: Multiple edge locations worldwide cho fast delivery
- **Automatic Optimization**: Intelligent quality và format selection
- **URL-based Transformations**: Real-time image processing qua URL parameters
- **AI-powered Features**: Automatic cropping, background removal, object recognition
- **Scalable Storage**: Auto-scaling storage capacity với high availability

## Kết Luận

Các công nghệ được trình bày trong chương này đại diện cho những tiến bộ quan trọng trong phát triển phần mềm hiện đại. PhoBERT thể hiện sự tiến bộ trong xử lý ngôn ngữ tự nhiên cho tiếng Việt, Spring Boot cung cấp nền tảng vững chắc cho backend development, JWT mang lại giải pháp authentication hiệu quả, Next.js với TypeScript tạo ra frontend experiences xuất sắc, WebSocket cho phép real-time communication, PostgreSQL đảm bảo data persistence đáng tin cậy, và Cloudinary tối ưu hóa media management.

Việc hiểu rõ các nguyên lý lý thuyết đằng sau những công nghệ này là cực kỳ quan trọng cho việc xây dựng các ứng dụng web hiện đại, scalable và user-friendly. Mỗi công nghệ đều có những ưu điểm riêng và khi được kết hợp một cách thông minh, chúng tạo ra một ecosystem mạnh mẽ cho việc phát triển các ứng dụng web phức tạp.
