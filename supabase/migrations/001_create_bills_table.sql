-- Create bills table for storing medical bills and their processed data
create table bills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  raw_text text,
  structured_data jsonb,
  file_url text,
  file_type text,
  processing_status text default 'pending' check (processing_status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index bills_user_id_idx on bills(user_id);
create index bills_status_idx on bills(processing_status);
create index bills_created_at_idx on bills(created_at);

-- Enable RLS (Row Level Security)
alter table bills enable row level security;

-- Create policy for users to only access their own bills
create policy "Users can view their own bills" on bills
  for select using (auth.uid() = user_id);

create policy "Users can insert their own bills" on bills
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own bills" on bills
  for update using (auth.uid() = user_id);

create policy "Users can delete their own bills" on bills
  for delete using (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_bills_updated_at
  before update on bills
  for each row
  execute function update_updated_at_column();
