export const commandCatalog = {
  CREATE_NEXTJS_APP: { rolesAllowed: ["admin", "developer"], risky: true },
  INSTALL_DEPENDENCIES: { rolesAllowed: ["admin", "developer"], risky: false },
  RUN_DEV_SERVER: { rolesAllowed: ["admin", "developer", "viewer"], risky: false },
  OPEN_CURSOR: { rolesAllowed: ["admin", "developer"], risky: false }
};
