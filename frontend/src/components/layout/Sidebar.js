// ============================================================================
// COMPONENTE SIDEBAR - Barra lateral de navegación
// ============================================================================

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FiHome, 
    FiUsers, 
    FiShield, 
    FiSettings,
    FiFileText,
    FiLayers,
    FiBarChart2,
    FiGrid
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

// Importar logo - Si no existe, se mostrará un placeholder
let logoSrc;
try {
    logoSrc = require('../../assets/images/logo.png');
} catch (error) {
    logoSrc = null;
}

// Componente para mostrar el logo o placeholder
const LogoImage = () => {
    if (logoSrc) {
        return (
            <img 
                src={logoSrc} 
                alt="Logo Comandancia" 
                className="w-24 h-24 object-contain"
            />
        );
    }
    
    // Placeholder si no existe el logo
    return (
        <div className="w-24 h-24 rounded-full bg-white bg-opacity-10 flex items-center justify-center border-2 border-white border-opacity-30">
            <FiShield size={40} className="text-white opacity-60" />
        </div>
    );
};

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { menu } = useAuth();
    
    // Debug: verificar qué menú está recibiendo el componente
    useEffect(() => {
        console.log('🎯 Sidebar - menú actualizado:', {
            cantidadItems: menu?.length || 0,
            items: menu,
            esArray: Array.isArray(menu),
            menu
        });
    }, [menu]);
    
    // Mapeo de iconos (nombres en BD -> componentes React)
    const iconMap = {
        'icon-home': FiHome,
        'icon-settings': FiSettings,
        'icon-users': FiUsers,
        'icon-sitemap': FiLayers,
        'icon-shield': FiShield,
        'icon-chart-bar': FiBarChart2,
        'icon-history': FiFileText,
        'icon-grid': FiGrid
    };
    
    // Usar el menú del contexto directamente
    // Si está vacío o undefined, mostrar solo Dashboard como fallback
    const menuItems = Array.isArray(menu) && menu.length > 0 
        ? menu 
        : [
            { id: 'fallback-1', ruta: '/', icono: 'icon-home', nombre: 'Dashboard (Fallback)' }
        ];
    
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };
    
    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* Sidebar */}
            <aside 
                className={`
                    fixed top-0 left-0 h-screen w-64 bg-primary text-white z-50
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    flex flex-col
                `}
            >
                {/* Logo de la Comandancia */}
                <div className="py-8 px-4 flex items-center justify-center border-b border-white border-opacity-20">
                    <div className="text-center">
                        <LogoImage />
                    </div>
                </div>
                
                {/* Menú de navegación - con scroll si es necesario */}
                <nav className="flex-1 overflow-y-auto py-6 px-4">
                    {/* Indicador de carga del menú */}
                    {(!menuItems || menuItems.length === 0) && (
                        <div className="text-white text-opacity-60 text-center py-4 text-sm">
                            <p>Cargando menú...</p>
                            <p className="text-xs mt-2">Items: {menu?.length || 0}</p>
                        </div>
                    )}
                    
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            // Obtener componente de icono desde el mapa
                            const IconComponent = iconMap[item.icono] || FiGrid;
                            const active = isActive(item.ruta);
                            
                            return (
                                <li key={item.id || item.ruta}>
                                    <Link
                                        to={item.ruta}
                                        onClick={onClose}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-lg
                                            transition-all duration-200
                                            ${active 
                                                ? 'bg-white bg-opacity-20 font-semibold' 
                                                : 'hover:bg-white hover:bg-opacity-10'
                                            }
                                        `}
                                    >
                                        <IconComponent size={20} />
                                        <span>{item.nombre}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                
                {/* Footer del sidebar */}
                <div className="p-4 border-t border-white border-opacity-20">
                    <p className="text-xs text-white text-opacity-60 text-center">
                        SIGA v1.0.0
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
