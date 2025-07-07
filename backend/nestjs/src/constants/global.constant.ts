export enum USER_ROLE {
  ADMIN = "admin",
  USER = "user",
}

export enum ResourceType {
  USER = "user",
  PRODUCT = "product",
}

export enum USER_RESOURCE_ACTION {
  CREATE = "create",
  UPDATE_SELF = "update_self",
  UPDATE = "update",
  DELETE = "delete",
  READ = "read",
  READ_MANY = "read_many",
}

export type ActionType = USER_RESOURCE_ACTION;

export const ROLE_PERMISSIONS: Record<
  USER_ROLE,
  Partial<Record<ResourceType, ActionType[]>>
> = {
  [USER_ROLE.ADMIN]: {
    [ResourceType.USER]: Object.values(USER_RESOURCE_ACTION),
  },
  [USER_ROLE.USER]: {
    [ResourceType.USER]: [
      USER_RESOURCE_ACTION.READ,
      USER_RESOURCE_ACTION.UPDATE_SELF,
    ],
  },
};
