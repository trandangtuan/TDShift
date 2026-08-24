import type { ViewDefinition } from "@record-platform/core";

export const pageViews: ViewDefinition[] = [
  {
    technicalName: "website.page_home.view",
    name: "Home Page Content",
    model: "website.page",
    type: "page",
    contentType: "html",
    content: `
<section class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-10 lg:px-14">
  <div class="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
    <div>
      <p class="mb-4 inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">Record Platform</p>
      <h1 class="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Nền tảng quản trị dữ liệu linh hoạt cho doanh nghiệp hiện đại.</h1>
      <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Quản lý liên hệ, bán hàng, mua hàng, kho, trang web, người dùng và trợ lý AI trong một giao diện thống nhất, gọn gàng và dễ mở rộng.</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a class="rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800" href="/web">Mở ứng dụng</a>
        <a class="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-500 hover:text-teal-800" href="/features">Xem tính năng</a>
      </div>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div class="rounded-xl bg-slate-950 p-4 text-white shadow-xl">
        <div class="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <span class="font-semibold">Bảng điều khiển</span>
          <span class="rounded-full bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-300">Live</span>
        </div>
        <div class="grid gap-3">
          <div class="rounded-lg bg-white/8 p-3">
            <div class="text-xs uppercase text-slate-400">Dữ liệu</div>
            <div class="mt-1 font-mono text-sm">sale.order</div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <div class="rounded-lg bg-teal-500/15 p-3"><b>30</b><br><span class="text-slate-300">Bản ghi</span></div>
            <div class="rounded-lg bg-blue-500/15 p-3"><b>4</b><br><span class="text-slate-300">Giao diện</span></div>
            <div class="rounded-lg bg-violet-500/15 p-3"><b>AI</b><br><span class="text-slate-300">MCP</span></div>
          </div>
          <div class="rounded-lg bg-white p-3 text-slate-900">
            <div class="mb-2 text-xs font-bold uppercase text-slate-500">Bản ghi gần đây</div>
            <div class="flex items-center justify-between border-b border-slate-100 py-2"><span>Zenith Consulting</span><b>Active</b></div>
            <div class="flex items-center justify-between py-2"><span>SO0007</span><b>1,240,000 vnd</b></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="features" class="py-14">
  <div class="mb-8">
    <p class="text-sm font-bold uppercase tracking-wide text-teal-700">Tính năng hiện có</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Một ứng dụng quản trị có thể thay đổi theo cấu trúc dữ liệu của bạn.</h2>
  </div>
  <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Mô hình dữ liệu linh hoạt</h3>
      <p class="mt-3 text-slate-600">Danh sách, biểu mẫu, trang, hành động, menu và trường dữ liệu được cấu hình bằng metadata, giúp ứng dụng dễ mở rộng theo nhu cầu.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Bán hàng & liên hệ</h3>
      <p class="mt-3 text-slate-600">Quản lý khách hàng, sản phẩm, đơn bán hàng, dòng đơn hàng, tổng tiền tự tính và các quan hệ dữ liệu hiển thị rõ ràng.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Mua hàng & kho</h3>
      <p class="mt-3 text-slate-600">Theo dõi đơn mua, xác nhận nhập hàng, quản lý vị trí kho, lịch sử dịch chuyển và số lượng tồn theo từng sản phẩm.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Trợ lý AI kết nối dữ liệu</h3>
      <p class="mt-3 text-slate-600">Kết nối OpenRouter, OpenAI hoặc Claude để hỏi đáp trên dữ liệu thật, xem quá trình gọi công cụ và lưu lại lịch sử yêu cầu.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Danh sách dễ tìm kiếm</h3>
      <p class="mt-3 text-slate-600">Tìm kiếm nhanh, lọc theo từng cột, phân trang, cuộn bảng và hiển thị tên quan hệ mà không cần tải lại quá nhiều dữ liệu.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Quản lý website</h3>
      <p class="mt-3 text-slate-600">Xuất bản trang công khai, chỉnh nội dung HTML và quản lý menu website trực tiếp từ khu vực quản trị.</p>
    </article>
  </div>
</section>

<section class="rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10">
  <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
    <div>
      <p class="text-sm font-bold uppercase tracking-wide text-teal-300">Thiết kế cho vận hành</p>
      <h2 class="mt-2 text-3xl font-bold tracking-tight">Giao diện rõ ràng, tập trung và phù hợp cho công việc hằng ngày.</h2>
      <p class="mt-4 leading-7 text-slate-300">Ứng dụng hỗ trợ cài đặt, nâng cấp module, đồng bộ cấu trúc dữ liệu và bảo toàn cấu hình tùy chỉnh của người dùng.</p>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-2xl border border-white/10 bg-white/8 p-5"><b>Đăng nhập an toàn</b><p class="mt-2 text-sm text-slate-300">Hỗ trợ đăng nhập, đăng ký, quản lý người dùng và đặt lại token.</p></div>
      <div class="rounded-2xl border border-white/10 bg-white/8 p-5"><b>Nhật ký tạo/sửa</b><p class="mt-2 text-sm text-slate-300">Lưu người tạo, người cập nhật và thời gian thay đổi trên từng bảng dữ liệu.</p></div>
      <div class="rounded-2xl border border-white/10 bg-white/8 p-5"><b>Trường tự tính</b><p class="mt-2 text-sm text-slate-300">Tự tính tổng tiền, đường dẫn trang web và số lượng tồn kho từ dữ liệu nguồn.</p></div>
      <div class="rounded-2xl border border-white/10 bg-white/8 p-5"><b>Vòng đời module</b><p class="mt-2 text-sm text-slate-300">Làm mới, cài đặt, nâng cấp, gỡ module và đồng bộ schema một cách có kiểm soát.</p></div>
    </div>
  </div>
</section>

<section class="py-14">
  <div class="rounded-3xl border border-teal-200 bg-teal-50 px-6 py-10 text-center sm:px-10">
    <h2 class="text-3xl font-bold tracking-tight text-slate-950">Sẵn sàng quản lý dữ liệu của bạn?</h2>
    <p class="mx-auto mt-3 max-w-2xl text-slate-600">Mở ứng dụng để làm việc với module, bản ghi, giao diện, trợ lý AI và nội dung website trong cùng một nơi.</p>
    <a class="mt-7 inline-flex rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800" href="/web">Bắt đầu sử dụng</a>
  </div>
</section>
`,
    architecture: {
      type: "form",
      model: "website.page",
      children: []
    }
  },
  {
    technicalName: "website.page_features.view",
    name: "Features Page Content",
    model: "website.page",
    type: "page",
    contentType: "html",
    content: `
<section class="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10">
  <p class="text-sm font-bold uppercase tracking-wide text-teal-700">Trang tính năng</p>
  <h1 class="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Khám phá các tính năng đang có trong ứng dụng.</h1>
  <p class="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Ứng dụng được xây dựng để quản lý dữ liệu, vận hành nghiệp vụ và mở rộng tính năng theo module. Mỗi phần bên dưới mô tả rõ ứng dụng đang hỗ trợ gì và phù hợp cho tình huống nào.</p>
</section>

<section class="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
  <div class="grid gap-6">
    <article id="du-lieu" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-800">01</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Mô hình dữ liệu linh hoạt</h2>
      <p class="mt-3 leading-7 text-slate-600">Ứng dụng cho phép định nghĩa model, field, view, action và menu bằng metadata. Nhờ vậy giao diện danh sách, biểu mẫu và menu có thể thay đổi theo cấu trúc dữ liệu mà không cần viết lại toàn bộ màn hình.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Quản lý model và field kỹ thuật.</li>
        <li>Hỗ trợ list view, form view và page view.</li>
        <li>Field quan hệ many2one, one2many, json, boolean, số, ngày và văn bản.</li>
      </ul>
    </article>

    <article id="ban-hang" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">02</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Liên hệ, sản phẩm và bán hàng</h2>
      <p class="mt-3 leading-7 text-slate-600">Các module hiện có hỗ trợ quản lý danh bạ khách hàng, sản phẩm và đơn bán hàng. Dòng đơn hàng được nhập ngay trong form đơn, tổng tiền có thể tự tính từ dữ liệu dòng.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Danh sách liên hệ với email, điện thoại và trạng thái hoạt động.</li>
        <li>Sản phẩm có mã, giá bán và số lượng tồn tính toán.</li>
        <li>Đơn bán hàng có khách hàng, trạng thái, ngày đặt và tổng tiền.</li>
      </ul>
    </article>

    <article id="mua-hang-kho" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-violet-50 px-3 py-1 text-sm font-bold text-violet-800">03</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Mua hàng và quản lý kho</h2>
      <p class="mt-3 leading-7 text-slate-600">Module mua hàng và kho giúp theo dõi luồng nhập hàng, vị trí kho và dịch chuyển tồn kho. Khi xác nhận đơn mua, hệ thống có thể tạo stock move để cập nhật số lượng sản phẩm.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Đơn mua hàng và dòng đơn mua.</li>
        <li>Vị trí kho theo mục đích sử dụng.</li>
        <li>Dịch chuyển kho có trạng thái và nguồn gốc chứng từ.</li>
      </ul>
    </article>

    <article id="ai" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800">04</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Trợ lý AI kết nối dữ liệu</h2>
      <p class="mt-3 leading-7 text-slate-600">Ứng dụng có giao diện chat AI, hỗ trợ cấu hình OpenRouter, OpenAI hoặc Claude. AI có thể gọi công cụ MCP để đọc model, tìm bản ghi và trả lời dựa trên dữ liệu thật trong hệ thống.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Chat hiển thị Markdown và stream kết quả.</li>
        <li>Sidebar trace để xem trạng thái, tool call và kết quả tool.</li>
        <li>Lưu lịch sử request AI để kiểm tra lại.</li>
      </ul>
    </article>

    <article id="tim-kiem" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">05</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Danh sách, tìm kiếm và phân trang</h2>
      <p class="mt-3 leading-7 text-slate-600">List view được tối ưu để dùng hằng ngày: có tìm kiếm nhanh, lọc theo từng cột, phân trang, cuộn bảng và hiển thị nhãn của trường quan hệ ngay từ search_read để giảm số lượng request.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Search nhanh trên field hiển thị chính.</li>
        <li>Lọc theo từng cột cho các field được lưu trữ.</li>
        <li>many2one trả về id và tên hiển thị trong một lần đọc.</li>
      </ul>
    </article>

    <article id="website" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-800">06</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Website và trang công khai</h2>
      <p class="mt-3 leading-7 text-slate-600">Module website cho phép xuất bản trang công khai từ nội dung HTML lưu trong view. Menu website cũng được quản lý bằng dữ liệu, giúp việc thêm trang giới thiệu hoặc trang tính năng rất nhanh.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Trang chủ và trang tính năng công khai.</li>
        <li>Menu website có thứ tự, URL và trạng thái xuất bản.</li>
        <li>Nội dung trang có thể được quản lý như một bản ghi view.</li>
      </ul>
    </article>

    <article id="bao-mat" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-800">07</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Người dùng, audit và vòng đời module</h2>
      <p class="mt-3 leading-7 text-slate-600">Ứng dụng có đăng nhập, đăng ký, quản lý người dùng, audit fields và quy trình cài đặt/nâng cấp/gỡ module. Các thay đổi metadata từ code được đưa vào hệ thống thông qua thao tác module rõ ràng.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>JWT authentication và quản trị user.</li>
        <li>create_uid, write_uid, create_date, write_date trên bảng dữ liệu.</li>
        <li>Làm mới, cài đặt, nâng cấp và gỡ module.</li>
      </ul>
    </article>
  </div>

  <aside class="sticky top-24 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
    <p class="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Mục lục tính năng</p>
    <nav class="grid gap-1">
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#du-lieu">Mô hình dữ liệu</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#ban-hang">Bán hàng & liên hệ</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#mua-hang-kho">Mua hàng & kho</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#ai">Trợ lý AI</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#tim-kiem">Tìm kiếm</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#website">Website</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#bao-mat">Bảo mật & module</a>
    </nav>
  </aside>
</section>
`,
    architecture: {
      type: "form",
      model: "website.page",
      children: []
    }
  },
  {
    technicalName: "website.page.list",
    name: "Pages",
    model: "website.page",
    type: "list",
    architecture: {
      type: "list",
      model: "website.page",
      fields: ["name", "slug", "url", "title", "view_name", "is_published", "published_at", "active"]
    }
  },
  {
    technicalName: "website.page.form",
    name: "Page",
    model: "website.page",
    type: "form",
    architecture: {
      type: "form",
      model: "website.page",
      children: [
        {
          type: "group",
          children: [
            { type: "field", name: "name" },
            { type: "field", name: "slug" },
            { type: "field", name: "url" },
            { type: "field", name: "title" },
            { type: "field", name: "meta_description" },
            { type: "field", name: "view_name" },
            { type: "field", name: "is_published" },
            { type: "field", name: "published_at" },
            { type: "field", name: "active" }
          ]
        }
      ]
    }
  }
];
