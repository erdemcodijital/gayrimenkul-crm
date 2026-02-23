import { supabase } from './supabase';

export interface Setting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string): Promise<any | null> {
  try {
    const { data, error } = await supabase.rpc('get_setting', { setting_key: key });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
}

/**
 * Get all settings by category
 */
export async function getSettingsByCategory(category: string): Promise<Setting[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('category', category);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error getting settings for category ${category}:`, error);
    return [];
  }
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Setting[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('category')
      .order('key');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting all settings:', error);
    return [];
  }
}

/**
 * Upsert a setting
 */
export async function upsertSetting(key: string, value: any, category: string, description?: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('upsert_setting', {
      setting_key: key,
      setting_value: value,
      setting_category: category,
      setting_description: description
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error upserting setting ${key}:`, error);
    return false;
  }
}

/**
 * Get all email templates
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting email templates:', error);
    return [];
  }
}

/**
 * Get email template by name
 */
export async function getEmailTemplate(name: string): Promise<EmailTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', name)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting email template ${name}:`, error);
    return null;
  }
}

/**
 * Create or update email template
 */
export async function upsertEmailTemplate(template: Partial<EmailTemplate>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('email_templates')
      .upsert(template);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error upserting email template:', error);
    return false;
  }
}

/**
 * Delete email template
 */
export async function deleteEmailTemplate(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting email template:', error);
    return false;
  }
}

/**
 * Get all WhatsApp templates
 */
export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting WhatsApp templates:', error);
    return [];
  }
}

/**
 * Get WhatsApp template by name
 */
export async function getWhatsAppTemplate(name: string): Promise<WhatsAppTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('name', name)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting WhatsApp template ${name}:`, error);
    return null;
  }
}

/**
 * Create or update WhatsApp template
 */
export async function upsertWhatsAppTemplate(template: Partial<WhatsAppTemplate>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('whatsapp_templates')
      .upsert(template);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error upserting WhatsApp template:', error);
    return false;
  }
}

/**
 * Delete WhatsApp template
 */
export async function deleteWhatsAppTemplate(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('whatsapp_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting WhatsApp template:', error);
    return false;
  }
}
