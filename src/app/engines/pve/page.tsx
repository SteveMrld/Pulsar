import { redirect } from 'next/navigation'
export default function PVERedirect() { redirect('/engines?tab=pve'); return null }
