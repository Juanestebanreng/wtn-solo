export type PartyType = 'transferor' | 'transferee';
export type WtnStatus = 'draft' | 'final' | 'corrected';
export type ContainmentType =
  | 'loose'
  | 'sacks'
  | 'skip'
  | 'drum'
  | 'other';

export interface CompanyProfile {
  id: string;
  workspace_id: string;
  company_name: string;
  contact_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  postcode: string;
  sic_code: string | null;
  phone: string | null;
  email: string | null;
  carrier_registration_number: string | null;
  permit_number: string | null;
  is_carrier: boolean;
  is_broker: boolean;
  is_dealer: boolean;
  is_permit_holder: boolean;
  is_exemption_holder: boolean;
}

export interface WtnParty {
  id?: string;
  wtn_id?: string;
  party_type: PartyType;
  full_name: string;
  company_name: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  postcode: string;
  role_producer?: boolean;
  role_importer?: boolean;
  role_local_authority?: boolean;
  role_permit_holder?: boolean;
  permit_number?: string | null;
  role_exemption_holder?: boolean;
  exemption_details?: string | null;
  role_carrier?: boolean;
  role_broker?: boolean;
  role_dealer?: boolean;
  registration_number?: string | null;
  represented_as?: string | null;
}

export interface WtnSignature {
  id?: string;
  wtn_id?: string;
  party_type: PartyType;
  signed_name: string;
  represented_as: string;
  signed_at: string;
  signature_path: string;
}

export interface Wtn {
  id: string;
  workspace_id: string;
  status: WtnStatus;
  reference_number: string;
  transfer_date: string;
  transfer_time: string;
  place_of_transfer: string;
  broker_dealer_name: string | null;
  broker_dealer_registration_number: string | null;
  waste_description: string;
  ewc_code: string;
  quantity: string;
  containment_type: ContainmentType;
  containment_other: string | null;
  waste_hierarchy_confirmed: boolean;
  pdf_path: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  finalised_at: string | null;
}

export interface WtnWithRelations extends Wtn {
  wtn_parties: WtnParty[];
  wtn_signatures: WtnSignature[];
}
