const InventoryIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Fondo con patrón de puntos */}
    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.1)" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#dots)" />

    {/* Cajas apiladas */}
    <g transform="translate(100, 100)">
      {/* Caja grande */}
      <rect x="50" y="120" width="120" height="120" rx="8" fill="#ffffff" fillOpacity="0.2" />
      <rect x="70" y="140" width="80" height="20" rx="4" fill="#ffffff" fillOpacity="0.3" />
      
      {/* Caja mediana */}
      <rect x="150" y="80" width="100" height="100" rx="8" fill="#ffffff" fillOpacity="0.2" />
      <rect x="165" y="95" width="70" height="15" rx="4" fill="#ffffff" fillOpacity="0.3" />
      
      {/* Caja pequeña */}
      <rect x="220" y="150" width="80" height="80" rx="8" fill="#ffffff" fillOpacity="0.2" />
      <rect x="230" y="165" width="60" height="12" rx="4" fill="#ffffff" fillOpacity="0.3" />
    </g>

    {/* Persona */}
    <g transform="translate(280, 80)">
      <path d="M20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20C0 8.95431 8.95431 0 20 0Z" fill="#ffffff" fillOpacity="0.2" />
      <path d="M-20 60H60V180C60 191.046 51.0457 200 40 200H0C-11.0457 200 -20 191.046 -20 180V60Z" fill="#ffffff" fillOpacity="0.2" />
    </g>

    {/* Elementos decorativos */}
    <g transform="translate(50, 50)">
      <circle cx="20" cy="20" r="5" fill="#ffffff" fillOpacity="0.1" />
      <circle cx="350" cy="250" r="8" fill="#ffffff" fillOpacity="0.1" />
      <circle cx="380" cy="50" r="6" fill="#ffffff" fillOpacity="0.1" />
    </g>
  </svg>
);

export default InventoryIllustration;