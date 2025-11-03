'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Store, 
  Package, 
  Search,
  Hamburger 
} from 'lucide-react';

const menuItems = [
  { name: 'Vendas', href: '/', icon: LayoutDashboard },
  { name: 'Operacional', href: '/operacional', icon: Settings },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Lojas', href: '/lojas', icon: Store },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Explorar', href: '/explorar', icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 p-4 border-r h-screen bg-[#F25050] text-white flex flex-col">

      <div className="p-2 mb-4 flex-row">
        <Hamburger className="h-6 w-6 text-white-500 mr-2"/>
        <h2 className="text-xl font-bold">Restaurante da Maria</h2>
      </div>
      
      <nav className="flex flex-col space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon; 

          return (
            <Link href={item.href} key={item.name} passHref>
              <Button
                variant="ghost"
                className={`
                  w-full justify-start text-base font-medium
                  hover:bg-white/20 hover:text-white hover:border-l-4 hover:border-white hover:cursor-pointer
                  ${isActive 
                    ? "bg-white/10 text-white border-l-4 border-white" 
                    : "text-white/80"
                  }
                `}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}