-- Randevu tipi enum
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- Appointments tablosu
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Randevu bilgileri
  title VARCHAR(255) NOT NULL,
  description TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 60, -- dakika cinsinden
  location VARCHAR(255), -- fiziksel veya online
  meeting_type VARCHAR(50) DEFAULT 'in_person', -- in_person, video_call, phone_call
  
  -- İletişim bilgileri (lead yoksa)
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Durum ve notlar
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  
  -- Meeting link (online randevular için)
  meeting_link TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

-- Indexes
CREATE INDEX idx_appointments_agent_id ON appointments(agent_id);
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_agent_date ON appointments(agent_id, appointment_date);

-- Agent availability (müsait saatler)
CREATE TABLE agent_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Gün ve saat bilgileri
  day_of_week INTEGER NOT NULL, -- 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Aktif/pasif
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: Aynı gün için çakışan saatler olmasın
  UNIQUE(agent_id, day_of_week, start_time, end_time)
);

CREATE INDEX idx_availability_agent_id ON agent_availability(agent_id);
CREATE INDEX idx_availability_day ON agent_availability(day_of_week);

-- Blocked dates (tatil, izin günleri)
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  blocked_date DATE NOT NULL,
  reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agent_id, blocked_date)
);

CREATE INDEX idx_blocked_dates_agent ON blocked_dates(agent_id);
CREATE INDEX idx_blocked_dates_date ON blocked_dates(blocked_date);

-- Appointment reminders log
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  reminder_type VARCHAR(20) NOT NULL, -- email, sms, whatsapp
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent', -- sent, failed, opened, clicked
  
  UNIQUE(appointment_id, reminder_type)
);

CREATE INDEX idx_reminders_appointment ON appointment_reminders(appointment_id);

-- Updated at trigger for appointments
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Updated at trigger for agent_availability
CREATE TRIGGER availability_updated_at
  BEFORE UPDATE ON agent_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Default availability for new agents (Mon-Fri, 09:00-18:00)
CREATE OR REPLACE FUNCTION create_default_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Pazartesi - Cuma, 09:00 - 18:00
  INSERT INTO agent_availability (agent_id, day_of_week, start_time, end_time, is_active)
  VALUES 
    (NEW.id, 1, '09:00', '18:00', true), -- Pazartesi
    (NEW.id, 2, '09:00', '18:00', true), -- Salı
    (NEW.id, 3, '09:00', '18:00', true), -- Çarşamba
    (NEW.id, 4, '09:00', '18:00', true), -- Perşembe
    (NEW.id, 5, '09:00', '18:00', true); -- Cuma
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_default_availability
  AFTER INSERT ON agents
  FOR EACH ROW
  EXECUTE FUNCTION create_default_availability();

-- Comments
COMMENT ON TABLE appointments IS 'Randevu kayıtları';
COMMENT ON TABLE agent_availability IS 'Danışman müsaitlik saatleri';
COMMENT ON TABLE blocked_dates IS 'Danışman tatil/izin günleri';
COMMENT ON TABLE appointment_reminders IS 'Randevu hatırlatma logları';

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
-- Anyone can do anything with appointments (we handle auth in application layer)
CREATE POLICY "Public access to appointments"
  ON appointments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for agent_availability
-- Public access (we handle auth in application layer)
CREATE POLICY "Public access to agent availability"
  ON agent_availability
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for blocked_dates
-- Public access (we handle auth in application layer)
CREATE POLICY "Public access to blocked dates"
  ON blocked_dates
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for appointment_reminders
-- Public access (we handle auth in application layer)
CREATE POLICY "Public access to appointment reminders"
  ON appointment_reminders
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
