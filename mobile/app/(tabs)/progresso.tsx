import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { supabase } from '@/lib/supabase'
import { calcularProgressoMacros, progressoAgua, coposDeAgua } from '@/lib/calculos'
import type { NutritionalGoals, Meal, MealLog } from '@/lib/tipos'

export default function ProgressoScreen() {
  const [metas, setMetas] = useState<NutritionalGoals | null>(null)
  const [macros, setMacros] = useState<{ label: string; atual: number; meta: number; percentual: number; cor: string }[]>([])
  const [aguaMl, setAguaMl] = useState(0)
  const [copos, setCopos] = useState(0)

  useEffect(() => {
    loadProgresso()
  }, [])

  async function loadProgresso() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: goals } = await supabase
      .from('nutritional_goals')
      .select('*')
      .eq('client_id', user.id)
      .maybeSingle()
    setMetas(goals)

    const hoje = new Date().toISOString().split('T')[0]
    const { data: logs } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('client_id', user.id)
      .eq('data', hoje)

    const { data: todayMeals } = await supabase
      .from('meals')
      .select('*')
      .in('id', (logs || []).map((l) => l.meal_id).filter(Boolean))

    if (goals && todayMeals && logs) {
      const progress = calcularProgressoMacros(todayMeals, logs, goals)
      setMacros(progress)
    }

    const { data: adesao } = await supabase
      .from('daily_adherence')
      .select('agua_ml')
      .eq('client_id', user.id)
      .eq('data', hoje)
      .maybeSingle()

    const agua = adesao?.agua_ml || 0
    setAguaMl(agua)
    setCopos(coposDeAgua(agua))
  }

  async function addAgua() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const hoje = new Date().toISOString().split('T')[0]
    const novaAgua = aguaMl + 200

    await supabase
      .from('daily_adherence')
      .upsert({ client_id: user.id, data: hoje, agua_ml: novaAgua }, { onConflict: 'client_id,data' })

    setAguaMl(novaAgua)
    setCopos(coposDeAgua(novaAgua))
  }

  const metaAgua = metas?.agua_ml || 2000

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Progresso do Dia</Text>

      {/* Macro bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macronutrientes</Text>
        {macros.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma refeição registrada hoje</Text>
        ) : (
          macros.map((macro) => (
            <View key={macro.label} style={styles.macroRow}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>{macro.label}</Text>
                <Text style={styles.macroValue}>
                  {Math.round(macro.atual)}g / {macro.meta}g
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${macro.percentual}%`, backgroundColor: macro.cor }]} />
              </View>
              <Text style={styles.macroPercent}>{macro.percentual}%</Text>
            </View>
          ))
        )}
      </View>

      {/* Água */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Água</Text>
        <View style={styles.waterContainer}>
          <View style={styles.waterCup}>
            <View style={[styles.waterFill, { height: `${progressoAgua(aguaMl, metaAgua)}%` }]} />
          </View>
          <View style={styles.waterInfo}>
            <Text style={styles.waterAmount}>{aguaMl}ml</Text>
            <Text style={styles.waterGoal}>Meta: {metaAgua}ml</Text>
            <Text style={styles.waterCups}>{copos} copos de 200ml</Text>
            <TouchableOpacity style={styles.waterButton} onPress={addAgua}>
              <Text style={styles.waterButtonText}>+ 200ml</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D2D2D', fontFamily: 'PlayfairDisplay', marginBottom: 20 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2D2D2D', marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },
  macroRow: { marginBottom: 12 },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroLabel: { fontSize: 14, color: '#2D2D2D', fontWeight: '500' },
  macroValue: { fontSize: 12, color: '#9CA3AF' },
  progressBg: { height: 10, backgroundColor: '#F0EDE8', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  macroPercent: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 2 },
  waterContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  waterCup: {
    width: 60, height: 100, borderRadius: 8,
    borderWidth: 2, borderColor: '#7EB89A',
    justifyContent: 'flex-end', overflow: 'hidden',
    backgroundColor: '#F0FDF4',
  },
  waterFill: { backgroundColor: '#7EB89A', width: '100%', borderRadius: 4 },
  waterInfo: { flex: 1 },
  waterAmount: { fontSize: 28, fontWeight: '700', color: '#7EB89A' },
  waterGoal: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  waterCups: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  waterButton: {
    marginTop: 8, backgroundColor: '#7EB89A', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 8, alignSelf: 'flex-start',
  },
  waterButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
})
