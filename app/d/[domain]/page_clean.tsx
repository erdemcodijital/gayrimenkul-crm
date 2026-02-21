import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import ClientLandingPage from './ClientLandingPage';

type Agent = Database['public']['Tables']['agents']['Row'];

interface PageProps {
  params: {
    domain: string;
  };
  searchParams: {
    success?: string;
    error?: string;
  };
}

async function getAgent(domain: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('domain', domain)
    .single();

  if (error || !data) return null;
  return data;
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
  const agent = await getAgent(params.domain);

  if (!agent) {
    return {
      title: 'Danışman Bulunamadı',
    };
  }

  return {
    title: `${agent.name} - Gayrimenkul Danışmanı`,
    description: agent.hero_subtitle || 'Profesyonel gayrimenkul danışmanlığı hizmeti',
  };
}

export default async function AgentPage({ params, searchParams }: PageProps) {
  const agent = await getAgent(params.domain);

  if (!agent) {
    notFound();
  }

  // Aktif mi kontrolü
  if (!agent.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap Devre Dışı</h1>
          <p className="text-gray-600 mb-6">Bu danışman hesabı şu anda devre dışı bırakılmış durumda.</p>
        </div>
      </div>
    );
  }

  // Lisans kontrolü
  if (agent.license_status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lisans Süresi Dolmuş</h1>
          <p className="text-gray-600 mb-6">Bu danışman hesabının lisansı aktif değil.</p>
        </div>
      </div>
    );
  }

  return (
    <ClientLandingPage 
      agent={agent} 
      searchParams={searchParams}
    />
  );
}
