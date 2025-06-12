2.4 Xây dựng mô hình xử lý ngôn ngữ tự nhiên (NLP) cho phát hiện ngôn từ độc hại

2.4.1 Mô tả bài toán

Để xây dựng được hệ thống mạng xã hội an toàn, đồ án cần phải giải quyết được bài toán phát hiện ngôn từ độc hại trong tiếng Việt, trong đó:

- Đầu vào: Nội dung bài viết hoặc bình luận của người dùng bằng tiếng Việt
- Đầu ra: Phân loại nội dung có chứa ngôn từ độc hại hay không và mức độ tin cậy của dự đoán

2.4.2 Cấu trúc của mô hình xử lý ngôn ngữ tự nhiên (NLP)

Người dùng gửi bài viết/bình luận đến website và bên client sẽ gửi một yêu cầu AJAX đến server thông qua API endpoint /api/check-profanity. Bên server nhận nội dung từ client rồi gọi mô hình AI đã được huấn luyện để phân tích nội dung.

Các thành phần chính:

• File best_phobert_model.pth: Đây là file mô hình PhoBERT đã được fine-tune cho bài toán phát hiện ngôn từ độc hại tiếng Việt. Mô hình này được huấn luyện trên dataset chứa các mẫu văn bản tiếng Việt được gán nhãn.

• File real_ai_server.py: Server AI chính sử dụng mô hình PhoBERT thực tế để phân loại nội dung.

• File enhanced_mock_server.py: Server AI mock sử dụng từ khóa để phát hiện nhanh trong quá trình phát triển.

• Dataset huấn luyện: Bộ dữ liệu chứa các mẫu văn bản tiếng Việt được gán nhãn (độc hại/không độc hại).

2.4.3 Giải pháp đề xuất

Để giải quyết bài toán phân loại ngôn từ độc hại tiếng Việt, việc sử dụng mô hình PhoBERT (Vietnamese BERT) là sự lựa chọn hợp lý vì:

- Hiểu ngữ cảnh: PhoBERT có thể hiểu được ngữ cảnh và ý nghĩa của câu, không chỉ dựa vào từ khóa đơn lẻ
- Xử lý tiếng Việt: Được pre-train trên corpus tiếng Việt lớn, hiểu được đặc thù ngôn ngữ Việt
- Transfer Learning: Có thể fine-tune cho bài toán cụ thể với ít dữ liệu hơn
- Phát hiện ngôn từ ẩn: Có khả năng phát hiện ngôn từ độc hại được ngụy trang hoặc viết tắt

Mô hình được fine-tune từ PhoBERT base với:
- Input: Văn bản tiếng Việt (tối đa 256 tokens)
- Output: Xác suất phân loại (0: không độc hại, 1: độc hại)
- Architecture: BERT + Classification Head

2.4.4 Khởi tạo và chuẩn bị dữ liệu

Bộ dữ liệu được sử dụng để huấn luyện mô hình phát hiện ngôn từ độc hại tiếng Việt. Tập dữ liệu được thu thập từ nhiều nguồn và được gán nhãn thủ công.

Cấu trúc dữ liệu:
{
    "text": "Nội dung văn bản tiếng Việt",
    "label": 0 hoặc 1 (0: không độc hại, 1: độc hại),
    "source": "Nguồn dữ liệu",
    "confidence": "Mức độ tin cậy của nhãn"
}

Các thuộc tính của tập dữ liệu:
- 'text': Nội dung văn bản cần phân loại
- 'label': Nhãn phân loại (0: sạch, 1: độc hại)
- 'source': Nguồn gốc của dữ liệu (social media, forum, etc.)
- 'confidence': Mức độ tin cậy của việc gán nhãn

Phân bố dữ liệu:
- Tổng số mẫu: ~10,000 samples
- Tỷ lệ độc hại/không độc hại: 30%/70%
- Độ dài trung bình: 50-100 từ

## 2.4.5 Quá trình tiền xử lý dữ liệu

