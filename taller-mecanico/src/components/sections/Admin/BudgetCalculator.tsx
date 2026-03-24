'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { DollarSign, CreditCard, FileDown, Info, Calculator } from 'lucide-react';

interface FinancingResult {
  originalAmount: number;
  threeInstallments: {
    total: number;
    perInstallment: number;
    interest: number;
  };
  sixInstallments: {
    total: number;
    perInstallment: number;
    interest: number;
  };
}

export default function BudgetCalculator() {
  const [amount, setAmount] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [vehicle, setVehicle] = useState<string>('');
  const [result, setResult] = useState<FinancingResult | null>(null);

  const calculateFinancing = () => {
    const originalAmount = parseFloat(amount);

    if (isNaN(originalAmount) || originalAmount <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    const threeInstallmentsTotal = originalAmount * 1.30;
    const threeInstallmentsPerMonth = threeInstallmentsTotal / 3;

    const sixInstallmentsTotal = originalAmount * 1.50;
    const sixInstallmentsPerMonth = sixInstallmentsTotal / 6;

    setResult({
      originalAmount,
      threeInstallments: {
        total: threeInstallmentsTotal,
        perInstallment: threeInstallmentsPerMonth,
        interest: threeInstallmentsTotal - originalAmount,
      },
      sixInstallments: {
        total: sixInstallmentsTotal,
        perInstallment: sixInstallmentsPerMonth,
        interest: sixInstallmentsTotal - originalAmount,
      },
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleClear = () => {
    setAmount('');
    setClientName('');
    setVehicle('');
    setResult(null);
  };

  const generatePDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const blackColor: [number, number, number] = [0, 0, 0];
    const redColor: [number, number, number] = [220, 38, 38];
    const primaryColor: [number, number, number] = [37, 99, 235];
    const secondaryColor: [number, number, number] = [75, 85, 99];
    const accentColor: [number, number, number] = [34, 197, 94];

    doc.setFillColor(blackColor[0], blackColor[1], blackColor[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');

    try {
      const logoPath = '/images/header/LOGO GTM.png';
      doc.addImage(logoPath, 'PNG', 15, 8, 34, 34, undefined, 'FAST');
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
      doc.setFillColor(200, 200, 200);
      doc.rect(15, 8, 34, 34, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('LOGO GTM', 32, 28, { align: 'center' });
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESUPUESTO', pageWidth * 0.65, 22, { align: 'center' });

    const titleWidth = (doc.getTextWidth('PRESUPUESTO') * 24) / doc.getFontSize();
    const lineX = pageWidth * 0.65 - titleWidth / 2;
    doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
    doc.setLineWidth(2);
    doc.line(lineX, 28, lineX + titleWidth, 28);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    const currentDate = new Date().toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(currentDate, pageWidth * 0.65, 38, { align: 'center' });

    doc.setTextColor(0, 0, 0);

    let yPosition = 58;

    if (clientName.trim() || vehicle.trim()) {
      const infoHeight = (clientName.trim() ? 9 : 0) + (vehicle.trim() ? 9 : 0) + 4;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, yPosition - 3, pageWidth - 30, infoHeight, 3, 3, 'F');

      let infoY = yPosition + 2;

      if (clientName.trim()) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Cliente:', 20, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(clientName, 44, infoY);
        infoY += 9;
      }

      if (vehicle.trim()) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Vehículo:', 20, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(vehicle, 46, infoY);
      }

      yPosition += infoHeight + 8;
    }

    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(15, yPosition, pageWidth - 30, 32, 4, 4, 'F');
    doc.setDrawColor(accentColor[0] - 30, accentColor[1] - 30, accentColor[2] - 30);
    doc.setLineWidth(1.5);
    doc.roundedRect(15, yPosition, pageWidth - 30, 32, 4, 4, 'S');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EFECTIVO / TRANSFERENCIA', pageWidth / 2, yPosition + 11, { align: 'center' });

    doc.setFontSize(24);
    doc.text(formatCurrency(result.originalAmount), pageWidth / 2, yPosition + 25, { align: 'center' });

    yPosition += 42;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
    doc.text('OPCIONES DE FINANCIACIÓN', pageWidth / 2, yPosition, { align: 'center' });

    doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
    doc.setLineWidth(2);
    const lineWidth = 110;
    doc.line(pageWidth / 2 - lineWidth / 2, yPosition + 3, pageWidth / 2 + lineWidth / 2, yPosition + 3);

    yPosition += 14;

    doc.setTextColor(0, 0, 0);

    doc.setFillColor(240, 249, 255);
    doc.roundedRect(15, yPosition, pageWidth - 30, 34, 4, 4, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(2);
    doc.roundedRect(15, yPosition, pageWidth - 30, 34, 4, 4, 'S');

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PLAN 3 CUOTAS', pageWidth / 2, yPosition + 12, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`3 cuotas de ${formatCurrency(result.threeInstallments.perInstallment)}`, pageWidth / 2, yPosition + 26, { align: 'center' });

    yPosition += 42;

    doc.setFillColor(250, 245, 255);
    doc.roundedRect(15, yPosition, pageWidth - 30, 34, 4, 4, 'F');
    doc.setDrawColor(147, 51, 234);
    doc.setLineWidth(2);
    doc.roundedRect(15, yPosition, pageWidth - 30, 34, 4, 4, 'S');

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(147, 51, 234);
    doc.text('PLAN 6 CUOTAS', pageWidth / 2, yPosition + 12, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`6 cuotas de ${formatCurrency(result.sixInstallments.perInstallment)}`, pageWidth / 2, yPosition + 26, { align: 'center' });

    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('GTM Taller Mecánico', pageWidth / 2, footerY, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('gtmsn291@gmail.com | Tel: 3364694921', pageWidth / 2, footerY + 5, { align: 'center' });

    const fileName = clientName.trim()
      ? `Presupuesto_${clientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      : `Presupuesto_${Date.now()}.pdf`;

    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-3 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-1 sm:mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-900" strokeWidth={2} />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900">
                  Calculadora de Presupuestos
                </h1>
              </div>
              <p className="text-amber-900/80 text-xs sm:text-sm lg:text-base pl-1">
                Sistema profesional de cotización y financiación
              </p>
            </div>
          </motion.div>
        </div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6"
        >
          <div className="space-y-4 sm:space-y-5">
            {/* Cliente */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-2">
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/25 transition-colors placeholder-zinc-600"
              />
            </div>

            {/* Vehículo */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-2">
                Vehículo
              </label>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="Ej: Ford Focus 2018"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/25 transition-colors placeholder-zinc-600"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-2">
                Monto del Presupuesto (ARS) *
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-base sm:text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100000"
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-base sm:text-lg font-medium focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/25 transition-colors placeholder-zinc-600"
                  onKeyPress={(e) => { if (e.key === 'Enter') calculateFinancing(); }}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={calculateFinancing}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-900 font-bold rounded-xl transition-all shadow-md shadow-amber-900/20 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" strokeWidth={2.2} />
                Calcular Presupuesto
              </button>
              {result && (
                <button
                  onClick={handleClear}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-semibold rounded-xl transition-all text-sm sm:text-base"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Resultados */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 sm:space-y-6"
          >
            {/* Efectivo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-emerald-900/15 border-2 border-emerald-700/40 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-xl">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-emerald-400">
                  Efectivo / Transferencia
                </h3>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-300 break-all">
                {formatCurrency(result.originalAmount)}
              </p>
              <p className="text-xs sm:text-sm text-emerald-500 mt-1 sm:mt-2">
                Sin recargos ni intereses
              </p>
            </motion.div>

            {/* Cuotas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {/* 3 Cuotas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/80 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-amber-500 rounded-xl flex-shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-900" strokeWidth={2} />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white">
                    Plan 3 Cuotas
                  </h3>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-zinc-700 gap-1">
                    <span className="text-xs sm:text-sm text-zinc-400">Valor por cuota</span>
                    <span className="text-xl sm:text-2xl font-bold text-amber-400 break-all">
                      {formatCurrency(result.threeInstallments.perInstallment)}
                    </span>
                  </div>
                  <div className="bg-amber-500/8 rounded-xl p-2.5 sm:p-3">
                    <p className="text-xs text-zinc-400 mb-1">Total a pagar</p>
                    <p className="text-base sm:text-lg font-semibold text-white break-all">
                      {formatCurrency(result.threeInstallments.total)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 6 Cuotas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-zinc-900/80 border-2 border-orange-500/30 rounded-2xl p-4 sm:p-6 shadow-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-orange-500 rounded-xl flex-shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white">
                    Plan 6 Cuotas
                  </h3>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-zinc-700 gap-1">
                    <span className="text-xs sm:text-sm text-zinc-400">Valor por cuota</span>
                    <span className="text-xl sm:text-2xl font-bold text-orange-400 break-all">
                      {formatCurrency(result.sixInstallments.perInstallment)}
                    </span>
                  </div>
                  <div className="bg-orange-500/8 rounded-xl p-2.5 sm:p-3">
                    <p className="text-xs text-zinc-400 mb-1">Total a pagar</p>
                    <p className="text-base sm:text-lg font-semibold text-white break-all">
                      {formatCurrency(result.sixInstallments.total)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tabla Comparativa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-zinc-800 px-3 sm:px-6 py-3 sm:py-4 border-b border-zinc-700">
                <h3 className="text-sm sm:text-lg font-bold text-white">
                  Tabla Comparativa
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-zinc-800/80">
                    <tr>
                      {['Opción', 'Cuota', 'Total', 'Interés'].map((h, i) => (
                        <th
                          key={h}
                          className={`px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <tr className="bg-emerald-900/10">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-semibold text-emerald-400 text-xs sm:text-sm">Efectivo/Transf.</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-zinc-500 text-xs sm:text-sm">-</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-white text-xs sm:text-sm">
                        {formatCurrency(result.originalAmount)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-zinc-500 text-xs sm:text-sm">-</td>
                    </tr>
                    <tr className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-semibold text-amber-400 text-xs sm:text-sm">3 Cuotas</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-amber-400 text-xs sm:text-sm">
                        {formatCurrency(result.threeInstallments.perInstallment)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-white text-xs sm:text-sm">
                        {formatCurrency(result.threeInstallments.total)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-red-400 font-medium text-xs sm:text-sm">
                        +{formatCurrency(result.threeInstallments.interest)}
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-semibold text-orange-400 text-xs sm:text-sm">6 Cuotas</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-orange-400 text-xs sm:text-sm">
                        {formatCurrency(result.sixInstallments.perInstallment)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-white text-xs sm:text-sm">
                        {formatCurrency(result.sixInstallments.total)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-red-400 font-medium text-xs sm:text-sm">
                        +{formatCurrency(result.sixInstallments.interest)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* PDF */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <button
                onClick={generatePDF}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 sm:gap-3"
              >
                <FileDown className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                <span className="text-sm sm:text-base lg:text-lg">Descargar Presupuesto (PDF)</span>
              </button>
            </motion.div>

            {/* Nota */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 sm:p-4"
            >
              <div className="flex gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-xs sm:text-sm text-amber-300">
                  <p className="font-semibold mb-1">Información importante:</p>
                  <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-amber-400">
                    <li>Las cuotas son mensuales y consecutivas</li>
                    <li>El valor de cada cuota ya incluye el interés correspondiente</li>
                    <li>Los precios están expresados en pesos argentinos (ARS)</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
