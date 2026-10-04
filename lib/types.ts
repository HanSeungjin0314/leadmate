export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  project_name: string | null;
  source: string | null;
  interest_type: string | null;
  status: string;
  memo: string | null;
  next_contact_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  customer_id: string;
  user_id: string;
  type: string;
  content: string;
  created_at: string;
};
