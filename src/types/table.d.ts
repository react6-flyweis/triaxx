export interface FloorInfo {
  _id: string;
  Floor_Type_id?: {
    Floor_Type_id?: number;
    Floor_Type_Name?: string;
    emozi?: string;
  };
  Floor_Name?: string;
  Total_Table_Count?: number;
  ["Seating-Persons_Count"]?: number;
  Details?: string;
  Status?: boolean;
  CreateBy?: number | Record<string, unknown>;
  CreateAt?: string;
  UpdatedAt?: string;
  Floor_id?: number;
  UpdatedBy?: number | null;
}

export interface BackendTableItem {
  _id?: string;
  Table_types_id?: { Table_types_id?: number; Name?: string; emozi?: string };
  Emozi?: string;
  image?: string;
  ["Table-name"]?: string;
  ["Table-code"]?: string;
  ["Table-booking-price"]?: number;
  ["Table-Booking-Status_id"]?: {
    Table_Booking_Status_id?: number;
    Name?: string;
  } | null;
  ["Seating-Persons_Count"]?: number;
  Details?: string;
  Status?: boolean;
  CreateBy?: Record<string, unknown>;
  CreateAt?: string;
  UpdatedAt?: string;
  Table_id?: number;
  UpdatedBy?: Record<string, unknown>;
  floor_map_Table_id?: number;
  Row_No?: number;
  // additional fields server may include
  [k: string]: unknown;
}

export interface FloorRow {
  Floor?: FloorInfo;
  tables?: BackendTableItem[];
  Row_No?: number;
}

export interface GetTablesByFloorResponse {
  success: boolean;
  count?: number;
  data: Record<string, FloorRow>;
}

export type BackendTablesFlattened = (BackendTableItem & {
  floorName?: string;
  rowNo?: number;
})[];

export interface TableBookingStatusItem {
  _id: string;
  Name: string;
  Details?: string;
  Status?: boolean;
  CreateBy?: Record<string, unknown>;
  CreateAt?: string;
  UpdatedAt?: string;
  ["Table-Booking-Status_id"]?: number;
  UpdatedBy?: Record<string, unknown>;
}

export interface GetTableBookingStatusesResponse {
  success: boolean;
  count?: number;
  data: TableBookingStatusItem[];
}
