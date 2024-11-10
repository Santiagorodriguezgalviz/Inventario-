import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InvoiceGenerator = ({ saleData }) => {
  const generateInvoice = () => {
    const doc = new jsPDF();
    
    // Agregar encabezado
    doc.setFontSize(20);
    doc.text('Factura', 20, 20);
    
    // Información de la empresa
    doc.setFontSize(12);
    doc.text('Sistema de Inventario', 20, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 40);
    
    // Detalles de la venta
    const tableColumn = ["Producto", "Cantidad", "Precio Unitario", "Total"];
    const tableRows = saleData.items.map(item => [
      item.nombre,
      item.cantidad,
      `$${item.precio}`,
      `$${item.cantidad * item.precio}`
    ]);

    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
    });
    
    // Total
    doc.text(`Total: $${saleData.total}`, 20, doc.lastAutoTable.finalY + 20);
    
    // Guardar PDF
    doc.save('factura.pdf');
  };

  return (
    <Button variant="primary" onClick={generateInvoice}>
      <i className="fas fa-file-invoice"></i> Generar Factura
    </Button>
  );
};

export default InvoiceGenerator;