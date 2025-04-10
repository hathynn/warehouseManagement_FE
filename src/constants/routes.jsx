export const USER_ROUTER = {
  LOGIN: "/login",
  REGISTER: "/register",
  HOME: "/home",
};
export const DEPARTMENT_ROUTER = {
  OVERVIEW: "/overview",
  IMPORT: {
    ROOT: "/import",
    REQUEST: {
      CREATE: "/import/create-request",
      LIST: "/import/request-list",
      DETAIL: (id = ":importRequestId") =>
        `/import/request-list/request-detail/${id}`,
    },
    ORDER: {
      CREATE: "/import/create-order", // Keep as string for direct path
      CREATE__FROM_IMPORT_REQUEST_ID: (id = ":importRequestId") =>
        `/import/create-order/${id}`, // Function for parameterized path
      LIST_FROM_IMPORT_REQUEST_ID: (id = ":importRequestId") =>
        `/import/order-list/${id}`, // Function for parameterized path
      DETAIL: (id = ":importOrderId") =>
        `/import/order-list/order-detail/${id}`, // Function for parameterized path
    },
  },
  EXPORT: {
    REQUEST: {
      CREATE: "/export/create-request",
      LIST: "/export/request-list",
      DETAIL: (id = ":exportRequestId") =>
        `/export/request-list/request-detail/${id}`,
    },
  },
  ITEM: {
    CREATE: "/item/create",
    LIST: "/item/list",
    DETAIL: (id = ":itemId") => `/item/list/item-detail/${id}`,
  },
};

//Path for WAREHOUSE_MANAGER
export const WAREHOUSE_MANAGER_ROUTE = {
  OVERVIEW: "/overview",
  EXPORT: {
    REQUEST: {
      LIST: "/export/request-list-manager",
      DETAIL: (id = ":exportRequestId") =>
        `/export/request-list/request-detail-manager/${id}`,
    },
  },
};
