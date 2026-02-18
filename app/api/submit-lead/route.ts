import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const leadData = {
      agent_id: formData.get('agent_id') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || null,
      budget: formData.get('budget') as string || null,
      room_count: formData.get('room_count') as string || null,
      district: formData.get('district') as string || null,
      notes: formData.get('notes') as string || null,
      source: 'landing_page_form',
      status: 'new',
    };

    // @ts-ignore
    const { error } = await supabase
      .from('leads')
      .insert(leadData);

    if (error) {
      console.error('Lead kayıt hatası:', error);
      const domain = formData.get('agent_domain') as string;
      return NextResponse.redirect(new URL(`/d/${domain}?error=true`, request.url));
    }

    // Başarılı - redirect with success message
    const domain = formData.get('agent_domain') as string;
    return NextResponse.redirect(new URL(`/d/${domain}?success=true`, request.url));
    
  } catch (error: any) {
    console.error('API Hatası:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
