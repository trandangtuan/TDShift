import { defineModule } from "@record-platform/core";
import { crmConfigData, crmDemoData } from "./data";
import { crmActivityModel, crmActivityTypeModel, crmCampaignModel, crmLeadModel, crmLostReasonModel, crmMediumModel, crmSaleOrderModel, crmSourceModel, crmStageModel, crmTagModel, crmTeamModel } from "./models";
import { crmActivityView, crmConfigView, crmLeadView, crmSaleOrderViewExtensions } from "./views";

export default defineModule({
  technicalName: "crm",
  displayName: "CRM",
  version: "1.0.0",
  description: "Manage leads, opportunities, sales pipeline, activities, lead sources, lost reasons, and quotation handoff inspired by the Odoo CRM workflow.",
  depends: ["base", "contacts", "sale"],
  sequence: 15,
  models: [crmTeamModel, crmStageModel, crmTagModel, crmLostReasonModel, crmActivityTypeModel, crmSourceModel, crmMediumModel, crmCampaignModel, crmLeadModel, crmActivityModel, crmSaleOrderModel],
  views: [...crmLeadView, ...crmActivityView, ...crmConfigView],
  viewExtensions: crmSaleOrderViewExtensions,
  actions: [
    { technicalName: "crm.action_pipeline", name: "Pipeline", type: "window", model: "crm.lead", viewModes: ["list", "form"], domain: [["type", "=", "opportunity"]] },
    { technicalName: "crm.action_leads", name: "Lead", type: "window", model: "crm.lead", viewModes: ["list", "form"], domain: [["type", "=", "lead"]] },
    { technicalName: "crm.action_activities", name: "Activity", type: "window", model: "crm.activity", viewModes: ["list", "form"] },
    { technicalName: "crm.action_teams", name: "Bán hàng Teams", type: "window", model: "crm.team", viewModes: ["list", "form"] },
    { technicalName: "crm.action_stages", name: "Stage", type: "window", model: "crm.stage", viewModes: ["list", "form"] },
    { technicalName: "crm.action_tags", name: "Tag", type: "window", model: "crm.tag", viewModes: ["list", "form"] },
    { technicalName: "crm.action_activity_types", name: "Loại hoạt động", type: "window", model: "crm.activity.type", viewModes: ["list", "form"] },
    { technicalName: "crm.action_lost_reasons", name: "Lý do mất", type: "window", model: "crm.lost.reason", viewModes: ["list", "form"] },
    { technicalName: "crm.action_sources", name: "Nguồn lead", type: "window", model: "crm.source", viewModes: ["list", "form"] },
    { technicalName: "crm.action_media", name: "Kênh marketing", type: "window", model: "crm.medium", viewModes: ["list", "form"] },
    { technicalName: "crm.action_campaigns", name: "Campaign", type: "window", model: "crm.campaign", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "crm.menu_root", name: "CRM", icon: "target", sequence: 12 },
    { technicalName: "crm.menu_pipeline", name: "Pipeline", parent: "crm.menu_root", action: "crm.action_pipeline", sequence: 10 },
    { technicalName: "crm.menu_leads", name: "Lead", parent: "crm.menu_root", action: "crm.action_leads", sequence: 20 },
    { technicalName: "crm.menu_activities", name: "Activity", parent: "crm.menu_root", action: "crm.action_activities", sequence: 30 },
    { technicalName: "crm.menu_config", name: "Config", parent: "crm.menu_root", sequence: 90 },
    { technicalName: "crm.menu_teams", name: "Bán hàng Teams", parent: "crm.menu_config", action: "crm.action_teams", sequence: 10 },
    { technicalName: "crm.menu_stages", name: "Stage", parent: "crm.menu_config", action: "crm.action_stages", sequence: 20 },
    { technicalName: "crm.menu_tags", name: "Tag", parent: "crm.menu_config", action: "crm.action_tags", sequence: 30 },
    { technicalName: "crm.menu_activity_types", name: "Loại hoạt động", parent: "crm.menu_config", action: "crm.action_activity_types", sequence: 40 },
    { technicalName: "crm.menu_lost_reasons", name: "Lý do mất", parent: "crm.menu_config", action: "crm.action_lost_reasons", sequence: 50 },
    { technicalName: "crm.menu_sources", name: "Nguồn lead", parent: "crm.menu_config", action: "crm.action_sources", sequence: 60 },
    { technicalName: "crm.menu_media", name: "Kênh marketing", parent: "crm.menu_config", action: "crm.action_media", sequence: 70 },
    { technicalName: "crm.menu_campaigns", name: "Campaign", parent: "crm.menu_config", action: "crm.action_campaigns", sequence: 80 }
  ],
  data: [...crmConfigData, ...crmDemoData]
});
