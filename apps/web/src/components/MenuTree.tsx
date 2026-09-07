import { ChevronDown, Settings, ShoppingCart, Target, User } from "lucide-react";
import { useState } from "react";
import type { RuntimeMenu } from "./types";

type MenuTreeProps = { menus: RuntimeMenu[]; onOpen: (action: string) => void };

export default function MenuTree({ menus, onOpen }: MenuTreeProps) {
  return <nav>{menus.map((menu) => <MenuNode key={menu.technicalName} menu={menu} onOpen={onOpen} level={0} />)}</nav>;
}

function MenuNode({ menu, onOpen, level }: { menu: RuntimeMenu; onOpen: (action: string) => void; level: number }) {
  const [open, setOpen] = useState(false);
  const Icon = menu.icon === "shopping-cart" ? ShoppingCart : menu.icon === "users" ? User : menu.icon === "target" ? Target : Settings;
  return <div>
    <button className="menu-item" style={{ paddingLeft: 14 + level * 14 }} onClick={() => (menu.action ? onOpen(menu.action) : setOpen(!open))}>
      {level === 0 && <Icon size={17} />}<span>{menu.name}</span>{menu.children.length > 0 && <ChevronDown className={open ? "chevron open" : "chevron"} size={15} />}
    </button>
    {open && menu.children.map((child) => <MenuNode key={child.technicalName} menu={child} onOpen={onOpen} level={level + 1} />)}
  </div>;
}
