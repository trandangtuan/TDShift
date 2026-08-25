import type { DataRecordDefinition } from "@record-platform/core";

export const crmDemoData: DataRecordDefinition[] = [
  {
    externalId: "crm.lead_beton_factory_erp",
    model: "crm.lead",
    values: {
      name: "ERP cho nhà máy bê tông",
      type: "opportunity",
      contact_name: "Nguyễn Minh Anh",
      email_from: "minhanh@example.vn",
      phone: "0901000001",
      company_name: "Công ty CP Bê tông Thắng Long",
      team_id: 1,
      user_id: 1,
      stage_id: 2,
      tag_id: 2,
      source_id: 1,
      medium_id: 1,
      campaign_id: 1,
      expected_revenue: 380000000,
      probability: 30,
      expected_closing: "2026-09-18",
      priority: "3",
      state: "qualified",
      description: "Khách hàng cần quản lý bán hàng, kho vật tư, kế toán TT99 và hóa đơn sau giao hàng.",
      active: true
    }
  },
  {
    externalId: "crm.lead_retail_distribution",
    model: "crm.lead",
    values: {
      name: "Triển khai quản lý phân phối bán lẻ",
      type: "opportunity",
      contact_name: "Trần Hoài Nam",
      email_from: "hoainam@example.vn",
      phone: "0901000002",
      company_name: "Nam Phương Retail",
      team_id: 1,
      user_id: 1,
      stage_id: 3,
      tag_id: 1,
      source_id: 2,
      medium_id: 2,
      campaign_id: 1,
      expected_revenue: 220000000,
      probability: 60,
      expected_closing: "2026-09-05",
      priority: "2",
      state: "proposition",
      description: "Đã demo quy trình CRM -> báo giá -> giao hàng -> hóa đơn. Cần gửi đề xuất thương mại.",
      active: true
    }
  },
  {
    externalId: "crm.lead_website_inquiry",
    model: "crm.lead",
    values: {
      name: "Yêu cầu tư vấn từ website",
      type: "lead",
      contact_name: "Lê Thanh Hằng",
      email_from: "hang.le@example.vn",
      phone: "0901000003",
      company_name: "Hằng Logistics",
      team_id: 1,
      user_id: 1,
      stage_id: 1,
      tag_id: 2,
      source_id: 1,
      medium_id: 1,
      campaign_id: 1,
      expected_revenue: 95000000,
      probability: 10,
      expected_closing: "2026-10-02",
      priority: "1",
      state: "new",
      description: "Lead mới từ form website, cần gọi xác nhận nhu cầu và ngân sách.",
      active: true
    }
  },
  {
    externalId: "crm.lead_lost_price",
    model: "crm.lead",
    values: {
      name: "CRM nội bộ cho agency",
      type: "opportunity",
      contact_name: "Phạm Quốc Bảo",
      email_from: "bao.pham@example.vn",
      phone: "0901000004",
      company_name: "Blue Ocean Agency",
      team_id: 1,
      user_id: 1,
      stage_id: 5,
      source_id: 2,
      medium_id: 1,
      expected_revenue: 65000000,
      probability: 0,
      expected_closing: "2026-08-20",
      priority: "0",
      state: "lost",
      lost_reason_id: 1,
      lost_feedback: "Khách chọn phương án chi phí thấp hơn trong giai đoạn thử nghiệm.",
      description: "Cơ hội mẫu để kiểm tra báo cáo lost reason.",
      active: true
    }
  },
  {
    externalId: "crm.activity_beton_call",
    model: "crm.activity",
    values: {
      name: "Gọi xác nhận phạm vi ERP",
      lead_id: 1,
      activity_type_id: 1,
      assigned_user_id: 1,
      deadline: "2026-08-27",
      state: "planned",
      note: "Chuẩn bị checklist quy trình bán hàng, kho và kế toán trước cuộc gọi."
    }
  },
  {
    externalId: "crm.activity_retail_email",
    model: "crm.activity",
    values: {
      name: "Gửi đề xuất thương mại",
      lead_id: 2,
      activity_type_id: 2,
      assigned_user_id: 1,
      deadline: "2026-08-28",
      state: "planned",
      note: "Đính kèm phạm vi triển khai và timeline dự kiến."
    }
  },
  {
    externalId: "crm.activity_website_call",
    model: "crm.activity",
    values: {
      name: "Gọi lead từ website",
      lead_id: 3,
      activity_type_id: 1,
      assigned_user_id: 1,
      deadline: "2026-08-26",
      state: "planned",
      note: "Xác nhận người quyết định, ngân sách và thời gian triển khai."
    }
  },
  {
    externalId: "crm.activity_lost_review",
    model: "crm.activity",
    values: {
      name: "Ghi nhận lý do mất cơ hội",
      lead_id: 4,
      activity_type_id: 2,
      assigned_user_id: 1,
      deadline: "2026-08-21",
      state: "done",
      done_date: "2026-08-21",
      note: "Đã cập nhật lost reason Price để phục vụ phân tích win/loss."
    }
  }
];
