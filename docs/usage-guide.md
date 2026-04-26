# Hướng dẫn sử dụng Convert_doc

> Công cụ chuyển đổi tài liệu: TXT, DOCX, EPUB. Xử lý 100% trên trình duyệt, không cần server.

## Có 2 cách dùng

1. **Web UI** — Mở trình duyệt, thao tác bằng giao diện (4 tab)
2. **CLI (Python)** — Chạy lệnh trong terminal

---

## Cách 1: Web UI

Chạy dev server:

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`, chọn 1 trong 4 tab:

### Tab 1: Chuyển đổi & Tách file
- Upload file TXT hoặc DOCX
- Chọn pattern nhận diện chương (hoặc auto)
- Tách thành nhiều file nhỏ
- Tải về dạng ZIP

### Tab 2: Gộp file & EPUB
- Upload nhiều file TXT/DOCX
- Kéo thả để sắp xếp thứ tự
- Gộp lại thành 1 file TXT hoặc EPUB

### Tab 3: EPUB → DOCX/TXT
- Upload file EPUB
- Chọn định dạng output: DOCX hoặc Markdown
- Tải về

### Tab 4: DOCX/TXT → EPUB
- Upload file TXT hoặc DOCX
- Nhập tiêu đề, tác giả, dịch giả
- Thêm ảnh bìa (tự crop 1600x2560)
- Chọn font (nhúng font CJK nếu cần)
- Xem trước cấu trúc chương → Xuất EPUB

---

## Cách 2: CLI (Python)

### Cú pháp chung

```bash
~/.claude/skills/.venv/bin/python3 ~/.claude/skills/convert-doc/scripts/convert.py <lệnh> [tuỳ chọn]
```

---

### `convert` — Chuyển đổi định dạng

Chuyển giữa các định dạng: TXT, DOCX, EPUB, MD.

```bash
# TXT → DOCX
convert input.txt --to docx

# DOCX → TXT
convert input.docx --to txt -o output.txt

# Nhiều file cùng lúc
convert *.txt --to epub --batch
```

| Flag | Ý nghĩa | Mặc định |
|------|---------|----------|
| `--to FORMAT` | Định dạng output: `docx`, `txt`, `epub`, `md` | *bắt buộc* |
| `-o PATH` | Đường dẫn file output | tự đặt tên |
| `--batch` | Xử lý nhiều file (dùng glob `*`) | tắt |

---

### `split` — Tách file theo chương

Cắt 1 file lớn thành nhiều file nhỏ, mỗi file chứa N chương.

```bash
# Mỗi file 10 chương
split novel.txt -n 10 -o ./output/

# Tách ra file DOCX, mỗi file 5 chương
split novel.txt -n 5 --to docx
```

| Flag | Ý nghĩa | Mặc định |
|------|---------|----------|
| `-n N` | Số chương mỗi file | 10 |
| `-o DIR` | Thư mục output | thư mục hiện tại |
| `--to FORMAT` | Định dạng output: `txt` hoặc `docx` | txt |

---

### `merge` — Gộp nhiều file

```bash
merge file1.txt file2.txt file3.txt -o combined.txt
```

| Flag | Ý nghĩa | Mặc định |
|------|---------|----------|
| `-o PATH` | File output | *bắt buộc* |

---

### `detect` — Phát hiện chương

Xem danh sách chương trong file (tiêu đề + dòng bắt đầu/kết thúc).

```bash
# Auto-detect
detect novel.txt

# Chỉ định pattern
detect novel.txt --pattern-id chuong
detect novel.txt --pattern-id di-zhang
```

| Flag | Ý nghĩa | Mặc định |
|------|---------|----------|
| `--pattern-id ID` | Pattern nhận diện chương | auto |

---

### `epub-to-doc` — EPUB → DOCX/TXT

```bash
# Sang DOCX
epub-to-doc book.epub --format docx

# Sang TXT, lưu vào thư mục
epub-to-doc book.epub --format txt -o ./output/

# Nhiều file
epub-to-doc *.epub --format docx --batch
```

| Flag | Ý nghĩa | Mặc định |
|------|---------|----------|
| `--format` | Output: `docx` hoặc `txt` | docx |
| `-o DIR` | Thư mục output | thư mục hiện tại |
| `--batch` | Xử lý nhiều file | tắt |

---

### `doc-to-epub` — DOCX/TXT → EPUB

```bash
doc-to-epub novel.txt --title "Truyện Kiều" --author "Nguyễn Du" --cover bia.jpg

doc-to-epub novel.docx --title "Sách" --lang en
```

| Flag | Ý nghĩa | Mặc định |
|------|---------|----------|
| `--title` | Tiêu đề sách | tên file |
| `--author` | Tác giả | Unknown |
| `--translator` | Dịch giả | |
| `--cover` | Ảnh bìa (tự crop 1600x2560) | |
| `--lang` | Ngôn ngữ: `vi`, `en`, `zh` | vi |
| `-o PATH` | File EPUB output | tự đặt tên |
| `--batch` | Xử lý nhiều file | tắt |

---

### `txt-to-epub` — TXT → EPUB nâng cao

Lệnh mạnh nhất, hỗ trợ: auto encoding, cắt range chương, nhúng font CJK, tuỳ chọn pattern.

```bash
# Cơ bản
txt-to-epub novel.txt

