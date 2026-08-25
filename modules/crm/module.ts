import { defineModule } from "@record-platform/core";
import { crmConfigData, crmDemoData } from "./data";
import { crmActivityModel, crmActivityTypeModel, crmCampaignModel, crmLeadModel, crmLostReasonModel, crmMediumModel, crmSaleOrderModel, crmSourceModel, crmStageModel, crmTagModel, crmTeamModel } from "./models";
import { crmActivityViews, crmConfigViews, crmLeadViews, crmSaleOrderViewExtensions } from "./views";

export default defineModule({
  technicalName: "crm",
  displayName: "CRM",
  version: "1.0.0",
  description: "Manage leads, opportunities, sales pipeline, activities, lead sources, lost reasons, and quotation handoff inspired by the Odoo CRM workflow.",
  depends: ["base", "contacts", "sale"],
  sequence: 15,
  models: [crmTeamModel, crmStageModel, crmTagModel, crmLostReasonModel, crmActivityTypeModel, crmSourceModel, crmMediumModel, crmCampaignModel, crmLeadModel, crmActivityModel, crmSaleOrderModel],
  views: [...crmLeadViews, ...crmActivityViews, ...crmConfigViews],
  viewExtensions: crmSaleOrderViewExtensions,
  actions: [
    { technicalName: "crm.action_pipeline", name: "Pipeline", type: "window", model: "crm.lead", viewModes: ["list", "form"], domain: [["type", "=", "opportunity"]] },
    { technicalName: "crm.action_leads", name: "Leads", type: "window", model: "crm.lead", viewModes: ["list", "form"], domain: [["type", "=", "lead"]] },
    { technicalName: "crm.action_activities", name: "Activities", type: "window", model: "crm.activity", viewModes: ["list", "form"] },
    { technicalName: "crm.action_teams", name: "Sales Teams", type: "window", model: "crm.team", viewModes: ["list", "form"] },
    { technicalName: "crm.action_stages", name: "Stages", type: "window", model: "crm.stage", viewModes: ["list", "form"] },
    { technicalName: "crm.action_tags", name: "Tags", type: "window", model: "crm.tag", viewModes: ["list", "form"] },
    { technicalName: "crm.action_activity_types", name: "Activity Types", type: "window", model: "crm.activity.type", viewModes: ["list", "form"] },
    { technicalName: "crm.action_lost_reasons", name: "Lost Reasons", type: "window", model: "crm.lost.reason", viewModes: ["list", "form"] },
    { technicalName: "crm.action_sources", name: "Lead Sources", type: "window", model: "crm.source", viewModes: ["list", "form"] },
    { technicalName: "crm.action_media", name: "Marketing Media", type: "window", model: "crm.medium", viewModes: ["list", "form"] },
    { technicalName: "crm.action_campaigns", name: "Campaigns", type: "window", model: "crm.campaign", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "crm.menu_root", name: "CRM", icon: "target", sequence: 12 },
    { technicalName: "crm.menu_pipeline", name: "Pipeline", parent: "crm.menu_root", action: "crm.action_pipeline", sequence: 10 },
    { technicalName: "crm.menu_leads", name: "Leads", parent: "crm.menu_root", action: "crm.action_leads", sequence: 20 },
    { technicalName: "crm.menu_activities", name: "Activities", parent: "crm.menu_root", action: "crm.action_activities", sequence: 30 },
    { technicalName: "crm.menu_config", name: "Configuration", parent: "crm.menu_root", sequence: 90 },
    { technicalName: "crm.menu_teams", name: "Sales Teams", parent: "crm.menu_config", action: "crm.action_teams", sequence: 10 },
    { technicalName: "crm.menu_stages", name: "Stages", parent: "crm.menu_config", action: "crm.action_stages", sequence: 20 },
    { technicalName: "crm.menu_tags", name: "Tags", parent: "crm.menu_config", action: "crm.action_tags", sequence: 30 },
    { technicalName: "crm.menu_activity_types", name: "Activity Types", parent: "crm.menu_config", action: "crm.action_activity_types", sequence: 40 },
    { technicalName: "crm.menu_lost_reasons", name: "Lost Reasons", parent: "crm.menu_config", action: "crm.action_lost_reasons", sequence: 50 },
    { technicalName: "crm.menu_sources", name: "Lead Sources", parent: "crm.menu_config", action: "crm.action_sources", sequence: 60 },
    { technicalName: "crm.menu_media", name: "Marketing Media", parent: "crm.menu_config", action: "crm.action_media", sequence: 70 },
    { technicalName: "crm.menu_campaigns", name: "Campaigns", parent: "crm.menu_config", action: "crm.action_campaigns", sequence: 80 }
  ],
  data: [...crmConfigData, ...crmDemoData]
});
