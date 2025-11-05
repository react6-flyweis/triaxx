/* eslint-disable @typescript-eslint/no-unused-vars */
import api from "./axios";

export interface Table {
  id: string;
  number: string;
  floor: string;
  status: TableStatus;
  capacity: number;
  currentOrder?: string;
  waiterName?: string;
  lastUpdated: string;
  position?: {
    x: number;
    y: number;
  };
  timer?: number; // Added for 'Waiting' status
}

export type TableStatus =
  | "Available"
  | "Served"
  | "Reserved"
  //  'Cleaning' |
  | "Ready"
  | "Waiting";

export interface TableFilter {
  floor?: string;
  status?: TableStatus;
  capacity?: number;
  minCapacity?: number;
  maxCapacity?: number;
}

export interface TableReservation {
  tableId: string;
  customerName: string;
  customerPhone: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
}

// Get all tables
export const getTables = async (): // params?: TableFilter
Promise<Table[]> => {
  // try {
  //   const response = await api.get('/tables', { params });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching tables:', error);
  //   // Fallback to dummy data
  return generateDummyTables();
  // }
};

// Get table by ID
export const getTableById = async (tableId: string): Promise<Table | null> => {
  // try {
  //   const response = await api.get(`/tables/${tableId}`);
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching table:', error);
  //   // Fallback to dummy table
  const dummyTables = generateDummyTables();
  return dummyTables.find((table) => table.id === tableId) || null;
  // }
};

// Update table status
export const updateTableStatus = async (
  tableId: string,
  status: TableStatus
): Promise<{ success: boolean; table: Table }> => {
  // try {
  //   const response = await api.patch(`/tables/${tableId}/status`, { status });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error updating table status:', error);
  //   // Fallback to dummy success
  const dummyTables = generateDummyTables();
  const table = dummyTables.find((t) => t.id === tableId);
  if (table) {
    table.status = status;
    table.lastUpdated = new Date().toISOString();
  }
  return { success: true, table: table! };
  // }
};

// Reserve table
export const reserveTable = async (): // reservation: TableReservation
Promise<{ success: boolean; reservationId: string }> => {
  // try {
  //   const response = await api.post('/tables/reserve', reservation);
  //   return response.data;
  // } catch (error) {
  //   console.error('Error reserving table:', error);
  //   // Fallback to dummy success
  return { success: true, reservationId: `RES_${Date.now()}` };
  // }
};

// Cancel table reservation
export const cancelTableReservation = async (): // reservationId: string
Promise<{ success: boolean }> => {
  // try {
  //   const response = await api.delete(`/tables/reserve/${reservationId}`);
  //   return response.data;
  // } catch (error) {
  //   console.error('Error canceling reservation:', error);
  //   // Fallback to dummy success
  return { success: true };
  // }
};

// Get table availability
export const getTableAvailability = async (params: {
  date: string;
  time: string;
  partySize: number;
  floor?: string;
}): Promise<Table[]> => {
  // try {
  //   const response = await api.get('/tables/availability', { params });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching table availability:', error);
  //   // Fallback to dummy available tables
  const dummyTables = generateDummyTables();
  return dummyTables.filter(
    (table) =>
      table.status === "Available" && table.capacity >= params.partySize
  );
  // }
};

// Get table statistics
export const getTableStatistics = async (): Promise<{
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  maintenance: number;
}> => {
  // try {
  //   const response = await api.get('/tables/statistics');
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching table statistics:', error);
  //   // Fallback to dummy statistics
  return {
    total: 20,
    available: 8,
    occupied: 6,
    reserved: 3,
    cleaning: 2,
    maintenance: 1,
  };
  // }
};

