import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ClientPageWrapper from './ClientPageWrapper';

interface PageProps {
  params: {
    domain: string;
    pageSlug: string;
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { domain, pageSlug } = params;

  // Get agent by domain
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .eq('domain', domain)
    .single();

  if (agentError || !agent) {
    notFound();
  }

  // Get page by slug
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('agent_id', agent.id)
    .eq('slug', pageSlug)
    .eq('visible', true)
    .single();

  if (pageError || !page) {
    notFound();
  }

  return <ClientPageWrapper agent={agent} currentPage={page} />;
}
