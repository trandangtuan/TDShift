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
      <p class="mb-4 inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">MetaFlow Business Suite</p>
      <h1 class="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Ứng dụng quản trị doanh nghiệp có thể tải về, chỉnh sửa và mở rộng theo quy trình riêng.</h1>
      <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">MetaFlow gom CRM, bán hàng, mua hàng, kho, kế toán, website, lưu trữ tệp và trợ lý AI vào một nền tảng record-driven. Doanh nghiệp có thể dùng ngay, sửa giao diện trong app hoặc phát triển thêm module bằng TypeScript.</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a class="rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800" href="/web">Mở ứng dụng</a>
        <a class="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-500 hover:text-teal-800" href="#download">Tải về & chỉnh sửa</a>
        <a class="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-500 hover:text-teal-800" href="/module-guide">Hướng dẫn module</a>
      </div>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div class="rounded-xl bg-slate-950 p-4 text-white shadow-xl">
        <div class="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <span class="font-semibold">MetaFlow Workspace</span>
          <span class="rounded-full bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-300">Live</span>
        </div>
        <div class="grid gap-3">
          <div class="rounded-lg bg-white/8 p-3">
            <div class="text-xs uppercase text-slate-400">Quy trình</div>
            <div class="mt-1 font-mono text-sm">CRM -> Quotation -> Delivery -> Invoice</div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <div class="rounded-lg bg-teal-500/15 p-3"><b>CRM</b><br><span class="text-slate-300">Pipeline</span></div>
            <div class="rounded-lg bg-blue-500/15 p-3"><b>MinIO</b><br><span class="text-slate-300">Tệp tin</span></div>
            <div class="rounded-lg bg-violet-500/15 p-3"><b>AI</b><br><span class="text-slate-300">MCP</span></div>
          </div>
          <div class="rounded-lg bg-white p-3 text-slate-900">
            <div class="mb-2 text-xs font-bold uppercase text-slate-500">Tùy biến nhanh</div>
            <div class="flex items-center justify-between border-b border-slate-100 py-2"><span>Views & Menus</span><b>Editable</b></div>
            <div class="flex items-center justify-between py-2"><span>Modules & Skills</span><b>Extend</b></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="features" class="py-14">
  <div class="mb-8">
    <p class="text-sm font-bold uppercase tracking-wide text-teal-700">Tổng quan ứng dụng</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Các module cốt lõi đã sẵn sàng cho vận hành nội bộ.</h2>
  </div>
  <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">CRM và pipeline</h3>
      <p class="mt-3 text-slate-600">Quản lý lead, opportunity, stage, activity, nguồn marketing, lost reason và tạo báo giá trực tiếp từ cơ hội.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Bán hàng tự động</h3>
      <p class="mt-3 text-slate-600">Tạo báo giá từ CRM hoặc nhập đơn bán, xác nhận đơn, sinh phiếu giao hàng và tạo hóa đơn sau khi giao hàng.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Mua hàng khép kín</h3>
      <p class="mt-3 text-slate-600">Quản lý nhà cung cấp, đơn mua, phiếu nhập kho và hóa đơn mua hàng sau khi nhận hàng.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Kế toán theo TT99</h3>
      <p class="mt-3 text-slate-600">Có tài khoản, nhật ký, bút toán, hóa đơn bán, hóa đơn mua và kiểm tra cân đối trước khi vào sổ.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Kho và sản phẩm</h3>
      <p class="mt-3 text-slate-600">Theo dõi sản phẩm dùng chung, vị trí kho, dịch chuyển hàng hóa và số lượng tồn tính từ stock moves.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Tệp tin MinIO</h3>
      <p class="mt-3 text-slate-600">Upload tệp lớn qua multipart, lưu object trên MinIO và tải xuống từ hồ sơ attachment.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">AI và MCP</h3>
      <p class="mt-3 text-slate-600">Kết nối nhà cung cấp LLM, cấu hình MCP server và cho AI đọc dữ liệu vận hành có kiểm soát.</p>
    </article>
  </div>
</section>

