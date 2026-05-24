// Script para aplicar migrations no Supabase via Management API
// Uso: SUPABASE_ACCESS_TOKEN=seu_token node scripts/migrate.mjs

const PROJECT_REF = 'zshuzylltlbcnlwbpijp'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error(`
Para aplicar as migrations, você precisa:
1. Criar um token em: https://supabase.com/dashboard/account/tokens
2. Executar: $env:SUPABASE_ACCESS_TOKEN="seu_token"; node scripts/migrate.mjs
Ou cole o SQL manualmente no SQL Editor do Supabase.
`)
  process.exit(1)
}

async function runSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    console.error(`Erro: ${res.status} - ${err}`)
    process.exit(1)
  }
  console.log(`OK: ${sql.slice(0, 60)}...`)
}

const fs = await import('fs')
const path = await import('path')

const migrationsDir = new URL('../supabase/migrations', import.meta.url).pathname
const files = fs.readdirSync(migrationsDir).sort()

for (const file of files) {
  if (!file.endsWith('.sql')) continue
  console.log(`Aplicando ${file}...`)
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
  await runSQL(sql)
}

console.log('\nTodas as migrations aplicadas com sucesso!')
