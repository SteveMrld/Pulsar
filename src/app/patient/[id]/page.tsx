import { redirect } from 'next/navigation'

export default function PatientDefaultPage({ params }: { params: { id: string } }) {
  redirect(`/patient/${params.id}/cockpit`)
}