// Get tables by floor
export const getTablesByFloor = async (
  floor: number | string
): Promise<Table[]> => {
  // Call backend endpoint: /api/master/floor_map_table/getTablebyFloorid/:floor_id
  try {
    // backend expects a numeric floor id; the function receives a string (e.g. "1" or "F-01").
    // For now, pass it as-is (user requested using floor id 1).
    const response = await api.get(
      `/api/master/floor_map_table/getTablebyFloorid/${floor}`
    );

    // Response structure (example from user):
    // {
    //   success: true,
    //   count: 2,
    //   data: {
    //     Row_No_1: { Floor: {...}, tables: [ {...}, ... ] },
    //     Row_No_2: { ... }
    //   }
    // }

    const payload = response.data;
    if (!payload || !payload.data) return [];

    const rows = Object.values(payload.data) as any[];
    const mappedTables: Table[] = [];

    // Helper to map booking status name to frontend TableStatus
    const mapStatus = (bookingStatusName?: string): TableStatus => {
      if (!bookingStatusName) return "Available";
      const name = bookingStatusName.toLowerCase();
      if (name.includes("empty")) return "Available";
      if (name.includes("served")) return "Served";
      if (name.includes("waiting")) return "Waiting";
      if (name.includes("ready")) return "Ready";
      if (
        name.includes("reserved") ||
        name.includes("book") ||
        name.includes("booking")
      )
        return "Reserved";
      // Map other/unknown statuses to Available as a safe default
      return "Available";
    };

    rows.forEach((rowObj: any) => {
      const rowNo = rowObj?.Row_No ?? rowObj?.rowNo ?? undefined;
      const tables = Array.isArray(rowObj.tables) ? rowObj.tables : [];
      tables.forEach((t: any, idx: number) => {
        // Construct a friendly table number that matches the frontend expectations
        // The UI expects numbers like T11 (row 1, column 1). We'll build number as T{Row_No}{index+1}
        const rowPart = rowNo !== undefined ? String(rowNo) : "1";
        const colPart =
          t["Table_id"] !== undefined ? String(t["Table_id"]) : String(idx + 1);
        const number = `T${rowPart}${colPart}`;

        const mapped: Table = {
          id: t._id || `${rowPart}-${colPart}`,
          number,
          floor: rowObj?.Floor?.Floor_Name || `Floor ${floor}`,
          status: mapStatus(
            t["Table-Booking-Status_id"]?.Name ||
              t["Table-Booking-Status"] ||
              t.TableBookingStatus
          ),
          capacity:
            t["Seating-Persons_Count"] || t["Seating_Persons_Count"] || 2,
          currentOrder: undefined,
          waiterName:
            t?.CreateBy?.Name ||
            (typeof t.CreateBy === "string" ? t.CreateBy : undefined),
          lastUpdated: t.UpdatedAt || t.CreateAt || new Date().toISOString(),
        };

        mappedTables.push(mapped);
      });
    });

    return mappedTables;
  } catch (error) {
    console.error("Error fetching tables by floor:", error);
    // Do not use dummy data per request - return empty list so UI can handle it
    return [];
  }
};

// Get floor statistics
export const getFloorStatistics = async (
  floor: string
): Promise<{
  total: number;
  available: number;
  served: number;
  reserved: number;
  // cleaning: number;
  ready: number;
  occupancyRate: number;
}> => {
  // try {
  //   const response = await api.get(`/tables/floor/${floor}/statistics`);
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching floor statistics:', error);
  //   // Fallback to dummy statistics
  const dummyTables = generateDummyTables();
  const floorTables = dummyTables.filter((table) => table.floor === floor);
  const total = floorTables.length;
  const available = floorTables.filter((t) => t.status === "Available").length;
  const served = floorTables.filter((t) => t.status === "Served").length;
  const reserved = floorTables.filter((t) => t.status === "Reserved").length;
  // const cleaning = floorTables.filter(t => t.status === 'Cleaning').length;
  const ready = floorTables.filter((t) => t.status === "Ready").length;

  return {
    total,
    available,
    served,
    reserved,
    // cleaning,
    ready,
    occupancyRate:
      total > 0 ? Math.round(((served + reserved) / total) * 100) : 0,
  };
  // }
};

