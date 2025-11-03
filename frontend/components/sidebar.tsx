// Em: frontend/components/sidebar.tsx
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
  Hamburger,
  X // Importar ícone de Fechar
} from 'lucide-react';
import { Fragment } from 'react'; // Para o Overlay

const menuItems = [
  { name: 'Vendas', href: '/', icon: LayoutDashboard },
  { name: 'Operacional', href: '/operacional', icon: Settings },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Lojas', href: '/lojas', icon: Store },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Explorar', href: '/explorar', icon: Search },
];

// Definir interface para as novas props
interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isMobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  // Função para fechar o menu ao clicar em um link no mobile
  const handleLinkClick = () => {
    if (isMobileOpen) {
      setMobileOpen(false);
    }
  };

  const SidebarContent = (
    <aside 
      className={`
        ${/* Estilos Base (comuns) */''}
        w-64 p-4 border-r h-screen bg-[#F25050] text-white flex flex-col

        ${/* Lógica Mobile: Posição fixa, z-index alto, e transição */''}
        fixed top-0 left-0 z-40 h-full transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}

        ${/* Lógica Desktop (lg:): Volta a ser relativo, visível e sem translação */''}
        lg:relative lg:translate-x-0 lg:flex
      `}
    >

      <div className="p-2 mb-4 flex items-center justify-between">
        {/* Logo/Título */}
        <div className="flex items-center">
          <Hamburger className="h-6 w-6 text-white-500 mr-2"/>
          <h2 className="text-xl font-bold">Restaurante da Maria</h2>
        </div>
        
        {/* Botão de Fechar (só aparece em telas < lg) */}
        <Button 
          onClick={() => setMobileOpen(false)} 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <nav className="flex flex-col space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon; 

          return (
            // Adicionado onClick para fechar o menu
            <Link href={item.href} key={item.name} passHref onClick={handleLinkClick}>
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

  return (
    <Fragment>
      {/* Overlay (só aparece no mobile quando o menu está aberto) */}
      {/* Clicar nele fecha o menu */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
      {SidebarContent}
    </Fragment>
  );
}