# Cắt từ chương 5 đến chương 50
txt-to-epub novel.txt --start-chapter 5 --end-chapter 50

# Tiểu thuyết Trung Quốc, nhúng font CJK
txt-to-epub cn_novel.txt --pattern-id di-zhang-cn --embed-default-cjk-font --lang zh

# Dùng font riêng + Pandoc backend
txt-to-epub novel.txt --use-pandoc --embed-font custom.ttf --title "Tên sách"

# Pattern custom
txt-to-epub en_novel.txt --pattern "^Chapter \d+"
```

| Flag | Ý nghĩa | Mặc định |
|------|---------|----------|
| `--title` | Tiêu đề sách | tên file |
| `--author` | Tác giả | Unknown |
| `--translator` | Dịch giả | |
| `--cover` | Ảnh bìa | |
| `--lang` | Ngôn ngữ: `vi`, `en`, `zh` | vi |
| `--pattern REGEX` | Regex nhận diện chương custom | |
| `--pattern-id ID` | Pattern preset (xem bảng dưới) | auto |
| `--start-chapter N` | Bắt đầu từ chương N (0=all) | 0 |
| `--end-chapter M` | Kết thúc ở chương M (0=all) | 0 |
| `--encoding` | Encoding file input | auto |
| `--embed-font FILE` | Nhúng font TTF/OTF | |
| `--embed-default-cjk-font` | Nhúng font NotoSans SC đi kèm | tắt |
| `--use-pandoc` | Dùng Pandoc làm backend | tắt |
| `-o PATH` | File EPUB output | tự đặt tên |
| `--batch` | Xử lý nhiều file | tắt |

---

## Bảng Pattern IDs

Dùng với `--pattern-id` cho `detect` và `txt-to-epub`:

| ID | Nhận diện | Ví dụ |
|----|-----------|-------|
| `auto` | Tự detect tất cả pattern | |
| `chuong` | Chương + số | Chương 1, Chương 2 |
| `chuong-upper` | CHƯƠNG + số | CHƯƠNG 1 |
| `chapter` | Chapter + số | Chapter 1 |
| `chuong-roman` | Chương + La Mã | Chương I, Chương X |
| `chapter-roman` | Chapter + Roman | Chapter I |
| `chuong-vn-word` | Chương + số chữ | Chương Một, Chương Hai |
| `hoi` | Hồi + số | Hồi 1 |
| `hoi-thu` | Hồi thứ + số/chữ | Hồi thứ nhất |
| `quyen-chuong` | Quyển X Chương Y | Quyển 1 Chương 1 |
| `phan` | Phần + số | Phần 1 |
| `muc` | Mục + số | Mục 1 |
| `di-zhang` | 第X章 (số) | 第1章, 第100章 |
| `di-zhang-cn` | 第X章 (chữ Hán) | 第一章 |
| `juan` | 卷X (quyển) | 卷一 |
| `di-hui` | 第X回 (hồi) | 第一回 |
| `di-jie` | 第X节 (tiết) | 第一节 |
| `part` | Part + số | Part 1 |
| `book` | Book + số | Book 1 |
| `volume` | Volume + số | Volume 1 |
| `section` | Section + số | Section 1 |
| `episode` | Episode + số | Episode 1 |

---

## Ví dụ nhanh theo tình huống

| Muốn... | Lệnh |
|---------|------|
| TXT → DOCX | `convert file.txt --to docx` |
| DOCX → TXT | `convert file.docx --to txt` |
| Cắt truyện 100 chương, mỗi file 10 chương | `split truyen.txt -n 10` |
| Gộp 3 file txt | `merge a.txt b.txt c.txt -o out.txt` |
| EPUB → DOCX | `epub-to-doc book.epub --format docx` |
| TXT → EPUB có ảnh bìa | `doc-to-epub truyen.txt --title "Tên" --cover bia.jpg` |
| TXT Trung Quốc → EPUB | `txt-to-epub cn.txt --pattern-id di-zhang-cn --embed-default-cjk-font --lang zh` |
| Xem cấu trúc chương | `detect truyen.txt` |
| Chuyển chương 5-20 sang EPUB | `txt-to-epub truyen.txt --start-chapter 5 --end-chapter 20` |

---

## Lưu ý

- Tất cả xử lý trên máy local, file không upload lên server nào
- Encoding auto-detect hỗ trợ UTF-8, UTF-16, GBK, Big5, Shift-JIS...
- Ảnh bìa tự động crop về 1600x2560px
- `--use-pandoc` yêu cầu cài Pandoc trên máy