// Get all floors
export const getFloors = async (): Promise<string[]> => {
  // try {
  //   const response = await api.get('/tables/floors');
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching floors:', error);
  //   // Fallback to dummy floors
  return ["F-01", "F-02", "F-03", "F-04", "F-05", "F-06"];
  // }
};

// Get floor overview with all floors statistics
export const getFloorOverview = async (): Promise<{
  floors: string[];
  statistics: Record<
    string,
    {
      total: number;
      available: number;
      served: number;
      reserved: number;
      // cleaning: number;
      ready: number;
      occupancyRate: number;
    }
  >;
}> => {
  // try {
  //   const response = await api.get('/tables/floors/overview');
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching floor overview:', error);
  //   // Fallback to dummy overview
  const floors = ["F-01", "F-02", "F-03", "F-04", "F-05", "F-06"];
  const statistics: Record<
    string,
    {
      total: number;
      available: number;
      served: number;
      reserved: number;
      // cleaning: number;
      ready: number;
      occupancyRate: number;
    }
  > = {};

  floors.forEach((floor) => {
    const floorTables = generateDummyTables().filter(
      (table) => table.floor === floor
    );
    const total = floorTables.length;
    const available = floorTables.filter(
      (t) => t.status === "Available"
    ).length;
    const served = floorTables.filter((t) => t.status === "Served").length;
    const reserved = floorTables.filter((t) => t.status === "Reserved").length;
    // const cleaning = floorTables.filter(t => t.status === 'Cleaning').length;
    const ready = floorTables.filter((t) => t.status === "Ready").length;

    statistics[floor] = {
      total,
      available,
      served,
      reserved,
      // cleaning,
      ready,
      occupancyRate:
        total > 0 ? Math.round(((served + reserved) / total) * 100) : 0,
    };
  });

  return { floors, statistics };
  // }
};

// Get tables by capacity
export const getTablesByCapacity = async (
  capacity: number
): Promise<Table[]> => {
  // try {
  //   const response = await api.get(`/tables/capacity/${capacity}`);
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching tables by capacity:', error);
  //   // Fallback to dummy data filtered by capacity
  const dummyTables = generateDummyTables();
  return dummyTables.filter((table) => table.capacity === capacity);
  // }
};

// Get tables by capacity range
export const getTablesByCapacityRange = async (
  minCapacity: number,
  maxCapacity: number
): Promise<Table[]> => {
  // try {
  //   const response = await api.get('/tables/capacity-range', {
  //     params: { minCapacity, maxCapacity }
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching tables by capacity range:', error);
  //   // Fallback to dummy data filtered by capacity
  const dummyTables = generateDummyTables();
  return dummyTables.filter(
    (table) => table.capacity >= minCapacity && table.capacity <= maxCapacity
  );
  // }
};

// Get table capacity statistics
export const getTableCapacityStatistics = async (): Promise<{
  capacity2: {
    total: number;
    available: number;
    served: number;
    reserved: number;
  };
  capacity4: {
    total: number;
    available: number;
    served: number;
    reserved: number;
  };
  capacity8: {
    total: number;
    available: number;
    served: number;
    reserved: number;
  };
}> => {
  // try {
  //   const response = await api.get('/tables/capacity/statistics');
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching table capacity statistics:', error);
  //   // Fallback to dummy statistics
  const dummyTables = generateDummyTables();

  const getCapacityStats = (capacity: number) => {
    const capacityTables = dummyTables.filter(
      (table) => table.capacity === capacity
    );
    const total = capacityTables.length;
    const available = capacityTables.filter(
      (t) => t.status === "Available"
    ).length;
    const served = capacityTables.filter((t) => t.status === "Served").length;
    const reserved = capacityTables.filter(
      (t) => t.status === "Reserved"
    ).length;

    return { total, available, served, reserved };
  };

  return {
    capacity2: getCapacityStats(2),
    capacity4: getCapacityStats(4),
    capacity8: getCapacityStats(8),
  };
  // }
};

