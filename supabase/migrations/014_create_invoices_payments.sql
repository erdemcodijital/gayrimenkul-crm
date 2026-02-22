-- Create invoices table
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  invoice_number text unique not null,
  agent_id uuid references public.agents(id) on delete cascade not null,
  license_id uuid references public.licenses(id) on delete set null,
  issue_date timestamptz not null default now(),
  due_date timestamptz not null,
  amount decimal(10,2) not null,
  tax_rate decimal(5,2) default 20.00, -- KDV %20
  tax_amount decimal(10,2),
  total_amount decimal(10,2) not null,
  currency text default 'TRY',
  status text not null default 'pending', -- pending, paid, overdue, cancelled
  payment_method text, -- bank_transfer, credit_card, cash
  description text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create payments table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  agent_id uuid references public.agents(id) on delete cascade not null,
  payment_date timestamptz not null default now(),
  amount decimal(10,2) not null,
  payment_method text not null, -- bank_transfer, credit_card, cash
  transaction_id text,
  reference_number text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index if not exists invoices_agent_id_idx on public.invoices(agent_id);
create index if not exists invoices_status_idx on public.invoices(status);
create index if not exists invoices_issue_date_idx on public.invoices(issue_date);
create index if not exists invoices_invoice_number_idx on public.invoices(invoice_number);

create index if not exists payments_invoice_id_idx on public.payments(invoice_id);
create index if not exists payments_agent_id_idx on public.payments(agent_id);
create index if not exists payments_payment_date_idx on public.payments(payment_date);

-- Enable RLS
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

-- RLS Policies for invoices
create policy "Enable read access for all users" on public.invoices
  for select using (true);

create policy "Enable insert for authenticated users only" on public.invoices
  for insert with check (true);

create policy "Enable update for authenticated users only" on public.invoices
  for update using (true);

create policy "Enable delete for authenticated users only" on public.invoices
  for delete using (true);

-- RLS Policies for payments
create policy "Enable read access for all users" on public.payments
  for select using (true);

create policy "Enable insert for authenticated users only" on public.payments
  for insert with check (true);

create policy "Enable update for authenticated users only" on public.payments
  for update using (true);

create policy "Enable delete for authenticated users only" on public.payments
  for delete using (true);

-- Trigger for updated_at
create trigger handle_invoices_updated_at
  before update on public.invoices
  for each row
  execute function public.handle_updated_at();

create trigger handle_payments_updated_at
  before update on public.payments
  for each row
  execute function public.handle_updated_at();

-- Function to generate invoice number
create or replace function generate_invoice_number()
returns text as $$
declare
  new_number text;
  year_month text;
  sequence_num integer;
begin
  year_month := to_char(now(), 'YYYYMM');
  
  select coalesce(max(
    case 
      when invoice_number ~ ('^INV-' || year_month || '-[0-9]+$')
      then substring(invoice_number from length('INV-' || year_month || '-') + 1)::integer
      else 0
    end
  ), 0) + 1
  into sequence_num
  from public.invoices
  where invoice_number like 'INV-' || year_month || '-%';
  
  new_number := 'INV-' || year_month || '-' || lpad(sequence_num::text, 4, '0');
  
  return new_number;
end;
$$ language plpgsql;

-- Function to auto-update invoice status based on due date
create or replace function update_overdue_invoices()
returns void as $$
begin
  update public.invoices
  set status = 'overdue'
  where status = 'pending'
    and due_date < now()
    and id not in (
      select invoice_id 
      from public.payments 
      group by invoice_id 
      having sum(amount) >= (select total_amount from public.invoices where id = invoice_id)
    );
end;
$$ language plpgsql;
