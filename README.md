# 🎬 Hệ Thống Quản Lý Rạp Chiếu Phim (CMS)

## Mục lục

1.  [🌟 Tổng quan](#-tổng-quan)
2.  [✨ Các Tính năng Chính](#-các-tính-năng-chính)
3.  [⚙️ Công nghệ Sử dụng](#%EF%B8%8F-công-nghệ-sử-dụng)
4.  [📂 Cấu trúc Dự án](#-cấu-trúc-dự-án)
5.  [🚀 Bắt đầu](#-bắt-đầu)
    * [Điều kiện Tiên quyết](#điều-kiện-tiên-quyết)
    * [Tải và Cài đặt Composer](#tải-và-cài-đặt-composer)
    * [Thiết lập Frontend (Client)](#thiết-lập-frontend-client)
    * [Thiết lập Backend (Server)](#thiết-lập-backend-server)
6.  [🤝 Đóng góp](#-đóng-góp)

---

## 🌟 Tổng quan

**Hệ Thống Quản Lý Rạp Chiếu Phim (CMS)** là một ứng dụng full-stack được phát triển nhằm mục đích học tập và xây dựng kỹ năng. Hệ thống cung cấp các chức năng cốt lõi để quản lý lịch chiếu phim, đặt vé, và cung cấp trải nghiệm duyệt phim cho người dùng.

### 🔗 Mã nguồn và Triển khai

* **Kho lưu trữ GitHub:** [https://github.com/duy123450/cinema.git](https://github.com/duy123450/cinema.git)
* **Triển khai (Deployment):** [https://cinema-phi-five.vercel.app/](https://cinema-phi-five.vercel.app/)(infinityfree chặn không cho các đường dẫn ngoài trỏ vào)

## ✨ Các Tính năng Chính

Hệ thống được chia thành khu vực dành cho khách hàng và khu vực quản trị, với các chức năng chính sau:

### 👤 Khu vực Khách hàng (User Features)

* **Xem Phim & Chi tiết Phim:** Duyệt các bộ phim đang chiếu và sắp chiếu, xem thông tin chi tiết, nhân vật, diễn viên, và trailer.
* **Xem Lịch Chiếu (Showtimes):** Tra cứu lịch chiếu theo phim hoặc rạp hoặc ngày công chiếu.
* **Đặt Vé & Mua vé (Buy Tickets):** Quy trình đặt vé và thanh toán hoàn chỉnh, bao gồm chọn ghế, chọn bắp nước, chọn khuyến mãi.
* **Quản lý Tài khoản:** Đăng ký, Đăng nhập, Quên/Đặt lại mật khẩu, và quản lý hồ sơ.

### 🛠️ Khu vực Quản trị (Admin Panel)

* **Quản lý Phim:** Thêm, sửa, xóa phim, thêm diễn viên, nhân vật.
* **Quản lý Lịch Chiếu:** Thiết lập và điều chỉnh lịch chiếu.
* **Quản lý Đặt chỗ:** Theo dõi và quản lý các giao dịch đặt vé.
* **Quản lý Người dùng:** Xem và quản lý tài khoản người dùng.
* **Thống kê Cơ bản:** Xem các số liệu thống kê quản trị.

## ⚙️ Công nghệ Sử dụng

| Thành phần | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend** | ReactJS, SCSS (Sass) | Giao diện người dùng hiện đại, sử dụng hooks, contexts, và được tạo kiểu bằng SCSS Modules. |
| **Backend API** | PHP Thuần (Vanilla PHP) | Xử lý logic API RESTful, quản lý phiên và tương tác trực tiếp với cơ sở dữ liệu. |
| **Database** | MySQL | Cơ sở dữ liệu quan hệ, được cung cấp qua tệp `cinema_management.sql`. |
| **Quản lý Gói** | npm / Composer | npm cho frontend, Composer cho dependency PHP. |

---

## 📂 Cấu trúc Dự án

Dự án được phân chia rõ ràng thành hai thư mục chính (`client/` và `server/`):

* **`client/`** (Frontend - Ứng dụng React)
    * `public/` (Tài sản tĩnh: icon, manifest)
    * `src/`
        * `components/`: Các thành phần giao diện tái sử dụng (Header, Footer, MovieManagement, v.v.)
        * `contexts/`: Quản lý trạng thái toàn cục (AuthContext, ThemeContext)
        * `hooks/`: Các custom hook
        * `pages/`: Các trang chính của ứng dụng (Login, Admin, BuyTickets, MovieDetail, v.v.)
        * `services/`: Logic tương tác với API (`api.js`)
        * `styles/`: Các tệp SCSS chia nhỏ và tệp `main.scss`
* **`server/`** (Backend - API PHP)
    * `api/`: Tất cả các điểm cuối API PHP (`movies.php`, `bookings.php`, `login.php`, v.v.)
    * `config/`: Cấu hình kết nối cơ sở dữ liệu và email (`dbconnect.php`, `mail-config.php`)
    * `uploads/`: Nơi lưu trữ hình ảnh người dùng/avatar
    * `index.php`: Điểm vào chính của API
* **`cinema_management.sql`**: Tệp dump/backup cơ sở dữ liệu.

---

## 🚀 Bắt đầu

### Điều kiện Tiên quyết

Bạn cần cài đặt các phần mềm sau:

* **Node.js** (để chạy client/frontend)
* **WAMP Server** (hoặc XAMPP/MAMP) để chạy PHP và MySQL.
* **Composer** (để quản lý các thư viện PHP, nếu có).

### Tải và Cài đặt Composer

Composer là trình quản lý gói cho PHP, cần thiết để tải các dependency PHP.

1.  **Truy cập trang chủ:** [https://getcomposer.org/download/](https://getcomposer.org/download/)
2.  **Tải trình cài đặt:** Tải xuống tệp **`Composer-Setup.exe`**.
3.  **Cài đặt:** Chạy tệp cài đặt và **đảm bảo trỏ đến tệp `php.exe`** trong thư mục WAMP Server của bạn (ví dụ: `C:\wamp64\bin\php\php-8.x.x\php.exe`).
4.  **Kiểm tra:** Sau khi cài đặt, mở Command Prompt (CMD) hoặc PowerShell mới và gõ `composer`. Nếu cài đặt thành công, danh sách các lệnh sẽ hiện ra.

### Thiết lập Frontend (Client)

1.  **Di chuyển vào thư mục client:**
    ```bash
    cd client
    ```
2.  **Cài đặt các dependencies:**
    ```bash
    npm install
    ```
3.  **Khởi động ứng dụng React:**
    ```bash
    npm run dev 
    ```
    (Frontend sẽ thường chạy trên `http://localhost:5173`)

### Thiết lập Backend (Server)

1.  **Cài đặt Dependency PHP (nếu có):**
    ```bash
    cd ../server
    composer install
    ```

2.  **Thiết lập Cơ sở dữ liệu:**
    * **Khởi động WAMP Server** và truy cập vào **phpMyAdmin**.
    * Tạo một cơ sở dữ liệu MySQL trống.
    * Nhập tệp cấu trúc và dữ liệu cơ bản **`cinema_management.sql`** vào cơ sở dữ liệu mới tạo.

3.  **Đưa Code lên Máy chủ:**
    * Sao chép toàn bộ thư mục **`server/`** vào thư mục gốc của máy chủ web WAMP (thường là thư mục **`www`**). Ví dụ, bạn có thể đặt nó trong thư mục `cms-api`.

4.  **Cấu hình Kết nối:**
    * Chỉnh sửa tệp **`server/config/dbconnect.php`** với thông tin xác thực MySQL của WAMP Server (thường là User: `root`, Password: trống).

5.  **Chạy API:**
    * Đảm bảo các dịch vụ **Apache** và **MySQL** trong WAMP Server đang chạy.
    * Bạn có thể truy cập API thông qua trình duyệt, ví dụ: `http://localhost/cms-api/api/movies.php`

---

## 🤝 Đóng góp

Vì đây là một dự án học tập cá nhân, nếu bạn muốn đóng góp hoặc đề xuất cải tiến, bạn có thể:

1.  Fork kho lưu trữ này.
2.  Tạo một Issue để thảo luận về tính năng hoặc lỗi.
3.  Mở một Pull Request với các thay đổi của bạn.
