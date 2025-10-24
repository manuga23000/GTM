import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type with jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface VehicleReportData {
  plateNumber: string
  brand: string
  model: string
  year: number
  clientName: string
  clientPhone?: string
  serviceType?: string
  entryDate: Date
  estimatedCompletionDate?: Date | null
  finalizedAt?: Date
  status: string
  km?: number
}

interface WeeklyReportData {
  vehiclesIn: VehicleReportData[]
  vehiclesOut: VehicleReportData[]
  vehiclesInWorkshop: VehicleReportData[]
  startDate: Date
  endDate: Date
}

export function generateWeeklyPDF(data: WeeklyReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  const blackColor: [number, number, number] = [0, 0, 0]
  const redColor: [number, number, number] = [220, 38, 38]
  const blueColor: [number, number, number] = [37, 99, 235]
  const lightGray: [number, number, number] = [245, 245, 245]

  doc.setFillColor(...blackColor)
  doc.rect(0, 0, pageWidth, 50, 'F')

  try {
    const logoPath = '/images/header/LOGO GTM.png'
    doc.addImage(logoPath, 'PNG', 15, 8, 34, 34, undefined, 'FAST')
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error)
    doc.setFillColor(200, 200, 200)
    doc.rect(15, 8, 34, 34, 'F')
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text('LOGO GTM', 32, 28, { align: 'center' })
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE SEMANAL GTM', pageWidth * 0.6, 22, { align: 'center' })

  const textWidth =
    (doc.getTextWidth('REPORTE SEMANAL GTM') * 26) / doc.getFontSize()
  const lineX = pageWidth * 0.6 - textWidth / 2

  doc.setDrawColor(...redColor)
  doc.setLineWidth(2)
  doc.line(lineX, 28, lineX + textWidth, 28)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255)
  const dateRange = `${formatDate(data.startDate)} - ${formatDate(
    data.endDate
  )}`
  doc.text(dateRange, pageWidth * 0.6, 38, { align: 'center' })

  let yPosition = 60
  doc.setTextColor(...blackColor)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN', 14, yPosition)

  doc.setDrawColor(...redColor)
  doc.setLineWidth(1)
  doc.line(14, yPosition + 2, 50, yPosition + 2)

  yPosition += 12

  const boxHeight = 28
  const boxWidth = pageWidth - 28

  doc.setFillColor(...blackColor)
  doc.roundedRect(14, yPosition, boxWidth, boxHeight, 3, 3, 'F')
  doc.setDrawColor(...redColor)
  doc.setLineWidth(2)
  doc.roundedRect(14, yPosition, boxWidth, boxHeight, 3, 3, 'S')

  doc.setTextColor(...redColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('VEHICULOS INGRESADOS', 14 + boxWidth / 2, yPosition + 10, {
    align: 'center',
  })
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text(
    data.vehiclesIn.length.toString(),
    14 + boxWidth / 2,
    yPosition + 22,
    { align: 'center' }
  )

  yPosition += boxHeight + 8

  doc.setFillColor(...redColor)
  doc.roundedRect(14, yPosition, boxWidth, boxHeight, 3, 3, 'F')
  doc.setDrawColor(...blackColor)
  doc.setLineWidth(2)
  doc.roundedRect(14, yPosition, boxWidth, boxHeight, 3, 3, 'S')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('VEHICULOS ENTREGADOS', 14 + boxWidth / 2, yPosition + 10, {
    align: 'center',
  })
  doc.setFontSize(22)
  doc.text(
    data.vehiclesOut.length.toString(),
    14 + boxWidth / 2,
    yPosition + 22,
    { align: 'center' }
  )

  yPosition += boxHeight + 8

  doc.setFillColor(...blueColor)
  doc.roundedRect(14, yPosition, boxWidth, boxHeight, 3, 3, 'F')
  doc.setDrawColor(...blackColor)
  doc.setLineWidth(2)
  doc.roundedRect(14, yPosition, boxWidth, boxHeight, 3, 3, 'S')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('VEHICULOS EN TALLER', 14 + boxWidth / 2, yPosition + 10, {
    align: 'center',
  })
  doc.setFontSize(22)
  doc.text(
    data.vehiclesInWorkshop.length.toString(),
    14 + boxWidth / 2,
    yPosition + 22,
    { align: 'center' }
  )

  yPosition += boxHeight + 18

  if (data.vehiclesIn.length > 0) {
    doc.setTextColor(...blackColor)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('VEHICULOS INGRESADOS', 14, yPosition)

    doc.setDrawColor(...redColor)
    doc.setLineWidth(1)
    doc.line(14, yPosition + 2, 85, yPosition + 2)

    yPosition += 8

    const tableData = data.vehiclesIn.map(v => [
      `${v.brand} ${v.model} (${v.year})`,
      v.serviceType || 'No especificado',
      formatDate(v.entryDate),
      v.km ? `${v.km.toLocaleString()} km` : '-',
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Vehículo', 'Servicio', 'Ingreso', 'KM']],
      columnStyles: {
        0: { cellWidth: 80, fontSize: 12 },
        1: { cellWidth: 60, fontSize: 12 },
        2: { cellWidth: 30, fontSize: 12 },
        3: { cellWidth: 30, fontSize: 12 }
      },
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: blackColor,
        textColor: [255, 255, 255],
        fontSize: 14,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: redColor,
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 12,
        halign: 'center',
        textColor: blackColor,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      margin: { left: 14, right: 14 },
    })

    yPosition = doc.lastAutoTable.finalY + 15
  }

  if (data.vehiclesOut.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    doc.setTextColor(...blackColor)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('VEHICULOS ENTREGADOS', 14, yPosition)

    doc.setDrawColor(...redColor)
    doc.setLineWidth(1)
    doc.line(14, yPosition + 2, 85, yPosition + 2)

    yPosition += 8

    const tableData = data.vehiclesOut.map(v => [
      `${v.brand} ${v.model} (${v.year})`,
      v.serviceType || 'No especificado',
      v.finalizedAt ? formatDate(v.finalizedAt) : '-',
      v.km ? `${v.km.toLocaleString()} km` : '-',
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Vehículo', 'Servicio', 'Entrega', 'KM']],
      columnStyles: {
        0: { cellWidth: 80, fontSize: 12 },
        1: { cellWidth: 60, fontSize: 12 },
        2: { cellWidth: 30, fontSize: 12 },
        3: { cellWidth: 30, fontSize: 12 }
      },
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: redColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: blackColor,
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'center',
        textColor: blackColor,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      margin: { left: 14, right: 14 },
    })

    yPosition = doc.lastAutoTable.finalY + 15
  }

  if (data.vehiclesInWorkshop.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    doc.setTextColor(...blackColor)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('VEHICULOS EN TALLER', 14, yPosition)

    doc.setDrawColor(...blueColor)
    doc.setLineWidth(1)
    doc.line(14, yPosition + 2, 85, yPosition + 2)

    yPosition += 8

    const tableData = data.vehiclesInWorkshop.map(v => [
      `${v.brand} ${v.model} (${v.year})`,
      v.serviceType || 'No especificado',
      formatDate(v.entryDate),
      v.km ? `${v.km.toLocaleString()} km` : '-',
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Vehículo', 'Servicio', 'Ingreso', 'KM']],
      columnStyles: {
        0: { cellWidth: 80, fontSize: 12 },
        1: { cellWidth: 60, fontSize: 12 },
        2: { cellWidth: 30, fontSize: 12 },
        3: { cellWidth: 30, fontSize: 12 }
      },
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: blueColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: blackColor,
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'center',
        textColor: blackColor,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      margin: { left: 14, right: 14 },
    })

    yPosition = doc.lastAutoTable.finalY + 10
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    const footerY = doc.internal.pageSize.height - 20
    doc.setDrawColor(...redColor)
    doc.setLineWidth(0.5)
    doc.line(14, footerY, pageWidth - 14, footerY)

    doc.setFontSize(8)
    doc.setTextColor(80)
    doc.setFont('helvetica', 'normal')

    const footerText = `Generado el ${new Date().toLocaleDateString(
      'es-AR'
    )} a las ${new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
    doc.text(footerText, pageWidth / 2, footerY + 8, { align: 'center' })

    doc.setTextColor(...redColor)
    doc.setFont('helvetica', 'bold')
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, footerY + 8, {
      align: 'right',
    })
  }

  const fileName = `Reporte_Semanal_GTM_${formatDateForFilename(
    data.startDate
  )}_${formatDateForFilename(data.endDate)}.pdf`
  doc.save(fileName)
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateForFilename(date: Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}
