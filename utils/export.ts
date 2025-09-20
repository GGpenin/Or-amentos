import { Quote, Product } from '../types';

declare const jspdf: any;

const formatCurrency = (amount: number) => `R$${amount.toFixed(2).replace('.', ',')}`;

export const exportToCSV = (quote: Quote, products: Product[]) => {
  const productsMap = new Map(products.map(p => [p.id, p]));
  let csvContent = "data:text/csv;charset=utf-8,";
  
  csvContent += "Item;Descrição;Categoria;Preço Unitário;Quantidade;Subtotal\n";

  quote.items.forEach(item => {
    const product = productsMap.get(item.productId);
    if (product) {
      const row = [
        `"${product.name}"`,
        `"${product.description || ''}"`,
        `"${product.category}"`,
        product.price.toFixed(2).replace('.', ','),
        item.quantity,
        (product.price * item.quantity).toFixed(2).replace('.', ',')
      ].join(';');
      csvContent += row + "\n";
    }
  });

  // Calculations
  const subtotal = quote.items.reduce((acc, item) => {
    const product = productsMap.get(item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);
  const discountAmount = quote.discountType === 'fixed' ? quote.discount : subtotal * (quote.discount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const taxAmount = totalAfterDiscount * (quote.taxRate / 100);
  const grandTotal = totalAfterDiscount + taxAmount;
  
  // Summary
  csvContent += "\n";
  csvContent += `Subtotal;;;;;${subtotal.toFixed(2).replace('.', ',')}\n`;
  csvContent += `Desconto (${quote.discountType === 'percentage' ? `${quote.discount}%` : formatCurrency(quote.discount)});;;;;-${discountAmount.toFixed(2).replace('.', ',')}\n`;
  csvContent += `Taxa (${quote.taxRate}%);;;;;${taxAmount.toFixed(2).replace('.', ',')}\n`;
  csvContent += `Total Geral;;;;;${grandTotal.toFixed(2).replace('.', ',')}\n`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${quote.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export const exportToPDF = (quote: Quote, products: Product[]) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const productsMap = new Map(products.map(p => [p.id, p]));

    // Header
    doc.setFontSize(22);
    doc.text(quote.name, 14, 22);
    doc.setFontSize(12);
    doc.text(`Data: ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}`, 14, 30);
    
    // Table
    const tableColumn = ["Produto", "Preço Unitário", "Quantidade", "Subtotal"];
    const tableRows: (string | number)[][] = [];

    quote.items.forEach(item => {
        const product = productsMap.get(item.productId);
        if (product) {
            const quoteData = [
                product.name,
                formatCurrency(product.price),
                item.quantity,
                formatCurrency(product.price * item.quantity)
            ];
            tableRows.push(quoteData);
        }
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] }
    });
    
    // Calculations
    const subtotal = quote.items.reduce((acc, item) => {
        const product = productsMap.get(item.productId);
        return acc + (product ? product.price * item.quantity : 0);
    }, 0);
    const discountAmount = quote.discountType === 'fixed' ? quote.discount : subtotal * (quote.discount / 100);
    const totalAfterDiscount = subtotal - discountAmount;
    const taxAmount = totalAfterDiscount * (quote.taxRate / 100);
    const grandTotal = totalAfterDiscount + taxAmount;
    
    // Summary
    let finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 14, finalY + 10);
    doc.text(`Desconto: -${formatCurrency(discountAmount)}`, 14, finalY + 17);
    doc.text(`Taxa (${quote.taxRate}%): +${formatCurrency(taxAmount)}`, 14, finalY + 24);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Geral: ${formatCurrency(grandTotal)}`, 14, finalY + 31);
    
    // Save
    doc.save(`${quote.name.replace(/\s+/g, '_')}.pdf`);
};

export const exportToDOC = (quote: Quote, products: Product[]) => {
  const productsMap = new Map(products.map(p => [p.id, p]));

  // Calculations
  const subtotal = quote.items.reduce((acc, item) => {
    const product = productsMap.get(item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);
  const discountAmount = quote.discountType === 'fixed' ? quote.discount : subtotal * (quote.discount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const taxAmount = totalAfterDiscount * (quote.taxRate / 100);
  const grandTotal = totalAfterDiscount + taxAmount;

  const tableRows = quote.items.map(item => {
    const product = productsMap.get(item.productId);
    if (!product) return '';
    return `
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${product.name}</td>
        <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;">${formatCurrency(product.price)}</td>
        <td style="border: 1px solid #dddddd; text-align: center; padding: 8px;">${item.quantity}</td>
        <td style="border: 1px solid #dddddd; text-align: right; padding: 8px;">${formatCurrency(product.price * item.quantity)}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${quote.name}</title></head>
      <body style="font-family: Arial, sans-serif;">
        <h1>${quote.name}</h1>
        <p>Data: ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Produto</th>
              <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; background-color: #f2f2f2;">Preço Unitário</th>
              <th style="border: 1px solid #dddddd; text-align: center; padding: 8px; background-color: #f2f2f2;">Quantidade</th>
              <th style="border: 1px solid #dddddd; text-align: right; padding: 8px; background-color: #f2f2f2;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="margin-top: 20px; width: 300px; margin-left: auto; text-align: right;">
          <p><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</p>
          <p><strong>Desconto:</strong> -${formatCurrency(discountAmount)}</p>
          <p><strong>Taxa (${quote.taxRate}%):</strong> +${formatCurrency(taxAmount)}</p>
          <hr/>
          <h3><strong>Total Geral:</strong> ${formatCurrency(grandTotal)}</h3>
        </div>
      </body>
    </html>
  `;
  
  const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
  const filename = `${quote.name.replace(/\s+/g, '_')}.doc`;
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
