# Khai báo sử dụng AI để thực hiện prototype

## 1. Google Stitch dùng phác thảo giao diện

Nhóm sử dụng **Google Stitch** để hỗ trợ phác thảo giao diện prototype ban đầu dựa trên yêu cầu và định hướng thiết kế của nhóm.

**Mục đích sử dụng:** Phác thảo bố cục, cấu trúc và giao diện ban đầu của website, tạo các hình ảnh mẫu sản phẩm cho vào folder images 

**Link kết quả:**  
https://stitch.withgoogle.com/projects/8663298891009346782
---

## 2. Claude Code hỗ trợ xây dựng website đủ mã html, css và file data demo
Nhóm đính kèm file yêu cầu chức năng và phi chức năng (đã đính trong phụ lục) để yêu cầu claude tinh chỉnh phần code tải về từ Stitch và hoàn thiện thêm giao diện, bổ sung json

### Prompt sử dụng

```text
Tôi sẽ cung cấp cho bạn **file ZIP chứa toàn bộ source code prototype website VisionEase hiện tại**.

Hãy làm việc trực tiếp trên project hiện có. **Không xây lại project từ đầu nếu không cần thiết.** Hãy đọc và hiểu toàn bộ code trước khi chỉnh sửa.

## 1. Công nghệ bắt buộc

Project chỉ được sử dụng:

- HTML5
- CSS3
- JavaScript thuần (Vanilla JavaScript)

Không sử dụng:

- React
- Vue
- Angular
- Bootstrap
- Tailwind CSS
- jQuery
- Các UI framework/library bên ngoài

Không cần backend và database.

---

# 2. Nhiệm vụ chính

Hãy thực hiện theo thứ tự:

### Bước 1 - Audit project

Đọc toàn bộ:

- HTML
- CSS
- JavaScript hiện có
- Assets
- Images
- Các trang hiện có
- Cấu trúc thư mục

Sau đó xác định:

- Lỗi HTML.
- Lỗi CSS.
- Lỗi JavaScript.
- Layout bị vỡ.
- Responsive chưa tốt.
- Element bị lệch.
- Button không hoạt động.
- Link sai.
- Animation/transition bị lỗi.
- UI không đồng nhất.
- Code trùng lặp hoặc khó bảo trì.
- Những chức năng đang có nhưng chưa hoàn thiện.

**Không được tự ý xóa những chức năng đang hoạt động tốt.**

---

# 3. Sửa toàn bộ lỗi hiện có

Hãy sửa trực tiếp các lỗi tìm thấy.

Ưu tiên:

### Layout
- Căn chỉnh spacing.
- Container.
- Grid.
- Flexbox.
- Card.
- Header.
- Footer.
- Product detail.
- Button.
- Form.

### Responsive

Kiểm tra tối thiểu:

- 360px
- 768px
- 1024px
- 1440px

Không được để:

- Horizontal overflow.
- Text bị tràn.
- Image bị méo.
- Button bị vỡ.
- Card có chiều cao bất hợp lý.
- Navigation bị chồng lên nhau.

---

# 4. Cải thiện UI/UX

Giữ nguyên nhận diện VisionEase nhưng làm giao diện chuyên nghiệp và hiện đại hơn.

Phong cách:

- Clean
- Modern
- Healthcare / Eye-care
- E-commerce
- Premium nhưng không quá cầu kỳ

Màu chủ đạo:

- Primary: `#165B9F`
- Dark blue: `#0D477F`
- Secondary blue: `#2978B7`
- Light blue: `#C1E1F9`
- Very light blue: `#F6FBFF`
- Accent cyan: `#83E2E9`

Không sử dụng quá nhiều màu.

Giữ typography thống nhất.

---

# 5. Cải thiện animation và interaction

Đây là phần quan trọng.

Hãy kiểm tra và cải thiện toàn bộ hiệu ứng hiện có.

## Header

Thêm/cải thiện:

- Sticky header nếu phù hợp.
- Transition khi scroll.
- Hover state.
- Dropdown animation.
- Mobile menu animation.

## Button

Tạo:

- Hover.
- Active.
- Focus.
- Disabled.

Animation nhẹ, không quá nhanh.

## Product card

Khi hover:

- Image zoom nhẹ.
- Card nâng nhẹ.
- Shadow thay đổi.
- Button/action xuất hiện hoặc highlight nếu phù hợp.

