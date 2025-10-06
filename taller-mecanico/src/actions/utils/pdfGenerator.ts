// src/actions/utils/pdfGenerator.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  startDate: Date
  endDate: Date
}

export function generateWeeklyPDF(data: WeeklyReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Configuración de colores - Negro, Rojo y Blanco
  const blackColor: [number, number, number] = [0, 0, 0]
  const redColor: [number, number, number] = [220, 38, 38] // Rojo intenso
  const lightGray: [number, number, number] = [245, 245, 245]

  // HEADER CON LOGO
  doc.setFillColor(...blackColor)
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Intentar cargar logo desde /public/logo.png
  try {
    // Coloca tu logo en /public/logo.png
    // O reemplaza con la ruta correcta de tu logo
    const logoPath = '/logo.png'
    doc.addImage(logoPath, 'PNG', 15, 10, 30, 30)
  } catch (error) {
    // Si el logo no está disponible, continuar sin él
    console.log('Logo no encontrado en /public/logo.png')
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE SEMANAL GTM', pageWidth / 2, 22, { align: 'center' })

  // Línea roja decorativa
  doc.setDrawColor(...redColor)
  doc.setLineWidth(2)
  doc.line(pageWidth / 2 - 50, 28, pageWidth / 2 + 50, 28)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255)
  const dateRange = `${formatDate(data.startDate)} - ${formatDate(
    data.endDate
  )}`
  doc.text(dateRange, pageWidth / 2, 38, { align: 'center' })

  // RESUMEN (sin "EJECUTIVO")
  let yPosition = 60
  doc.setTextColor(...blackColor)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN', 14, yPosition)

  // Línea roja bajo el título
  doc.setDrawColor(...redColor)
  doc.setLineWidth(1)
  doc.line(14, yPosition + 2, 50, yPosition + 2)

  yPosition += 12

  // Estadísticas en cajas
  const boxHeight = 28
  const boxWidth = (pageWidth - 38) / 2

  // Caja de Ingresos - Fondo negro con borde rojo
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

  // Caja de Salidas - Fondo rojo con borde negro
  doc.setFillColor(...redColor)
  doc.roundedRect(14 + boxWidth + 10, yPosition, boxWidth, boxHeight, 3, 3, 'F')
  doc.setDrawColor(...blackColor)
  doc.setLineWidth(2)
  doc.roundedRect(14 + boxWidth + 10, yPosition, boxWidth, boxHeight, 3, 3, 'S')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(
    'VEHICULOS ENTREGADOS',
    14 + boxWidth + 10 + boxWidth / 2,
    yPosition + 10,
    { align: 'center' }
  )
  doc.setFontSize(22)
  doc.text(
    data.vehiclesOut.length.toString(),
    14 + boxWidth + 10 + boxWidth / 2,
    yPosition + 22,
    { align: 'center' }
  )

  yPosition += boxHeight + 18

  // VEHÍCULOS INGRESADOS (SIN EMOJI)
  if (data.vehiclesIn.length > 0) {
    doc.setTextColor(...blackColor)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('VEHICULOS INGRESADOS', 14, yPosition)

    // Línea roja decorativa
    doc.setDrawColor(...redColor)
    doc.setLineWidth(1)
    doc.line(14, yPosition + 2, 85, yPosition + 2)

    yPosition += 8

    const tableData = data.vehiclesIn.map(v => [
      v.plateNumber,
      `${v.brand} ${v.model} (${v.year})`,
      v.clientName,
      v.serviceType || 'No especificado',
      formatDate(v.entryDate),
      v.km ? `${v.km.toLocaleString()} km` : '-',
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Patente', 'Vehiculo', 'Cliente', 'Servicio', 'Ingreso', 'KM']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: blackColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: redColor,
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

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // VEHÍCULOS ENTREGADOS (SIN EMOJI)
  if (data.vehiclesOut.length > 0) {
    // Verificar si necesitamos nueva página
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    doc.setTextColor(...blackColor)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text('VEHICULOS ENTREGADOS', 14, yPosition)

    // Línea roja decorativa
    doc.setDrawColor(...redColor)
    doc.setLineWidth(1)
    doc.line(14, yPosition + 2, 85, yPosition + 2)

    yPosition += 8

    const tableData = data.vehiclesOut.map(v => [
      v.plateNumber,
      `${v.brand} ${v.model} (${v.year})`,
      v.clientName,
      v.serviceType || 'No especificado',
      v.finalizedAt ? formatDate(v.finalizedAt) : '-',
      v.km ? `${v.km.toLocaleString()} km` : '-',
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Patente', 'Vehiculo', 'Cliente', 'Servicio', 'Entrega', 'KM']],
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

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // FOOTER con diseño
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Línea decorativa superior del footer
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
    doc.text(`Pagina ${i} de ${pageCount}`, pageWidth - 14, footerY + 8, {
      align: 'right',
    })
  }

  // Guardar PDF
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
