import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlanesClient from './PlanesClient'

export default async function PlanesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase.from('usuario').select('rol').eq('id', user!.id).single()
  if (yo?.rol !== 'superadmin') redirect('/dashboard')

  const { data: planes } = await supabase
    .from('plan')
    .select('*')
    .order('precio', { ascending: true })

  return (
    <div className="max-w-5xl">
      <PlanesClient planes={planes ?? []} />
    </div>
  )
}
