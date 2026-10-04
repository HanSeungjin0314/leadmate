export type Customer = {
  id: string;
  user_id: string;
  business_id: string | null;
  name: string;
  phone: string;
  project_name: string | null; // V2 UI에서는 업종별 '관심 상품/서비스' 라벨로 사용
  source: string | null;
  interest_type: string | null; // V2 UI에서는 업종별 보조 필드 라벨로 사용
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
