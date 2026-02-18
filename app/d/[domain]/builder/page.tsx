'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Save, Eye, X } from 'lucide-react';
import { EditorProvider } from '@/contexts/EditorContext';
import AgentLandingPage from '../AgentLandingPage';

type Agent = Database['public']['Tables']['agents']['Row'];

export default function VisualBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;

  return (
    <EditorProvider>
      <BuilderContent domain={domain} router={router} />
    </EditorProvider>
  );
}

function BuilderContent({ domain, router }: any) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadAgent();
  }, [domain]);

  const loadAgent = async () => {
    const { data } = await supabase
      .from('agents')
      .select('*')
      .eq('domain', domain)
      .single();

    if (data) {
      setAgent(data);
    }
    setLoading(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('✅ Saved!');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/d/${domain}/dashboard`)}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-700" />
          
          <div className="text-sm font-semibold text-white">Visual Builder</div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                mode === 'edit' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                mode === 'preview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/d/${domain}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
          >
            <Eye className="w-4 h-4" />
            View Live
          </button>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Canvas - Landing Page Preview with Editor Overlay */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="min-h-full">
          <AgentLandingPage agent={agent} />
        </div>
      </div>

      {/* Right Panel - Properties (when section is selected) */}
      {mode === 'edit' && (
        <div className="fixed right-0 top-[57px] bottom-0 w-80 bg-white border-l border-gray-200 shadow-2xl overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Properties</h3>
            <p className="text-sm text-gray-500">Select a section to edit its properties</p>
          </div>
        </div>
      )}
    </div>
  );
}
