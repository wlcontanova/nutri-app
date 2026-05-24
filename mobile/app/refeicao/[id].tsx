import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { Meal, MealSubstitution, MealLogStatus } from '@/lib/tipos'

export default function RefeicaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [substituicoes, setSubstituicoes] = useState<MealSubstitution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMeal()
  }, [id])

  async function loadMeal() {
    const { data: mealData } = await supabase.from('meals').select('*').eq('id', id).single()
    setMeal(mealData)

    const { data: subs } = await supabase
      .from('meal_substitutions')
      .select('*')
      .eq('meal_id', id)
      .order('ordem')
    setSubstituicoes(subs || [])
    setLoading(false)
  }

  async function logMeal(status: MealLogStatus) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dataStr = new Date().toISOString().split('T')[0]
    await supabase.from('meal_logs').insert({
      client_id: user.id, meal_id: id, data: dataStr, status,
    })
  }

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#7EB89A" /></View>
  }

  if (!meal) {
    return <View style={styles.container}><Text>Refeição não encontrada</Text></View>
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {meal.foto_url ? (
        <Image source={{ uri: meal.foto_url }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoEmoji}>🍽️</Text>
        </View>
      )}

      <Text style={styles.name}>{meal.name}</Text>

      {meal.calories && (
        <Text style={styles.calories}>{meal.calories} kcal</Text>
      )}

      {/* Macros */}
      <View style={styles.macrosRow}>
        <View style={styles.macroBadge}>
          <Text style={styles.macroValue}>{meal.protein_g || 0}g</Text>
          <Text style={styles.macroLabel}>Proteína</Text>
        </View>
        <View style={styles.macroBadge}>
          <Text style={styles.macroValue}>{meal.carbs_g || 0}g</Text>
          <Text style={styles.macroLabel}>Carboidrato</Text>
        </View>
        <View style={styles.macroBadge}>
          <Text style={styles.macroValue}>{meal.fat_g || 0}g</Text>
          <Text style={styles.macroLabel}>Gordura</Text>
        </View>
      </View>

      {/* Ingredientes */}
      {meal.ingredientes?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {meal.ingredientes.map((ing, i) => (
            <View key={i} style={styles.ingRow}>
              <Text style={styles.ingDot}>•</Text>
              <Text style={styles.ingText}>{ing.nome}</Text>
              <Text style={styles.ingQty}>{ing.quantidade}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Modo de preparo */}
      {meal.modo_preparo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modo de Preparo</Text>
          <Text style={styles.preparoText}>{meal.modo_preparo}</Text>
        </View>
      )}

      {/* Substituições */}
      {substituicoes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Substituições</Text>
          {substituicoes.map((sub) => (
            <TouchableOpacity key={sub.id} style={styles.subCard}>
              {sub.foto_url ? (
                <Image source={{ uri: sub.foto_url }} style={styles.subPhoto} />
              ) : null}
              <Text style={styles.subName}>{sub.name}</Text>
              {sub.calories && <Text style={styles.subCal}>{sub.calories} kcal</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Botões de ação rápida */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => logMeal('comi_tudo')}>
          <Text style={styles.actionText}>✅ Comi tudo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionLight]} onPress={() => logMeal('metade')}>
          <Text style={styles.actionText}>◐ Comi metade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionSkip]} onPress={() => logMeal('pulei')}>
          <Text style={styles.actionText}>✗ Pulei</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { padding: 20 },
  photo: { width: '100%', height: 250, borderRadius: 16, marginBottom: 16 },
  photoPlaceholder: { backgroundColor: '#F0EDE8', justifyContent: 'center', alignItems: 'center' },
  photoEmoji: { fontSize: 64 },
  name: { fontSize: 24, fontWeight: '700', color: '#2D2D2D' },
  calories: { fontSize: 16, color: '#9CA3AF', marginTop: 4 },
  macrosRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  macroBadge: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, alignItems: 'center',
  },
  macroValue: { fontSize: 18, fontWeight: '700', color: '#7EB89A' },
  macroLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2D2D2D', marginBottom: 8 },
  ingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  ingDot: { fontSize: 14, color: '#7EB89A', marginRight: 6 },
  ingText: { flex: 1, fontSize: 14, color: '#2D2D2D' },
  ingQty: { fontSize: 12, color: '#9CA3AF' },
  preparoText: { fontSize: 14, color: '#2D2D2D', lineHeight: 20 },
  subCard: {
    backgroundColor: '#F9F9F9', borderRadius: 12, padding: 12, marginBottom: 8,
  },
  subPhoto: { width: '100%', height: 80, borderRadius: 8, marginBottom: 8 },
  subName: { fontSize: 14, fontWeight: '600', color: '#2D2D2D' },
  subCal: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  actions: { gap: 8, marginTop: 24 },
  actionBtn: { backgroundColor: '#7EB89A', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionLight: { backgroundColor: '#E8A87C' },
  actionSkip: { backgroundColor: '#F0EDE8' },
  actionText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
})
