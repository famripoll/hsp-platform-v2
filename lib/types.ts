export interface University {
  id: string;
  unitid: number;
  institution_name: string;
  address_txt: string | null;
  city_txt: string | null;
  state_cd: string | null;
  zip_txt: string | null;
  classification_name: string | null;
  sector_name: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  x_twitter_url: string | null;
  sat_math_mid: number | null;
  sat_reading_mid: number | null;
  sat_total_mid: number | null;
  act_composite_mid: number | null;
  admission_rate_pct: number | null;
  avg_annual_cost_usd: number | null;
  grad_rate_pct: number | null;
  net_price_usd: number | null;
  enrollment_cnt: number | null;
  tuition_in_state_usd: number | null;
  tuition_out_state_usd: number | null;
  retention_rate_pct: number | null;
  created_at: string;
  updated_at: string;
}
