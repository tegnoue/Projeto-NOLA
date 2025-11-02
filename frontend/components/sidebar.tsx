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
  { name: 'Lojas', href: '/lojas' },
  { name: 'Produtos', href: '/produtos' },
  { name: 'Explorar (US08)', href: '/explorar' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 p-4 border-r h-screen bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Análise Nola</h2>
      <NavigationMenu orientation="vertical" className="w-full">
        <NavigationMenuList className="flex flex-col items-start space-y-2 w-full">
          {menuItems.map((item) => (
            <NavigationMenuItem key={item.href} className="w-full">
              <NavigationMenuLink
                asChild
                active={pathname === item.href}
                className={navigationMenuTriggerStyle() + " w-full justify-start"}
              >
                <Link href={item.href}>
                  {item.name}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </aside>
  );
}