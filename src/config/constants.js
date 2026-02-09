export const PERMISSIONS = {
  READ_ROLE: "READ_ROLE",
  READ_USER: "READ_USER",
  CREATE_ROLE: "CREATE_ROLE",
  ASSIGN_ROLE: "ASSIGN_ROLE",
  UPDATE_ROLE: "UPDATE_ROLE",
  DELETE_ROLE: "DELETE_ROLE",
  CHANGE_INFO_ALL_USERS: "CHANGE_INFO_ALL_USERS",
  CHANGE_PASSWORD_ALL_USERS: "CHANGE_PASSWORD_ALL_USERS",
  LOCK_ALL_USERS: "LOCK_ALL_USERS",
  VIEW_OWN_TRANSACTIONS: "VIEW_OWN_TRANSACTIONS",
  CREATE_TRANSACTION: "CREATE_TRANSACTION",
  EDIT_OWN_TRANSACTION: "EDIT_OWN_TRANSACTION",
  DELETE_OWN_TRANSACTION: "DELETE_OWN_TRANSACTION",
  VIEW_ALL_TRANSACTIONS: "VIEW_ALL_TRANSACTIONS",
  EDIT_ALL_TRANSACTIONS: "EDIT_ALL_TRANSACTIONS",
  DELETE_ALL_TRANSACTIONS: "DELETE_ALL_TRANSACTIONS",
  VIEW_STATS: "VIEW_STATS",
};

export const PERMISSION_RULES = {
  CONFLICTS: {
    VIEW_ALL_TRANSACTIONS: "VIEW_OWN_TRANSACTIONS",
    EDIT_ALL_TRANSACTIONS: "EDIT_OWN_TRANSACTIONS",
    DELETE_ALL_TRANSACTIONS: "DELETE_OWN_TRANSACTION",
  },
  DEPENDENCIES: {
    CREATE_ROLE: ["READ_ROLE"],
    ASSIGN_ROLE: [["READ_ROLE", "READ_USER"]],
    UPDATE_ROLE: ["READ_ROLE"],
    DELETE_ROLE: ["READ_ROLE"],
    EDIT_ALL_TRANSACTIONS: ["VIEW_ALL_TRANSACTIONS"],
    DELETE_ALL_TRANSACTIONS: ["VIEW_ALL_TRANSACTIONS"],
    VIEW_STATS: ["VIEW_ALL_TRANSACTIONS", "VIEW_OWN_TRANSACTIONS"],
    EDIT_OWN_TRANSACTION: ["VIEW_OWN_TRANSACTIONS", "VIEW_ALL_TRANSACTIONS"],
    DELETE_OWN_TRANSACTION: ["VIEW_OWN_TRANSACTIONS", "VIEW_ALL_TRANSACTIONS"],
    CREATE_TRANSACTION: ["VIEW_OWN_TRANSACTIONS", "VIEW_ALL_TRANSACTIONS"],
    CHANGE_INFO_ALL_USERS: ["READ_USER"],
    CHANGE_PASSWORD_ALL_USERS: ["READ_USER"],
    LOCK_ALL_USERS: ["READ_USER"],
  },
};

export const PERMISSION_METADATA = {
  READ_ROLE: {
    label: "Read Roles",
    description: "View all roles in the system",
  },
  READ_USER: {
    label: "Read Users",
    description: "View all users in the system",
  },
  CREATE_ROLE: {
    label: "Create Role",
    description: "Create new roles with custom permissions",
  },
  ASSIGN_ROLE: {
    label: "Assign Role",
    description: "Assign or change roles for users (requires both Read Roles and Read Users)",
  },
  UPDATE_ROLE: {
    label: "Update Role",
    description: "Modify permissions and name for existing roles",
  },
  DELETE_ROLE: {
    label: "Delete Role",
    description: "Remove roles from the system",
  },
  CHANGE_INFO_ALL_USERS: {
    label: "Change Info (All Users)",
    description: "Edit username, display name, and avatar for any user",
  },
  CHANGE_PASSWORD_ALL_USERS: {
    label: "Change Password (All Users)",
    description: "Change password for any user (admin privilege)",
  },
  LOCK_ALL_USERS: {
    label: "Lock/Unlock Users",
    description: "Lock or unlock user accounts",
  },
  VIEW_OWN_TRANSACTIONS: {
    label: "View Own Transactions",
    description: "View your own transaction history",
  },
  CREATE_TRANSACTION: {
    label: "Create Transaction",
    description: "Add new transactions to the system",
  },
  EDIT_OWN_TRANSACTION: {
    label: "Edit Own Transactions",
    description: "Modify your own transactions",
  },
  DELETE_OWN_TRANSACTION: {
    label: "Delete Own Transactions",
    description: "Remove your own transactions",
  },
  VIEW_ALL_TRANSACTIONS: {
    label: "View All Transactions",
    description: "View transactions from all users (conflicts with View Own Transactions)",
  },
  EDIT_ALL_TRANSACTIONS: {
    label: "Edit All Transactions",
    description: "Modify any user's transactions (requires View All Transactions)",
  },
  DELETE_ALL_TRANSACTIONS: {
    label: "Delete All Transactions",
    description: "Remove any user's transactions (requires View All Transactions)",
  },
  VIEW_STATS: {
    label: "View Statistics",
    description: "Access statistical reports and analytics (requires View All Transactions)",
  },
};

export const PERMISSION_GROUPS = [
  {
    name: "Role Management",
    permissions: ["READ_ROLE", "CREATE_ROLE", "UPDATE_ROLE", "DELETE_ROLE"]
  },
  {
    name: "User Management",
    permissions: ["READ_USER", "ASSIGN_ROLE", "CHANGE_INFO_ALL_USERS", "CHANGE_PASSWORD_ALL_USERS", "LOCK_ALL_USERS"]
  },
  {
    name: "Transactions & Analytics",
    permissions: [
      "VIEW_OWN_TRANSACTIONS", "CREATE_TRANSACTION", "EDIT_OWN_TRANSACTION", "DELETE_OWN_TRANSACTION",
      "VIEW_ALL_TRANSACTIONS", "EDIT_ALL_TRANSACTIONS", "DELETE_ALL_TRANSACTIONS",
      "VIEW_STATS"
    ]
  }
];
