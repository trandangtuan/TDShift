import { defineModule } from "@record-platform/core";
import { accountData, journalData } from "./data";
import { accountModel, accountMoveLineModel, accountMoveModel, journalModel } from "./models";
import { accountMoveLineView, accountMoveView, accountView, journalView } from "./views";

export default defineModule({
  technicalName: "accounting",
  displayName: "Kế toán",
  version: "1.1.0",
  description: "Vietnamese enterprise accounting baseline aligned for Thong tu 99/2025/TT-BTC adoption.",
  depends: ["base", "contacts"],
  sequence: 30,
  models: [accountModel, journalModel, accountMoveModel, accountMoveLineModel],
  views: [...accountView, ...journalView, ...accountMoveView, ...accountMoveLineView],
  actions: [
    { technicalName: "account.action_moves", name: "Move", type: "window", model: "account.move", viewModes: ["list", "form"] },
    { technicalName: "account.action_move_lines", name: "MoveLine", type: "window", model: "account.move.line", viewModes: ["list", "form"] },
    { technicalName: "account.action_accounts", name: "Chart of Account", type: "window", model: "account.account", viewModes: ["list", "form"] },
    { technicalName: "account.action_journals", name: "Sổ nhật ký", type: "window", model: "account.journal", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "account.menu_root", name: "Kế toán", icon: "landmark", sequence: 30 },
    { technicalName: "account.menu_moves", name: "Move", parent: "account.menu_root", action: "account.action_moves", sequence: 10 },
    { technicalName: "account.menu_move_lines", name: "MoveLine", parent: "account.menu_root", action: "account.action_move_lines", sequence: 20 },
    { technicalName: "account.menu_configuration", name: "Config", parent: "account.menu_root", sequence: 90 },
    { technicalName: "account.menu_accounts", name: "Chart of Account", parent: "account.menu_configuration", action: "account.action_accounts", sequence: 10 },
    { technicalName: "account.menu_journals", name: "Sổ nhật ký", parent: "account.menu_configuration", action: "account.action_journals", sequence: 20 }
  ],
  data: [...accountData, ...journalData]
});
