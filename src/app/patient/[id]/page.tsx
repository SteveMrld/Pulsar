import { useLang } from '@/contexts/LanguageContext'
import { redirect } from 'next/navigation'

export default function PatientDefaultPage({ params }: { params: { id: string } }) {
  const { t } = useLang()
  redirect(`/patient/${params.id}/cockpit`)
}
