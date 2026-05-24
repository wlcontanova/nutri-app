import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { supabase } from '@/lib/supabase'
import type { Meal, MealLogStatus } from '@/lib/tipos'

const MEAL_ORDER = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner']
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Café',
  morning_snack: 'Lanche 1',
  lunch: 'Almoço',
  afternoon_snack: 'Lanche 2',
  dinner: 'Janta',
}

export default function HojeScreen() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [logs, setLogs] = useState<Record<string, MealLogStatus>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadToday()
  }, [])

  async function loadToday() {
    const hoje = new Date().getDay() // 0=Dom, 1=Seg...
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: plans } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .limit(1)

    if (!plans?.length) {
      setLoading(false)
      return
    }

    const { data: todayMeals } = await supabase
      .from('meals')
      .select('*')
      .eq('meal_plan_id', plans[0].id)
      .eq('day_of_week', hoje)
      .order('meal_type')

    setMeals(todayMeals || [])

    const dataStr = new Date().toISOString().split('T')[0]
    const { data: todayLogs } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('client_id', user.id)
      .eq('data', dataStr)

    const logMap: Record<string, MealLogStatus> = {}
    for (const log of todayLogs || []) {
      if (log.meal_id) logMap[log.meal_id] = log.status
    }
    setLogs(logMap)
    setLoading(false)
  }

  async function logMeal(mealId: string, status: MealLogStatus) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dataStr = new Date().toISOString().split('T')[0]

    if (logs[mealId]) {
      await supabase
        .from('meal_logs')
        .update({ status, registrado_em: new Date().toISOString() })
        .eq('meal_id', mealId)
        .eq('client_id', user.id)
        .eq('data', dataStr)
    } else {
      await supabase
        .from('meal_logs')
        .insert({ client_id: user.id, meal_id: mealId, data: dataStr, status })
    }

    setLogs((prev) => ({ ...prev, [mealId]: status }))
  }

  const sortedMeals = [...meals].sort(
    (a, b) => MEAL_ORDER.indexOf(a.meal_type) - MEAL_ORDER.indexOf(b.meal_type)
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7EB89A" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>O que comer hoje?</Text>
      <Text style={styles.subtitle}>Suas refeições do dia</Text>

      {/* Checklist horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.checklist}>
        {sortedMeals.map((meal) => {
          const logged = logs[meal.id]
          return (
            <TouchableOpacity key={meal.id} style={styles.mealCard} activeOpacity={0.8}>
              {meal.foto_url ? (
                <Image source={{ uri: meal.foto_url }} style={styles.mealPhoto} />
              ) : (
                <View style={[styles.mealPhoto, styles.mealPhotoPlaceholder]}>
                  <Text style={styles.mealPhotoEmoji}>🍽️</Text>
                </View>
              )}
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealLabel}>{MEAL_LABELS[meal.meal_type]}</Text>

              {logged ? (
                <View style={styles.loggedBadge}>
                  <Text style={styles.loggedText}>
                    {logged === 'comi_tudo' ? '✅ Comi tudo' : logged === 'metade' ? '◐ Metade' : '✗ Pulei'}
                  </Text>
                </View>
              ) : (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => logMeal(meal.id, 'comi_tudo')}>
                    <Text style={styles.actionIcon}>✅</Text>
                    <Text style={styles.actionLabel}>Comi tudo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => logMeal(meal.id, 'metade')}>
                    <Text style={styles.actionIcon}>◐</Text>
                    <Text style={styles.actionLabel}>Metade</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => logMeal(meal.id, 'pulei')}>
                    <Text style={styles.actionIcon}>✗</Text>
                    <Text style={styles.actionLabel}>Pulei</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.semFome}>
                <Text style={styles.semFomeText}>😐 Tô sem fome</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#2D2D2D', fontFamily: 'PlayfairDisplay' },
  subtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4, marginBottom: 20 },
  checklist: { marginBottom: 20 },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealPhoto: { width: '100%', height: 120, borderRadius: 12, marginBottom: 12 },
  mealPhotoPlaceholder: { backgroundColor: '#F0EDE8', justifyContent: 'center', alignItems: 'center' },
  mealPhotoEmoji: { fontSize: 40 },
  mealName: { fontSize: 16, fontWeight: '600', color: '#2D2D2D' },
  mealLabel: { fontSize: 12, color: '#7EB89A', marginTop: 2 },
  loggedBadge: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#F0FDF4', borderRadius: 8 },
  loggedText: { fontSize: 13, fontWeight: '500', color: '#166534', textAlign: 'center' },
  actions: { marginTop: 8, gap: 4 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  actionIcon: { fontSize: 14, marginRight: 6 },
  actionLabel: { fontSize: 12, color: '#2D2D2D' },
  semFome: { marginTop: 8, paddingVertical: 4 },
  semFomeText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
})
