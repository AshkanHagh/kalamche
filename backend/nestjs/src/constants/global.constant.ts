export enum USER_ROLE {
  ADMIN = "admin",
  USER = "user",
  SELLER = "seller",
}

export enum ResourceType {
  USER = "user",
  PRODUCT = "product",
  SHOP = "shop",
}

export enum USER_RESOURCE_ACTION {
  CREATE = "create",
  UPDATE_SELF = "update_self",
  UPDATE = "update",
  DELETE = "delete",
  READ = "read",
}

export enum SHOP_RESOURCE_ACTION {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  READ = "read",
}

export enum PRODUCT_RESOURCE_ACTION {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  READ = "read",
}

export type ActionType =
  | USER_RESOURCE_ACTION
  | SHOP_RESOURCE_ACTION
  | PRODUCT_RESOURCE_ACTION;

export const ROLE_PERMISSIONS: Record<
  USER_ROLE,
  Partial<Record<ResourceType, ActionType[]>>
> = {
  [USER_ROLE.ADMIN]: {
    [ResourceType.USER]: Object.values(USER_RESOURCE_ACTION),
    [ResourceType.SHOP]: Object.values(SHOP_RESOURCE_ACTION),
    [ResourceType.PRODUCT]: Object.values(PRODUCT_RESOURCE_ACTION),
  },
  [USER_ROLE.USER]: {
    [ResourceType.USER]: [
      USER_RESOURCE_ACTION.READ,
      USER_RESOURCE_ACTION.UPDATE_SELF,
    ],
    [ResourceType.SHOP]: [
      SHOP_RESOURCE_ACTION.READ,
      SHOP_RESOURCE_ACTION.CREATE,
    ],
    [ResourceType.PRODUCT]: [PRODUCT_RESOURCE_ACTION.READ],
  },
  [USER_ROLE.SELLER]: {
    [ResourceType.SHOP]: Object.values(SHOP_RESOURCE_ACTION),
    [ResourceType.PRODUCT]: Object.values(PRODUCT_RESOURCE_ACTION),
  },
};