Sau khi có bộ dữ liệu, quá trình tiền xử lý dữ liệu là bước quan trọng để chuẩn bị dữ liệu cho việc huấn luyện mô hình PhoBERT. Các bước tiền xử lý bao gồm:

### 1. Làm sạch dữ liệu văn bản:
- **Chuẩn hóa Unicode**: Chuyển đổi các ký tự đặc biệt về dạng chuẩn
- **Loại bỏ HTML tags**: Xóa các thẻ HTML nếu có
- **Xử lý emoji**: Chuyển đổi emoji thành text hoặc loại bỏ
- **Chuẩn hóa khoảng trắng**: Loại bỏ khoảng trắng thừa

### 2. Tokenization với PhoBERT:
- **Sử dụng PhoBERT Tokenizer**: Chia văn bản thành các subword tokens
- **Xử lý độ dài**: Cắt ngắn hoặc padding để đạt độ dài cố định (256 tokens)
- **Special tokens**: Thêm [CLS], [SEP] tokens theo chuẩn BERT

### 3. Xử lý nhãn:
- **Label encoding**: Chuyển đổi nhãn thành số (0, 1)
- **Class balancing**: Cân bằng tỷ lệ các lớp nếu cần thiết
- **Validation split**: Chia dữ liệu train/validation (80%/20%)

### 4. Chuẩn hóa và kiểm tra chất lượng:
- **Loại bỏ duplicate**: Xóa các mẫu trùng lặp
- **Kiểm tra nhãn**: Xác minh tính chính xác của nhãn
- **Outlier detection**: Phát hiện và xử lý các mẫu bất thường

```python
# Ví dụ tiền xử lý
def preprocess_text(text):
    # Chuẩn hóa Unicode
    text = unicodedata.normalize('NFC', text)
    
    # Loại bỏ HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Chuẩn hóa khoảng trắng
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

# Tokenization với PhoBERT
tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base")
encoded = tokenizer(
    text,
    max_length=256,
    padding='max_length',
    truncation=True,
    return_tensors='pt'
)
```

Sau khi tiền xử lý dữ liệu hoàn tất, bộ dữ liệu sẽ trở nên sạch sẽ, có cấu trúc và sẵn sàng cho việc huấn luyện mô hình PhoBERT. Nó cung cấp nền tảng cho việc fine-tuning mô hình để đưa ra các dự đoán chính xác về ngôn từ độc hại.

## 2.4.6 Vector hóa dữ liệu với PhoBERT

Sau khi tiền xử lý dữ liệu, quá trình vector hóa sử dụng PhoBERT tokenizer và model để chuyển đổi văn bản thành các vector số học:

### Input Processing:
- **Input IDs**: Mảng chứa ID của các tokens sau khi tokenize
- **Attention Mask**: Mảng binary chỉ định tokens nào cần attention (1) và padding nào bỏ qua (0)
- **Token Type IDs**: Phân biệt các câu khác nhau (không sử dụng trong bài toán này)

### PhoBERT Encoding:
```python
# Vector hóa với PhoBERT
inputs = tokenizer(
    texts,
    max_length=256,
    padding=True,
    truncation=True,
    return_tensors='pt'
)

# Đầu ra từ PhoBERT
with torch.no_grad():
    outputs = model(**inputs)
    embeddings = outputs.last_hidden_state  # [batch_size, seq_len, hidden_size]
    pooled_output = outputs.pooler_output    # [batch_size, hidden_size]
```

### Output Representation:
- **Sequence embeddings**: Vector 768 chiều cho mỗi token
- **Pooled output**: Vector 768 chiều đại diện cho toàn bộ câu
- **Classification logits**: Vector 2 chiều cho phân loại binary

Quá trình này tạo ra các vector đặc trưng phong phú, chứa thông tin ngữ nghĩa sâu sắc của văn bản tiếng Việt, phục vụ cho việc phân loại ngôn từ độc hại chính xác.
