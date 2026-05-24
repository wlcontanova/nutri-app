export async function exportAdesaoPDF(
  clientName: string,
  data: {
    period: string
    averageAdherence: number
    totalMeals: number
    completedMeals: number
    skippedMeals: number
    macros: { label: string; atingido: number; meta: number }[]
    dailyData: { date: string; adherence: number }[]
  }
) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text('Nume', 20, 30)
  doc.setFontSize(14)
  doc.text(`Relatório de Adesão — ${clientName}`, 20, 42)
  doc.setFontSize(10)
  doc.text(`Período: ${data.period}`, 20, 52)

  doc.setFontSize(12)
  doc.text('Resumo Geral', 20, 68)
  doc.setFontSize(10)
  doc.text(`Adesão Média: ${data.averageAdherence}%`, 20, 80)
  doc.text(`Total de Refeições: ${data.totalMeals}`, 20, 88)
  doc.text(`Cumpridas: ${data.completedMeals}`, 20, 96)
  doc.text(`Puladas: ${data.skippedMeals}`, 20, 104)

  doc.setFontSize(12)
  doc.text('Macronutrientes', 20, 120)
  doc.setFontSize(10)
  data.macros.forEach((macro, i) => {
    const y = 132 + i * 8
    doc.text(`${macro.label}: ${macro.atingido}g / ${macro.meta}g (${Math.round((macro.atingido / (macro.meta || 1)) * 100)}%)`, 20, y)
  })

  doc.save(`adesao-${clientName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}