<section id="download" class="rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10">
  <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
    <div>
      <p class="text-sm font-bold uppercase tracking-wide text-teal-300">Tải về & chỉnh sửa</p>
      <h2 class="mt-2 text-3xl font-bold tracking-tight">Dùng qua giao diện, chỉnh nội dung trực tiếp hoặc mở rộng bằng module.</h2>
      <p class="mt-4 leading-7 text-slate-300">Người dùng nghiệp vụ có thể chỉnh trang website, menu, attachment và bản ghi trong <code>/web</code>. Đội kỹ thuật có thể lấy mã nguồn từ GitHub, sửa file module, chạy kiểm tra và Upgrade module để áp dụng thay đổi.</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a class="rounded-lg bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400" href="/web">Chỉnh sửa trong app</a>
        <a class="rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-teal-300 hover:text-teal-200" href="https://github.com/trandangtuan/TDShift" target="_blank" rel="noreferrer">Lấy source trên GitHub</a>
        <a class="rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-teal-300 hover:text-teal-200" href="/module-guide">Xem cách mở rộng</a>
      </div>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-2xl border border-white/10 bg-white/8 p-5"><b>Chỉnh nội dung</b><p class="mt-2 text-sm text-slate-300">Vào Website > Pages để sửa tiêu đề, trạng thái xuất bản và view HTML của trang.</p></div>
      <div class="rounded-2xl border border-white/10 bg-white/8 p-5"><b>Chỉnh menu</b><p class="mt-2 text-sm text-slate-300">Vào Website > Menus để đổi nhãn, thứ tự, URL và trạng thái hiển thị.</p></div>
      <div class="rounded-2xl border border-white/10 bg-white/8 p-5"><b>Mở rộng module</b><p class="mt-2 text-sm text-slate-300">Thêm model, view, data và skill riêng trong thư mục module để AI khác cũng hiểu tính năng.</p></div>
      <div class="rounded-2xl border border-white/10 bg-white/8 p-5"><b>Triển khai lại</b><p class="mt-2 text-sm text-slate-300">Chạy kiểm tra, build, sau đó Upgrade module để đồng bộ metadata và database.</p></div>
    </div>
  </div>
</section>