Không được làm animation quá mạnh.

## Product image

Có transition mượt khi:

- Hover.
- Đổi ảnh.
- Chọn thumbnail.

## Cart

Khi thêm sản phẩm:

- Hiển thị feedback.
- Có animation nhỏ.
- Cập nhật cart count.

## Modal

Nếu project có modal:

- Fade in.
- Scale nhẹ.
- Overlay.
- Đóng bằng nút X.
- Có thể đóng bằng ESC.

## Toast notification

Tạo reusable toast notification.

Ví dụ:

- “Đã thêm sản phẩm vào giỏ hàng”
- “Đã xoá sản phẩm”
- “Đã cập nhật giỏ hàng”
- “Đặt hàng thành công”

Toast phải có animation:

`slide-in → display → slide-out`

---

# 6. Tạo JavaScript mẫu hoàn chỉnh

Nếu project hiện tại chưa có JS hoặc JS chưa hoàn chỉnh, hãy tạo:

```text
js/
├── main.js
├── products.js
├── cart.js
├── ui.js
└── data.js


Nếu project nhỏ và việc chia file như trên làm phức tạp không cần thiết, có thể dùng:

```text
js/
└── script.js
```

Ưu tiên cấu trúc đơn giản nhưng dễ mở rộng.

---

# 7. Mock product data

Tạo sẵn dữ liệu mẫu bằng JavaScript.

Ví dụ:

```js
const products = [
    {
        id: 1,
        name: "VisionEase Blue Light Glasses",
        price: 650000,
        category: "blue-light-glasses",
        artist: null,
        image: "assets/images/product-01.jpg",
        images: [
            "assets/images/product-01.jpg",
            "assets/images/product-01-2.jpg"
        ],
        rating: 4.8,
        stock: 20,
        description: "..."
    }
];
```

Lưu ý:

- `price` phải là number.
- Không lưu `"650.000đ"` trong data.
- Có thể dùng `Intl.NumberFormat('vi-VN')` để format giá khi render.

---

# 8. Tạo JS mẫu cho Product

Tạo các function mẫu:

```js
renderProducts()
renderProductDetail()
filterProducts()
searchProducts()
sortProducts()
```

Có thể mở rộng tùy cấu trúc project hiện tại.

---

# 9. Tạo JS mẫu cho Cart

Tạo prototype cart bằng `localStorage`.

Các function:

```js
addToCart(productId)
removeFromCart(productId)
updateCartQuantity(productId, quantity)
getCart()
saveCart()
renderCart()
getCartTotal()
updateCartCount()
```

Khi reload trang, cart vẫn được giữ.

---

# 10. Tạo JS mẫu cho UI

Tạo reusable functions:

```js
showToast(message, type)
openModal(id)
closeModal(id)
toggleMobileMenu()
formatPrice(price)
```

Ví dụ:

```js
showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
```

---

# 11. Tạo interaction mẫu

Đảm bảo prototype có thể demo được:

### Search

Người dùng nhập keyword → danh sách sản phẩm thay đổi.

### Filter

Lọc theo:

- Category.
- Price.
- Rating.

### Sort

- Mới nhất.
- Giá thấp → cao.
- Giá cao → thấp.
- Bán chạy.

### Cart

- Add.
- Remove.
- Increase quantity.
- Decrease quantity.
- Calculate subtotal.
- Calculate total.

### Product detail

- Gallery.
- Thumbnail.
- Quantity.
- Add to cart.

### Mobile menu

Open / close.

### Modal

Open / close.

### Toast

Hiển thị feedback.

---

# 12. Tạo loading / empty / error state

Đừng chỉ thiết kế trạng thái bình thường.

Tạo UI mẫu cho:

### Loading

Skeleton hoặc loading indicator.

### Empty

Ví dụ:

> “Chưa có sản phẩm nào trong giỏ hàng.”

CTA:

**Tiếp tục mua sắm**

### Search empty

> “Không tìm thấy sản phẩm phù hợp.”

### Error

Ví dụ:

> “Có lỗi xảy ra. Vui lòng thử lại.”

---

# 13. Accessibility

Kiểm tra:

- `alt` cho image.
- `label` cho input.
- Button dùng `<button>` thay vì `<div>`.
- Keyboard focus.
- Focus state.
- Semantic HTML.
- ARIA chỉ dùng khi thực sự cần.

---

# 14. Code quality

Sau khi sửa:

- Không để JS error trong console.
- Không để broken image.
- Không để broken link.
- Không để CSS dư thừa rõ ràng.
- Không tạo duplicate ID.
- Không hard-code cùng một dữ liệu ở nhiều nơi nếu có thể dùng JS data.
- Không dùng inline CSS nếu không cần.
- Không dùng inline JavaScript.

Comment những phần quan trọng.

---

# 15. Không phá vỡ project hiện tại

Đặc biệt:

- Không xóa assets đang được sử dụng.
- Không đổi tên file hàng loạt nếu không cần.
- Không đổi cấu trúc URL nếu đang có link hoạt động.
- Không thay đổi nội dung thương hiệu nếu không cần.
- Không thay thế toàn bộ giao diện bằng một template khác.

Nếu cần refactor lớn, hãy ưu tiên **giữ lại chức năng và nội dung hiện có**.

---

# 16. Kiểm tra cuối cùng

Sau khi hoàn thành, hãy tự kiểm tra:

### HTML
- Semantic.
- Không lỗi cấu trúc.

### CSS
- Responsive.
- Không overflow.
- Animation hoạt động.

### JavaScript
- Không console error.
- Search hoạt động.
- Filter hoạt động.
- Cart hoạt động.
- LocalStorage hoạt động.
- Modal hoạt động.
- Toast hoạt động.
- Mobile menu hoạt động.

### UI
Kiểm tra ở:

- 360px
- 768px
- 1024px
- 1440px

---

# 17. Cách làm việc

Không cần hỏi tôi từng bước nếu có thể tự quyết định dựa trên code hiện tại.

Quy trình:

**Đọc project → Audit → Sửa lỗi → Cải thiện UI → Thêm animation → Bổ sung JS mẫu → Test → Fix lần cuối.**

Sau khi hoàn thành, báo cáo ngắn gọn:

1. Những lỗi đã sửa.
2. Những UI/animation đã cải thiện.
3. Những file đã tạo/chỉnh sửa.
4. Những JavaScript interaction đã thêm.
5. Những phần nào vẫn là mock/prototype và chưa có backend.

Quan trọng nhất:

**Hãy ưu tiên làm cho project hiện tại chạy ổn định và đẹp hơn trước, sau đó mới bổ sung chức năng.**
## NGUYÊN TẮC QUAN TRỌNG VỀ SCOPE VÀ GIAO DIỆN

Project hiện tại có thể chứa một số thành phần giao diện, hiệu ứng hoặc chức năng được tạo ra từ Stitch nhưng **không nhất thiết đều nằm trong phạm vi prototype mà nhóm mong muốn**.

Vì vậy, KHÔNG được mặc định giữ lại tất cả những gì đang có.

Hãy đánh giá từng thành phần theo thứ tự ưu tiên:

### Ưu tiên 1 - NFR là tiêu chí bắt buộc

Các yêu cầu trong file **VisionEase_FR_NFR.xlsx**, đặc biệt là phần **NFR (Non-Functional Requirements)**, phải được xem là **nguồn yêu cầu chính để quyết định giao diện và chất lượng hệ thống**.

Ưu tiên đảm bảo:

- Usability.
- Performance.
- Responsive.
- Accessibility.
- Security ở mức phù hợp với prototype.
- Reliability.
- Maintainability.
- Consistency.
- Khả năng sử dụng trên các kích thước màn hình khác nhau.
- Các yêu cầu về UI/UX được quy định trong NFR.

Nếu một hiệu ứng hoặc thành phần giao diện làm đẹp website nhưng làm ảnh hưởng đến NFR thì **ưu tiên NFR và loại bỏ hoặc tiết chế hiệu ứng đó**.

### Ưu tiên 2 - Chức năng cần thiết
Lưu ý phần map chỉ show chi nhánh ở HCM
Giữ lại các thành phần phục vụ trực tiếp cho:

- User flow.
- E-commerce flow.
- Product discovery.
- Product detail.
- Cart.
- Checkout.
- Account.
- Appointment.
- Q&A / Support.
- Admin management.

Không thêm chức năng chỉ vì “có thể làm”.

### Ưu tiên 3 - Thẩm mỹ

Đối với các thành phần do Stitch tự tạo:

**Giữ lại nếu:**
- Đẹp.
- Hợp với VisionEase.
- Giúp UX tốt hơn.
- Không làm giao diện rối.
- Không ảnh hưởng performance.
- Không làm tăng complexity không cần thiết.
- Không mâu thuẫn với NFR.

**Tiết chế hoặc loại bỏ nếu:**
- Chỉ mang tính trang trí.
- Không có tác dụng rõ ràng với người dùng.
- Animation quá nhiều.
- Có quá nhiều section.
- Có quá nhiều card/widget.
- Có dashboard/chart không cần thiết.
- Có popup/modal không cần thiết.
- Có hiệu ứng chuyển động quá mạnh.
- Có chức năng vượt quá scope prototype.
- Làm người dùng khó tập trung vào chức năng chính.

---

## NGUYÊN TẮC “LESS BUT BETTER”

Không cố gắng làm website thật nhiều chức năng để trông “xịn”.

Mục tiêu là:

**Ít thành phần hơn nhưng mỗi thành phần đều có lý do tồn tại.**

Nếu phải lựa chọn giữa:

> Một giao diện nhiều hiệu ứng nhưng phức tạp

và

> Một giao diện đơn giản, rõ ràng, responsive, dễ sử dụng và đáp ứng NFR

→ **Luôn chọn phương án thứ hai.**

Không tự ý thêm:
- Animation phức tạp.
- Parallax.
- 3D.
- Video background.
- Excessive glassmorphism.
- Các section marketing không cần thiết.
- Các widget trang trí.
- Các biểu đồ không phục vụ requirement.
- Các chức năng AI chỉ để làm website trông hiện đại.

---

## NGUYÊN TẮC GIỮ / BỎ

Trước khi thêm hoặc giữ một thành phần UI, hãy tự hỏi:

1. Thành phần này có phục vụ requirement không?
2. Có giúp user hoàn thành task không?
3. Có liên quan đến NFR không?
4. Có cải thiện usability không?
5. Có làm giao diện rõ ràng hơn không?
6. Có làm performance hoặc maintainability xấu đi không?

Nếu câu trả lời chủ yếu là **không** → loại bỏ.

Nếu thành phần có giá trị thẩm mỹ nhưng không cần thiết → **giữ ở mức tối giản**.

Nếu thành phần vừa hữu ích vừa phù hợp NFR → **ưu tiên giữ lại**.

---

## QUAN TRỌNG

Không được hiểu yêu cầu này là phải làm giao diện “đơn giản một cách sơ sài”.

Hãy giữ những điểm sáng tạo của Stitch **nếu chúng thực sự làm UI tốt hơn**, nhưng phải tiết chế.

Mục tiêu cuối cùng:

**NFR → Usability → Core functionality → Consistency → Visual polish**

Không phải:

**Visual effects → nhiều tính năng → rồi mới kiểm tra requirement.**

Hãy coi file **VisionEase_FR_NFR.xlsx** là baseline để đánh giá project sau khi chỉnh sửa.
```

