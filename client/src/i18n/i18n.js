import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app_title: "ORBIT CANTEEN",
      app_subtitle: "Smart Canteen Management Core",
      menu: "Menu",
      inventory: "Inventory",
      kds: "Kitchen Display (KDS)",
      tables: "Table QR System",
      analytics: "Analytics & Reports",
      reviews: "Reviews",
      loyalty_points: "Loyalty Points",
      cart: "Cart",
      checkout: "Checkout",
      orders: "Orders",
      order_status: "Order Status",
      dine_in: "Dine-In",
      takeaway: "Takeaway",
      delivery: "Delivery",
      quick_role_switch: "Demo Role Switcher:",
      admin: "Admin",
      staff: "Staff",
      customer: "Customer",
      happy_hour: "HAPPY HOUR 15% OFF",
      out_of_stock: "Out of Stock",
      add_to_cart: "Add to Cart",
      customize: "Customize",
      low_stock_warning: "Low Stock Alert",
      expiry_radar: "Expiry Radar",
      valuation: "Inventory Valuation",
      export_pdf: "Export PDF",
      export_excel: "Export Excel"
    }
  },
  es: {
    translation: {
      app_title: "ORBIT CANTEEN",
      app_subtitle: "Gestión Inteligente de Cantina",
      menu: "Menú",
      inventory: "Inventario",
      kds: "Pantalla de Cocina (KDS)",
      tables: "Sistema QR de Mesas",
      analytics: "Análisis y Reportes",
      reviews: "Reseñas",
      loyalty_points: "Puntos de Fidelidad",
      cart: "Carrito",
      checkout: "Pagar",
      orders: "Pedidos",
      order_status: "Estado del Pedido",
      dine_in: "Comer Aquí",
      takeaway: "Para Llevar",
      delivery: "Domicilio",
      quick_role_switch: "Cambiar Rol de Prueba:",
      admin: "Administrador",
      staff: "Personal",
      customer: "Cliente",
      happy_hour: "HORA FELIZ 15% DTO",
      out_of_stock: "Agotado",
      add_to_cart: "Añadir al Carrito",
      customize: "Personalizar",
      low_stock_warning: "Alerta de Stock Bajo",
      expiry_radar: "Radar de Caducidad",
      valuation: "Valoración de Inventario",
      export_pdf: "Exportar PDF",
      export_excel: "Exportar Excel"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