<section class="py-14">
  <div class="grid gap-5 lg:grid-cols-3">
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-bold uppercase tracking-wide text-teal-700">Bước 1</p>
      <h3 class="mt-2 text-xl font-bold text-slate-950">Tải hoặc mở mã nguồn</h3>
      <p class="mt-3 text-slate-600">Clone hoặc fork source tại <a class="font-bold text-teal-700 hover:text-teal-900" href="https://github.com/trandangtuan/TDShift" target="_blank" rel="noreferrer">github.com/trandangtuan/TDShift</a>. Dự án chạy theo monorepo TypeScript; sau đó cấu hình <code>.env</code>, Docker Compose và MinIO nếu cần lưu file.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-bold uppercase tracking-wide text-teal-700">Bước 2</p>
      <h3 class="mt-2 text-xl font-bold text-slate-950">Chỉnh module hoặc giao diện</h3>
      <p class="mt-3 text-slate-600">Sửa metadata trong <code>modules/*</code>, cập nhật <code>SKILL.md</code>, hoặc chỉnh trang/menu trực tiếp trong khu vực quản trị.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-bold uppercase tracking-wide text-teal-700">Bước 3</p>
      <h3 class="mt-2 text-xl font-bold text-slate-950">Kiểm tra và nâng cấp</h3>
      <p class="mt-3 text-slate-600">Chạy <code>npm run check</code>, <code>npm run build</code>, rồi Upgrade module trong Settings để áp dụng schema, menu, view và dữ liệu seed.</p>
    </article>
  </div>
</section>

<section class="py-14">
  <div class="rounded-3xl border border-teal-200 bg-teal-50 px-6 py-10 text-center sm:px-10">
    <h2 class="text-3xl font-bold tracking-tight text-slate-950">Sẵn sàng tùy biến MetaFlow cho quy trình của bạn?</h2>
    <p class="mx-auto mt-3 max-w-2xl text-slate-600">Bắt đầu từ app quản trị, sau đó dùng trang hướng dẫn module để đào tạo người dùng hoặc giao việc mở rộng cho AI/đội kỹ thuật.</p>
    <div class="mt-7 flex flex-wrap justify-center gap-3">
      <a class="rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800" href="/web">Bắt đầu sử dụng</a>
      <a class="rounded-lg border border-teal-300 bg-white px-5 py-3 text-sm font-bold text-teal-800 transition hover:border-teal-600" href="/features">Xem tính năng</a>
    </div>
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
    technicalName: "website.page_module_guide.view",
    name: "Module Guide Page Content",
    model: "website.page",
    type: "page",
    contentType: "html",
    content: `
<section class="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10">
  <p class="text-sm font-bold uppercase tracking-wide text-teal-700">Hướng dẫn vận hành</p>
  <h1 class="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Cách sử dụng từng module trong MetaFlow.</h1>
  <p class="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Trang này tóm tắt mục đích, luồng thao tác chính và điểm cần chú ý của từng module. Menu bên trái giúp chuyển nhanh giữa các phần khi đào tạo người dùng hoặc mở rộng hệ thống.</p>
</section>

<section class="grid gap-8 py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
  <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
    <p class="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Module</p>
    <nav class="grid gap-1">
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#base">Base</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#contacts">Contacts</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#product">Product</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#crm">CRM</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#sale">Sale</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#purchase">Purchase</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#stock">Stock</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#accounting">Accounting</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#attachments">Attachments</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#website">Website</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#ai">AI</a>
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#mcp">MCP</a>
    </nav>
  </aside>

  <div class="grid gap-6">
    <article id="base" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Base - nền tảng hệ thống</h2>
      <p class="mt-3 text-slate-600">Dùng để quản lý người dùng, metadata, module lifecycle và các API CRUD chung.</p>
      <ol class="mt-4 grid gap-2 text-slate-700">
        <li><b>Người dùng:</b> vào Settings > Users để tạo tài khoản, đặt mật khẩu, kích hoạt hoặc vô hiệu hóa.</li>
        <li><b>Module:</b> vào Settings > Technical > Modules, bấm Refresh Modules, sau đó Install hoặc Upgrade module cần dùng.</li>
        <li><b>Metadata:</b> dùng Models, Fields, Views, Menus để kiểm tra cấu trúc runtime.</li>
      </ol>
      <p class="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Lưu ý: sau khi thay đổi code module, hãy Upgrade module tương ứng để đồng bộ metadata và schema.</p>
    </article>

    <article id="contacts" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Contacts - khách hàng và nhà cung cấp</h2>
      <p class="mt-3 text-slate-600">Lưu thông tin đối tác dùng chung cho bán hàng, mua hàng và kế toán.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Tạo liên hệ với tên, email, điện thoại và trạng thái hoạt động.</li>
        <li>Chọn liên hệ làm Customer trong đơn bán hàng.</li>
        <li>Chọn liên hệ làm Vendor trong đơn mua hàng.</li>
        <li>Dùng partner trên bút toán hoặc dòng kế toán khi cần theo dõi công nợ.</li>
      </ul>
    </article>

    <article id="product" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Product - danh mục sản phẩm</h2>
      <p class="mt-3 text-slate-600">Quản lý sản phẩm dùng chung trong bán hàng, mua hàng và kho.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Tạo sản phẩm với tên, mã nội bộ và giá bán.</li>
        <li>Chọn sản phẩm trong dòng đơn bán hoặc dòng đơn mua.</li>
        <li>Theo dõi số lượng tồn nếu module Stock đã được cài và có stock moves.</li>
      </ul>
    </article>

    <article id="crm" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">CRM - lead, opportunity và pipeline</h2>
      <p class="mt-3 text-slate-600">Quản lý quy trình tiền bán hàng theo phong cách Odoo CRM: thu lead, qualify, chăm sóc, tạo báo giá, won/lost và phân tích doanh thu kỳ vọng.</p>
      <ol class="mt-4 grid gap-2 text-slate-700">
        <li>Vào CRM > Leads để nhập lead mới từ website, email, điện thoại hoặc nhập tay.</li>
        <li>Bấm Convert để chuyển lead thành opportunity và đưa vào pipeline.</li>
        <li>Dùng CRM > Pipeline để theo dõi stage, sales team, salesperson, expected revenue, probability và expected closing.</li>
        <li>Thêm Activities để lên lịch call, email, meeting hoặc follow-up; sau khi xong thì Mark Done.</li>
        <li>Bấm Create Quotation để tạo báo giá nháp trong Sales và tự tạo activity follow-up.</li>
        <li>Kết thúc cơ hội bằng Won, Lost hoặc Restore nếu cần mở lại.</li>
      </ol>
      <p class="mt-4 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">Cấu hình pipeline tại CRM > Configuration: Stages, Sales Teams, Activity Types, Sources, Media, Campaigns, Tags và Lost Reasons.</p>
    </article>

    <article id="sale" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Sale - bán hàng</h2>
      <p class="mt-3 text-slate-600">Tạo đơn bán, thêm dòng hàng, xác nhận và sinh phiếu giao hàng.</p>
      <ol class="mt-4 grid gap-2 text-slate-700">
        <li>Vào Sales > Orders và tạo đơn mới.</li>
        <li>Chọn Customer, ngày đặt hàng và thêm Order Lines.</li>
        <li>Bấm Confirm để chuyển trạng thái và tạo draft delivery stock moves.</li>
        <li>Hoàn tất giao hàng trong Inventory > Stock Moves để tạo customer invoice draft.</li>
      </ol>
    </article>

    <article id="purchase" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Purchase - mua hàng</h2>
      <p class="mt-3 text-slate-600">Tạo đơn mua, xác nhận và sinh phiếu nhận hàng từ nhà cung cấp.</p>
      <ol class="mt-4 grid gap-2 text-slate-700">
        <li>Vào Purchases > Orders và tạo đơn mua.</li>
        <li>Chọn Vendor, ngày đặt hàng và thêm Order Lines.</li>
        <li>Bấm Confirm để tạo draft receipt stock moves.</li>
        <li>Hoàn tất nhận hàng trong Inventory > Stock Moves để tạo vendor bill draft.</li>
      </ol>
    </article>

    <article id="stock" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Stock - kho vận</h2>
      <p class="mt-3 text-slate-600">Theo dõi vị trí kho và dịch chuyển hàng hóa.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Locations gồm Vendor, Stock, Customer hoặc Inventory.</li>
        <li>Stock Moves ghi nhận sản phẩm, số lượng, nguồn, đích, trạng thái và chứng từ gốc.</li>
        <li>Bấm Mark Done để hoàn tất dịch chuyển. Sale/Purchase sẽ bắt sự kiện này để tạo invoice/bill.</li>
      </ul>
    </article>

    <article id="accounting" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Accounting - kế toán</h2>
      <p class="mt-3 text-slate-600">Quản lý tài khoản, sổ nhật ký, bút toán, hóa đơn khách hàng và hóa đơn nhà cung cấp.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Chart of Accounts có bộ tài khoản nền tảng theo hướng TT99.</li>
        <li>Journals gồm General, Sales, Purchase, Cash và Bank.</li>
        <li>Journal Entries có dòng Nợ/Có và chỉ post khi cân bằng.</li>
        <li>Sale delivery tạo invoice: Nợ 131, Có 511. Purchase receipt tạo bill: Nợ 156, Có 331.</li>
      </ul>
    </article>

    <article id="attachments" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Attachments - tệp đính kèm MinIO</h2>
      <p class="mt-3 text-slate-600">Lưu metadata trong DB và lưu file thật trong MinIO.</p>
      <ol class="mt-4 grid gap-2 text-slate-700">
        <li>Vào Settings > Technical > Attachments.</li>
        <li>Bấm Create, chọn file ở Upload File.</li>
        <li>UI upload multipart trực tiếp qua <code>/api/attachments/upload</code>, không gửi base64 JSON.</li>
        <li>Record lưu bucket, object name, file size và checksum. Tải xuống qua <code>/api/attachments/:id/download</code>.</li>
      </ol>
    </article>

    <article id="website" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">Website - trang công khai</h2>
      <p class="mt-3 text-slate-600">Tạo page, menu và nội dung HTML được render public.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Pages quản lý slug, title, meta description, published flag và linked view.</li>
        <li>Menus quản lý nhãn, URL, thứ tự và trạng thái xuất bản.</li>
        <li>Nội dung page nằm trong <code>core.view</code> có <code>content_type = html</code>.</li>
      </ul>
    </article>

    <article id="ai" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">AI - trợ lý dữ liệu</h2>
      <p class="mt-3 text-slate-600">Kết nối provider AI và MCP để hỏi đáp trên dữ liệu trong hệ thống.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Cấu hình provider như OpenRouter, OpenAI hoặc Claude.</li>
        <li>Cấu hình MCP client/server để AI có thể dùng công cụ đọc dữ liệu.</li>
        <li>Mở AI Chat để hỏi dữ liệu và xem trace/tool calls ở sidebar.</li>
      </ul>
    </article>

    <article id="mcp" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-950">MCP - công cụ cho AI bên ngoài</h2>
      <p class="mt-3 text-slate-600">Cung cấp công cụ metadata-aware để AI client bên ngoài đọc và thao tác dữ liệu có kiểm soát.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Dùng MCP tools để inspect models, fields và records.</li>
        <li>Ưu tiên read/search trước khi write.</li>
        <li>Không bypass registry hoặc truy cập trực tiếp DB từ tool mới.</li>
      </ul>
    </article>
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

    <article id="crm" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">02</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">CRM, pipeline và chăm sóc cơ hội</h2>
      <p class="mt-3 leading-7 text-slate-600">Module CRM hỗ trợ quy trình tiền bán hàng theo kiểu Odoo: tạo lead, convert thành opportunity, theo dõi stage, lên lịch activity, tạo báo giá, đánh dấu won/lost và ghi nhận lý do mất cơ hội.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Lead và opportunity dùng chung model để dễ chuyển đổi trạng thái.</li>
        <li>Pipeline có sales team, salesperson, expected revenue, probability và expected closing.</li>
        <li>Create Quotation mở thẳng form Sales Order vừa tạo, có breadcrumb quay lại cơ hội CRM.</li>
        <li>Activity được lazy-load trong tab khi người dùng mở tab, giúp form nhiều dữ liệu nhẹ hơn.</li>
      </ul>
    </article>

    <article id="ban-hang" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-800">03</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Liên hệ, sản phẩm và bán hàng</h2>
      <p class="mt-3 leading-7 text-slate-600">Các module hiện có hỗ trợ quản lý danh bạ khách hàng, sản phẩm và đơn bán hàng. Đơn bán có thể được tạo từ CRM hoặc nhập trực tiếp, dòng đơn hàng được nhập ngay trong form và tổng tiền có thể tự tính từ dữ liệu dòng.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Danh sách liên hệ với email, điện thoại và trạng thái hoạt động.</li>
        <li>Sản phẩm có mã, giá bán và số lượng tồn tính toán.</li>
        <li>Đơn bán hàng có khách hàng, trạng thái, ngày đặt và tổng tiền.</li>
      </ul>
    </article>

    <article id="mua-hang-kho" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-violet-50 px-3 py-1 text-sm font-bold text-violet-800">04</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Mua hàng và quản lý kho</h2>
      <p class="mt-3 leading-7 text-slate-600">Module mua hàng và kho giúp theo dõi luồng nhập hàng, vị trí kho và dịch chuyển tồn kho. Khi xác nhận đơn mua, hệ thống có thể tạo stock move để cập nhật số lượng sản phẩm.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Đơn mua hàng và dòng đơn mua.</li>
        <li>Vị trí kho theo mục đích sử dụng.</li>
        <li>Dịch chuyển kho có trạng thái và nguồn gốc chứng từ.</li>
      </ul>
    </article>

    <article id="ai" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800">05</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Trợ lý AI kết nối dữ liệu</h2>
      <p class="mt-3 leading-7 text-slate-600">Ứng dụng có giao diện chat AI, hỗ trợ cấu hình OpenRouter, OpenAI hoặc Claude. AI có thể gọi công cụ MCP để đọc model, tìm bản ghi và trả lời dựa trên dữ liệu thật trong hệ thống.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Chat hiển thị Markdown và stream kết quả.</li>
        <li>Sidebar trace để xem trạng thái, tool call và kết quả tool.</li>
        <li>Lưu lịch sử request AI để kiểm tra lại.</li>
      </ul>
    </article>

    <article id="tim-kiem" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">06</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Danh sách, tìm kiếm và phân trang</h2>
      <p class="mt-3 leading-7 text-slate-600">List view được tối ưu để dùng hằng ngày: có tìm kiếm nhanh, lọc theo từng cột, phân trang, cuộn bảng và hiển thị nhãn của trường quan hệ ngay từ search_read để giảm số lượng request.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Search nhanh trên field hiển thị chính.</li>
        <li>Lọc theo từng cột cho các field được lưu trữ.</li>
        <li>many2one trả về id và tên hiển thị trong một lần đọc.</li>
      </ul>
    </article>

    <article id="website" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-800">07</span>
      <h2 class="mt-4 text-2xl font-bold text-slate-950">Website và trang công khai</h2>
      <p class="mt-3 leading-7 text-slate-600">Module website cho phép xuất bản trang công khai từ nội dung HTML lưu trong view. Menu website cũng được quản lý bằng dữ liệu, giúp việc thêm trang giới thiệu hoặc trang tính năng rất nhanh.</p>
      <ul class="mt-4 grid gap-2 text-slate-700">
        <li>Trang chủ và trang tính năng công khai.</li>
        <li>Menu website có thứ tự, URL và trạng thái xuất bản.</li>
        <li>Nội dung trang có thể được quản lý như một bản ghi view.</li>
      </ul>
    </article>

    <article id="bao-mat" class="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span class="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-800">08</span>
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
      <a class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800" href="#crm">CRM & pipeline</a>
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