**Mục đích sử dụng:**

- Hỗ trợ tạo cấu trúc HTML cho các trang của website.
- Hỗ trợ xây dựng CSS dựa trên giao diện prototype.
- Hỗ trợ triển khai các thành phần và chức năng JavaScript cần thiết.
- Hỗ trợ điều chỉnh code theo yêu cầu về bố cục và trải nghiệm người dùng.

Code được sinh ra từ Claude Code được nhóm kiểm tra, chỉnh sửa và hoàn thiện trước khi sử dụng trong prototype.
```

## 3. GitHub Copilot dùng chỉnh sửa và hoàn thiện code trong VS Code

Sau khi tải code ban đầu từ Claude, nhóm tiếp tục sử dụng **GitHub Copilot trong Visual Studio Code** để hỗ trợ chỉnh sửa trực tiếp trên mã nguồn của prototype.

Các tác vụ AI được sử dụng ở giai đoạn này bao gồm:

- Chỉnh sửa HTML/CSS/JavaScript theo yêu cầu của nhóm.
- Điều chỉnh bố cục và giao diện.
- Sửa lỗi code.
- Cải thiện cách triển khai một số thành phần.
- Hỗ trợ giải thích và đề xuất cách sửa code khi phát sinh vấn đề.

Lịch sử trao đổi với GitHub Copilot được nhóm export từ VS Code và lưu lại trong folder js/ dưới dạng file JSON để làm tài liệu minh chứng cho quá trình sử dụng AI.

**AI usage log:**  
`js/AI_USAGE.json`

---