// Get available tables for party size
export const getAvailableTablesForParty = async (
  partySize: number,
  floor?: string
): Promise<Table[]> => {
  // try {
  //   const response = await api.get('/tables/available-for-party', {
  //     params: { partySize, floor }
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching available tables for party:', error);
  //   // Fallback to dummy data
  const dummyTables = generateDummyTables();
  return dummyTables.filter(
    (table) =>
      table.status === "Available" &&
      table.capacity >= partySize &&
      (!floor || table.floor === floor)
  );
  // }
};

// Get table capacity recommendations for party size
export const getTableCapacityRecommendations = async (
  partySize: number
): Promise<{
  recommended: number[];
  alternative: number[];
  message: string;
}> => {
  // try {
  //   const response = await api.get('/tables/capacity-recommendations', {
  //     params: { partySize }
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching table capacity recommendations:', error);
  //   // Fallback to logic-based recommendations
  let recommended: number[] = [];
  let alternative: number[] = [];
  let message = "";

  if (partySize <= 2) {
    recommended = [2];
    alternative = [4];
    message = "2-person table recommended";
  } else if (partySize <= 4) {
    recommended = [4];
    alternative = [2, 8];
    message = "4-person table recommended";
  } else if (partySize <= 8) {
    recommended = [8];
    alternative = [4];
    message = "8-person table recommended";
  } else {
    recommended = [8];
    alternative = [8];
    message = "Multiple tables may be needed for larger parties";
  }

  return { recommended, alternative, message };
  // }
};

// Helper function to generate dummy tables
const generateDummyTables = (): Table[] => {
  const floors = ["F-01", "F-02", "F-03"];
  const statuses: TableStatus[] = [
    "Available",
    // 'Occupied',
    "Reserved",
    "Ready",
    "Served",
    "Waiting", // Add Waiting status
    "Available",
    // 'Occupied',
    "Reserved",
    "Ready",
    "Served",
    "Waiting", // Add more Waiting
  ];
  const capacities = [2, 4, 8, 4, 2, 8];
  const tables: Table[] = [];
  // Use real order IDs from dummyOrders in orderApi.ts
  const demoOrderIds = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let orderIdx = 0;
  floors.forEach((floor, floorIdx) => {
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 5; col++) {
        const num = row * 10 + col;
        const status = statuses[(row * 5 + col + floorIdx) % statuses.length];
        const capacity =
          capacities[(row * 5 + col + floorIdx) % capacities.length];
        // Assign a real orderId to more statuses (not just Occupied)
        let currentOrder: string | undefined = undefined;
        let timer: number | undefined = undefined;
        if (status !== "Available" && orderIdx < demoOrderIds.length) {
          currentOrder = demoOrderIds[orderIdx];
          orderIdx++;
        }
        // Add timer for Waiting tables
        if (status === "Waiting") {
          // Random timer between 1 and 15 minutes
          timer = Math.floor(Math.random() * 150) + 1;
        }
        tables.push({
          id: `t-${floorIdx + 1}-${num}`,
          number: `T${num}`,
          floor,
          status,
          capacity,
          currentOrder,
          waiterName:
            status !== "Available"
              ? ["John Doe", "Jane Smith", "Mike Johnson"][(row + col) % 3]
              : undefined,
          lastUpdated: new Date(
            Date.now() - Math.random() * 86400000
          ).toISOString(),
          ...(timer !== undefined ? { timer } : {}),
        });
      }
    }
  });
  return tables;
};

// Dummy API to update/save the floor plan (table types/sizes)
export const updateFloorPlan = async (
  _floor: number,
  _tables: Table[]
): Promise<{ success: boolean }> => {
  // Simulate API call
  console.log(_floor, _tables);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 500);
  });
};
