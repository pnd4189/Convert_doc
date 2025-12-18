**Báo cáo nghiên cứu: Xử lý hình ảnh bìa trong trình duyệt**

**1. Canvas API để thay đổi kích thước và cắt ảnh trong trình duyệt:**
   - HTML Canvas API cung cấp khả năng xử lý hình ảnh mạnh mẽ trong trình duyệt.
   - `drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)` là phương thức chính để vẽ hình ảnh lên canvas, cho phép thay đổi kích thước và cắt ảnh.
   - Để thay đổi kích thước, bạn có thể vẽ toàn bộ hình ảnh nguồn (`image`) vào một kích thước đích (`dWidth`, `dHeight`) trên canvas.
   - Để cắt ảnh, bạn chỉ định một vùng nguồn (`sx, sy, sWidth, sHeight`) từ hình ảnh gốc và vẽ nó lên canvas.

**2. Tỷ lệ khung hình tốt nhất cho bìa e-reader (Kindle, Kobo, v.v.):**
   - Tỷ lệ khung hình 5:8 (hoặc 1:1.6) là tỷ lệ được chấp nhận rộng rãi và khuyên dùng cho bìa sách điện tử.
   - Tỷ lệ này đảm bảo hiển thị tối ưu trên hầu hết các thiết bị đọc sách điện tử như Kindle, Kobo và các ứng dụng đọc sách khác.

**3. Kích thước bìa được đề xuất (mục tiêu: 1600x2560px):**
   - Kích thước 1600x2560px tuân thủ chính xác tỷ lệ 5:8 (1600/2560 = 0.625, tương đương 5/8).
   - Kích thước này cung cấp độ phân giải cao, đảm bảo hình ảnh sắc nét trên các màn hình e-reader hiện đại và retina.
   - Amazon Kindle Direct Publishing (KDP) khuyến nghị hình ảnh có chiều cao ít nhất 2500px và tỷ lệ khung hình 1:1.6.

**4. Thuật toán cắt giữa để duy trì tỷ lệ 5:8:**
   - Mục tiêu là lấy một phần của hình ảnh gốc có tỷ lệ 5:8 và căn giữa.
   - **Tỷ lệ mong muốn:** `target_ratio = 5 / 8 = 0.625`
   - **Tỷ lệ hình ảnh gốc:** `source_ratio = original_width / original_height`
   - **Nếu `source_ratio > target_ratio` (ảnh gốc rộng hơn mục tiêu):**
     - Chiều cao của vùng cắt: `crop_height = original_height`
     - Chiều rộng của vùng cắt: `crop_width = original_height * target_ratio`
     - Tọa độ x bắt đầu của vùng cắt: `crop_x = (original_width - crop_width) / 2`
     - Tọa độ y bắt đầu của vùng cắt: `crop_y = 0`
   - **Nếu `source_ratio < target_ratio` (ảnh gốc cao hơn mục tiêu):**
     - Chiều rộng của vùng cắt: `crop_width = original_width`
     - Chiều cao của vùng cắt: `crop_height = original_width / target_ratio`
     - Tọa độ x bắt đầu của vùng cắt: `crop_x = 0`
     - Tọa độ y bắt đầu của vùng cắt: `crop_y = (original_height - crop_height) / 2`
   - Sau khi xác định `crop_x, crop_y, crop_width, crop_height`, sử dụng `drawImage` để vẽ vùng này lên canvas và thay đổi kích thước thành 1600x2560px.

**5. Cài đặt chất lượng JPEG và tối ưu hóa kích thước tệp:**
   - Phương thức `canvas.toDataURL('image/jpeg', quality)` cho phép xuất hình ảnh canvas dưới dạng JPEG với mức chất lượng (`quality`) từ 0 (nén tối đa, chất lượng thấp nhất) đến 1 (chất lượng cao nhất, ít nén nhất).
   - Mức chất lượng từ 0.7 đến 0.8 thường cung cấp sự cân bằng tốt giữa chất lượng hình ảnh và kích thước tệp, phù hợp cho bìa sách điện tử.
   - Các phương pháp tối ưu hóa khác bao gồm:
     - Giảm kích thước nếu không cần độ phân giải cao hơn 1600x2560px.
     - Sử dụng công cụ tối ưu hóa hình ảnh (phía máy chủ hoặc thông qua thư viện JavaScript) để nén thêm (ví dụ: giảm metadata).

**6. Xử lý các định dạng đầu vào khác nhau (PNG, JPG, WebP):**
   - Canvas API có thể đọc và xử lý nhiều định dạng hình ảnh phổ biến mà trình duyệt hỗ trợ.
   - Để xử lý hình ảnh, bạn tạo một đối tượng `Image`, đặt `src` của nó thành URL hoặc Data URL của hình ảnh đầu vào, sau đó chờ sự kiện `onload`.
   - Khi hình ảnh đã tải, bạn có thể vẽ nó lên canvas bằng `drawImage`.
   - Đầu ra có thể được định dạng thành JPEG bằng `toDataURL('image/jpeg', quality)` bất kể định dạng đầu vào.

**Câu hỏi chưa được giải quyết:**
- Đánh giá các thư viện JavaScript phổ biến như Cropper.js hoặc Fabric.js để xem chúng có thể đơn giản hóa quá trình này như thế nào và liệu chúng có thêm quá nhiều kích thước/phụ thuộc vào dự án hay không.
- Xác định ngưỡng hiệu suất cho xử lý hình ảnh phía máy khách và khi nào nên xem xét xử lý phía máy chủ cho các tệp rất lớn hoặc số lượng lớn.
- Phân tích các giới hạn của trình duyệt đối với kích thước canvas và bộ nhớ khi xử lý hình ảnh có độ phân giải cực cao.