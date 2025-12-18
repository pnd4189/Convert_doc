### Báo cáo nghiên cứu: Cấu trúc tệp EPUB và các phương pháp hay nhất để tạo EPUB trên trình duyệt

Báo cáo này tóm tắt cấu trúc tệp EPUB và các phương pháp hay nhất cho việc tạo EPUB dựa trên trình duyệt, tập trung vào sự khác biệt giữa EPUB 2.0 và 3.0, các tệp bắt buộc, cấu trúc đa chương, hình ảnh bìa, điều hướng TOC, và mã hóa nội dung tiếng Việt.

#### 1. Sự khác biệt cấu trúc EPUB 2.0 so với EPUB 3.0

*   **EPUB 2.0:** Dựa trên XHTML 1.1, CSS 2.0, DTBook cho khả năng tiếp cận. Sử dụng `toc.ncx` cho điều hướng.
*   **EPUB 3.0:** Dựa trên HTML5, CSS 3.0, MathML, SVG, hỗ trợ đa phương tiện (âm thanh/video) và JavaScript. Sử dụng phần tử `nav` trong tài liệu nội dung XHTML để điều hướng (thay thế `toc.ncx`). Cải thiện khả năng tiếp cận và hỗ trợ ngôn ngữ toàn cầu. Sử dụng `application/xhtml+xml` cho các tài liệu nội dung.

#### 2. Các tệp bắt buộc

*   `mimetype`: Luôn là tệp đầu tiên trong lưu trữ ZIP EPUB, không được nén và chứa chuỗi `application/epub+zip`.
*   `META-INF/container.xml`: Chỉ đến tệp `.opf` chính.
*   `OEBPS/content.opf` (Open Package Format): Tệp cốt lõi. Chứa siêu dữ liệu (tiêu đề, tác giả), manifest (danh sách tất cả các tệp trong EPUB), spine (thứ tự đọc tuyến tính), và guide (điểm ngữ nghĩa tùy chọn).
*   `OEBPS/toc.ncx`: Chỉ bắt buộc đối với EPUB 2.0. Định nghĩa mục lục phân cấp. (Không dùng nữa trong EPUB 3.0).

#### 3. Cấu trúc EPUB đa chương (XHTML riêng cho mỗi chương)

*   Thực tiễn tốt nhất là chia nội dung thành nhiều tệp XHTML, thường là một tệp cho mỗi chương hoặc phần chính. Điều này cải thiện hiệu suất hiển thị, đặc biệt trên các thiết bị cũ, và cho phép điều hướng tốt hơn.
*   Các tệp XHTML riêng lẻ này được liệt kê trong `manifest` và sắp xếp theo thứ tự trong `spine` của `content.opf`.

#### 4. Siêu dữ liệu và vị trí hình ảnh bìa (cover.xhtml, images/cover.jpg)

*   Hình ảnh bìa (ví dụ: `cover.jpg`) thường được đặt trong thư mục `images/` hoặc `OEBPS/images/`.
*   Một tệp XHTML riêng (ví dụ: `cover.xhtml`) được tạo để hiển thị hình ảnh bìa, chứa thẻ `<img>` liên kết đến hình ảnh.
*   Trong `content.opf`:
    *   **EPUB 3.0:** `cover.xhtml` được đánh dấu là `properties="cover-image"` trong manifest, và hình ảnh bìa có thể có `properties="cover"`.
    *   **EPUB 2.0:** Phần tử `meta` với `name="cover"` trong siêu dữ liệu sẽ trỏ đến `id` của hình ảnh trong manifest.

#### 5. Điều hướng TOC: Định dạng NCX so với phần tử nav của EPUB 3.0

*   **NCX (EPUB 2.0):** Một tệp XML (`toc.ncx`) định nghĩa mục lục phân cấp. Mỗi `navPoint` có `playOrder`, `label`, và `content src` trỏ đến một tệp XHTML và có thể là một neo trong đó.
*   **Phần tử `nav` của EPUB 3.0:** Thay thế NCX. Điều hướng được nhúng trực tiếp trong một tài liệu nội dung XHTML (thường là `toc.xhtml`) bằng cách sử dụng các phần tử HTML5 chuẩn `nav` và `ol`/`li`/`a`}$. `toc.xhtml` này sau đó được tham chiếu trong `spine` và `manifest` của `content.opf`, thường với `properties="nav"`.

#### 6. Các phương pháp hay nhất để mã hóa nội dung tiếng Việt

*   **Mã hóa:** Luôn sử dụng UTF-8. Đây là tiêu chuẩn cho nội dung web hiện đại và rất cần thiết để hiển thị đúng các ký tự tiếng Việt (dấu phụ, v.v.).
*   **Nhúng phông chữ:** Nhúng các phông chữ hỗ trợ ký tự tiếng Việt nếu sử dụng phông chữ tùy chỉnh hoặc nếu việc dựa vào phông chữ thiết bị không đáng tin cậy.
*   **Khai báo ngôn ngữ:** Khai báo ngôn ngữ trong `content.opf` (ví dụ: `<dc:language>vi</dc:language>`) và trong các tệp XHTML riêng lẻ (ví dụ: `<html lang="vi">`).

#### Câu hỏi chưa được giải quyết

*   Không có.