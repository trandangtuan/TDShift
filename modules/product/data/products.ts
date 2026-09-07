import type { DataRecordDefinition } from "@record-platform/core";

export const productData: DataRecordDefinition[] = [
  { externalId: "product.product_consulting", model: "product.product", values: { name: "Implementation Consulting", default_code: "SERV-001", list_price: 1200, active: true } },
  { externalId: "product.product_support", model: "product.product", values: { name: "Support Package", default_code: "SERV-002", list_price: 860, active: true } },
  { externalId: "product.product_starter", model: "product.product", values: { name: "Starter Workspace", default_code: "PLAN-001", list_price: 490, active: true } },
  { externalId: "product.product_growth", model: "product.product", values: { name: "Growth Workspace", default_code: "PLAN-002", list_price: 1290, active: true } },
  { externalId: "product.product_enterprise", model: "product.product", values: { name: "Enterprise Workspace", default_code: "PLAN-003", list_price: 3490, active: true } },
  { externalId: "product.product_crm_setup", model: "product.product", values: { name: "CRM Setup", default_code: "SERV-003", list_price: 780, active: true } },
  { externalId: "product.product_sales_training", model: "product.product", values: { name: "Bán hàng Team Training", default_code: "SERV-004", list_price: 650, active: true } },
  { externalId: "product.product_inventory_audit", model: "product.product", values: { name: "Stock Audit", default_code: "SERV-005", list_price: 920, active: true } },
  { externalId: "product.product_accounting_review", model: "product.product", values: { name: "Accounting Review", default_code: "SERV-006", list_price: 1100, active: true } },
  { externalId: "product.product_data_migration", model: "product.product", values: { name: "Data Migration", default_code: "SERV-007", list_price: 1850, active: true } },
  { externalId: "product.product_api_integration", model: "product.product", values: { name: "API Integration", default_code: "SERV-008", list_price: 1500, active: true } },
  { externalId: "product.product_priority_support", model: "product.product", values: { name: "Ưu tiên Support", default_code: "SERV-009", list_price: 420, active: true } },
  { externalId: "product.product_monthly_reporting", model: "product.product", values: { name: "Monthly Reporting", default_code: "SERV-010", list_price: 350, active: true } },
  { externalId: "product.product_dashboard_pack", model: "product.product", values: { name: "Dashboard Pack", default_code: "ADDON-001", list_price: 280, active: true } },
  { externalId: "product.product_automation_pack", model: "product.product", values: { name: "Automation Pack", default_code: "ADDON-002", list_price: 540, active: true } },
  { externalId: "product.product_ai_assistant", model: "product.product", values: { name: "AI Assistant Pack", default_code: "ADDON-003", list_price: 720, active: true } },
  { externalId: "product.product_mcp_connector", model: "product.product", values: { name: "MCP Connector", default_code: "ADDON-004", list_price: 890, active: true } },
  { externalId: "product.product_document_storage", model: "product.product", values: { name: "Document Storage", default_code: "ADDON-005", list_price: 190, active: true } },
  { externalId: "product.product_custom_branding", model: "product.product", values: { name: "Custom Branding", default_code: "ADDON-006", list_price: 600, active: true } },
  { externalId: "product.product_security_review", model: "product.product", values: { name: "Security Review", default_code: "SERV-011", list_price: 1350, active: true } },
  { externalId: "product.product_process_workshop", model: "product.product", values: { name: "Process Workshop", default_code: "SERV-012", list_price: 980, active: true } },
  { externalId: "product.product_maintenance", model: "product.product", values: { name: "Platform Maintenance", default_code: "SERV-013", list_price: 760, active: true } }
];
