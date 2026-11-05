# VisionEase – Prototype website (HTML5 + CSS3 + JavaScript thuần)

Mở `index.html` trực tiếp bằng trình duyệt hoặc dùng Live Server. Không cần backend/database; dữ liệu giỏ hàng, đơn hàng, lịch hẹn, câu hỏi được lưu tạm bằng `localStorage`.

## Cấu trúc
- `index.html` Trang chủ · `gioi-thieu.html` Giới thiệu & chính sách · `san-pham.html` Danh sách + lọc/sắp xếp/tìm kiếm
- `chi-tiet-san-pham.html?id=…` Chi tiết (biến thể, tồn kho theo cửa hàng, đánh giá, mua kèm)
- `hoi-dap.html` Góc hỏi đáp (trợ lý ảo → đánh giá hữu ích → ticket chuyển bác sĩ/dược sĩ/CSKH)
- `mat-khoe.html` Mắt khỏe mỗi ngày · `dat-lich.html` Đặt lịch + Google Maps · `tai-khoan.html` Hồ sơ, đơn hàng, lịch hẹn, điểm thưởng
- `css/style.css` · `js/data.js` (dữ liệu mẫu) · `js/script.js` (giao diện + tương tác) · `assets/images`, `assets/icons`

## Gợi ý khi demo
- Mã ưu đãi: `VISION10` (giảm 10%), `FREESHIP`. OTP demo: `123456`. Tích điểm: 1 điểm / 10.000₫; 1 điểm = 500₫ khi dùng.
- Muốn viết đánh giá: đăng nhập → đặt đơn có sản phẩm đó → quay lại trang sản phẩm (chỉ khách đã mua mới đánh giá).
- Trong "Tài khoản → Đơn hàng" có nút mô phỏng cập nhật trạng thái đơn (để thấy tích điểm khi đơn hoàn tất).
- Trong Góc hỏi đáp: bấm "Không hữu ích" để thấy hệ thống phân tích từ khoá và tạo ticket, sau đó "Mô phỏng chuyên gia trả lời".
- Bản đồ Google Maps trong trang Đặt lịch cần có internet.
- Dữ liệu sản phẩm, đánh giá, cửa hàng là dữ liệu minh họa cho môn học.


## Phiên bản 2 – cập nhật
- JS tách module: `data.js`, `ui.js` (toast/modal/menu/định dạng), `cart.js` (giỏ hàng, đăng nhập, thanh toán 3 bước), `products.js` (tìm/lọc/sắp xếp/chi tiết), `support.js` (trợ lý ảo, hỏi đáp, bài viết, đặt lịch, tài khoản), `admin.js`, `main.js`.
- Trang mới: `gio-hang.html` (giỏ hàng → thông tin & nhận hàng → thanh toán & xác nhận; khách vãng lai được mua), `quan-tri.html` (demo phân quyền: Quản lý OTP 123456 / Nhân viên / Bác sĩ-Dược sĩ).
- Dữ liệu chỉ lưu trong localStorage của trình duyệt, không có backend.
