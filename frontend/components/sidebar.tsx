'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const menuItems = [
  { name: 'Dashboard (Financeiro)', href: '/' },
  { name: 'Operacional (US07)', href: '/operacional' },
  { name: 'Clientes (US11)', href: '/clientes' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 p-4 border-r h-screen">
      <h2 className="text-xl font-bold mb-4">Análise Nola</h2>
      <NavigationMenu orientation="vertical">
        <NavigationMenuList className="flex flex-col items-start space-y-2">
          {menuItems.map((item) => (
            <NavigationMenuItem key={item.href} className="w-full">
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink
                  active={pathname === item.href}
                  className={navigationMenuTriggerStyle() + " w-full justify-start"}
                >
                  {item.name}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </aside>
  );
}