import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { supabase } from '@/lib/supabase'
import type { NutritionalGoals, Client } from '@/lib/tipos'

export default function PerfilScreen() {
  const [metas, setMetas] = useState<NutritionalGoals | null>(null)
  const [nutritionist, setNutritionist] = useState<{ full_name: string; whatsapp?: string } | null>(null)
  const [adesaoMedia, setAdesaoMedia] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPerfil()
  }, [])

  async function loadPerfil() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Metas do cliente
    const { data: goals } = await supabase
      .from('nutritional_goals')
      .select('*')
      .eq('client_id', user.id)
      .maybeSingle()
    setMetas(goals)

    // Dados do cliente (inclui nutritionist_id)
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', user.id)
      .single()

    if (client?.nutritionist_id) {
      const { data: nutri } = await supabase
        .from('nutritionists')
        .select('full_name, whatsapp')
        .eq('id', client.nutritionist_id)
        .single()
      setNutritionist(nutri)
    }

    // Média de adesão (últimos 7 dias)
    const seteDias = new Date()
    seteDias.setDate(seteDias.getDate() - 7)
    const desde = seteDias.toISOString().split('T')[0]

    const { data: adesao } = await supabase
      .from('daily_adherence')
      .select('*')
      .eq('client_id', user.id)
      .gte('data', desde)

    if (adesao?.length) {
      const total = adesao.reduce((s, a) => s + a.total_refeicoes, 0)
      const cumpridas = adesao.reduce((s, a) => s + a.cumpridas, 0)
      const meias = adesao.reduce((s, a) => s + a.metade, 0)
      const pct = total > 0 ? Math.round(((cumpridas + meias * 0.5) / total) * 100) : 0
      setAdesaoMedia(pct)
    }

    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Meu Perfil</Text>

      {/* Metas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minhas Metas Diárias</Text>
        {metas ? (
          <View style={styles.metasGrid}>
            {metas.calorias && (
              <View style={styles.metaCard}>
                <Text style={styles.metaValue}>{metas.calorias}</Text>
                <Text style={styles.metaLabel}>kcal</Text>
              </View>
            )}
            {metas.proteina_g && (
              <View style={styles.metaCard}>
                <Text style={styles.metaValue}>{metas.proteina_g}g</Text>
                <Text style={styles.metaLabel}>Proteína</Text>
              </View>
            )}
            {metas.carboidrato_g && (
              <View style={styles.metaCard}>
                <Text style={styles.metaValue}>{metas.carboidrato_g}g</Text>
                <Text style={styles.metaLabel}>Carboidrato</Text>
              </View>
            )}
            {metas.gordura_g && (
              <View style={styles.metaCard}>
                <Text style={styles.metaValue}>{metas.gordura_g}g</Text>
                <Text style={styles.metaLabel}>Gordura</Text>
              </View>
            )}
            {metas.agua_ml && (
              <View style={styles.metaCard}>
                <Text style={styles.metaValue}>{metas.agua_ml}ml</Text>
                <Text style={styles.metaLabel}>Água</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhuma meta definida pelo seu nutricionista</Text>
        )}
      </View>

      {/* Adesão */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Adesão</Text>
        <View style={styles.adesaoCard}>
          <Text style={styles.adesaoValue}>{adesaoMedia}%</Text>
          <Text style={styles.adesaoLabel}>Média dos últimos 7 dias</Text>
        </View>
      </View>

      {/* Nutricionista */}
      {nutritionist && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meu Nutricionista</Text>
          <Text style={styles.nutriName}>{nutritionist.full_name}</Text>
          {nutritionist.whatsapp && (
            <TouchableOpacity style={styles.whatsappBtn}>
              <Text style={styles.whatsappText}>📱 Enviar WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sair */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D2D2D', fontFamily: 'PlayfairDisplay', marginBottom: 20 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2D2D2D', marginBottom: 12 },
  metasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaCard: {
    backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, alignItems: 'center',
    minWidth: 80, flex: 1,
  },
  metaValue: { fontSize: 18, fontWeight: '700', color: '#7EB89A' },
  metaLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
  adesaoCard: { alignItems: 'center', paddingVertical: 12 },
  adesaoValue: { fontSize: 36, fontWeight: '700', color: '#7EB89A' },
  adesaoLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  nutriName: { fontSize: 16, fontWeight: '500', color: '#2D2D2D' },
  whatsappBtn: { marginTop: 8, backgroundColor: '#25D366', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  whatsappText: { color: '#FFFFFF', fontWeight: '600' },
  logoutBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#EF4444', fontWeight: '500' },
})
