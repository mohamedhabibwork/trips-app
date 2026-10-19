import {
  childTripLiveStatusDtoSchema,
  getChildTripLiveStatusSchema,
  linkChildToParentSchema,
  parentChildLinkDtoSchema,
  revokeChildLinkSchema,
} from "../schemas";
import { createParentService } from "../services";
import { parentAuthenticatedProcedure, procedure } from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/parent/status",
    summary: "Health check for the parent service",
    tags: ["parent"],
  })
  .handler(async () => ({ service: "parent" as const, status: "ok" as const }));

const listLinkedChildren = parentAuthenticatedProcedure
  .output(parentChildLinkDtoSchema.array())
  .handler(async ({ context }) => {
    const svc = createParentService({ db: context.db });
    return await svc.listLinkedChildren(context.auth.accountId);
  });

const linkChildToParent = parentAuthenticatedProcedure
  .input(linkChildToParentSchema)
  .output(parentChildLinkDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createParentService({ db: context.db });
    return await svc.linkChildToParent(context.auth.accountId, input);
  });

const revokeChildLink = parentAuthenticatedProcedure
  .input(revokeChildLinkSchema)
  .output(parentChildLinkDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createParentService({ db: context.db });
    return await svc.revokeChildLink(context.auth.accountId, input);
  });

const getChildTripLiveStatus = parentAuthenticatedProcedure
  .input(getChildTripLiveStatusSchema)
  .output(childTripLiveStatusDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createParentService({ db: context.db });
    return await svc.getChildTripLiveStatus(context.auth.accountId, input.linkId);
  });

export const routes = {
  status,
  listLinkedChildren,
  linkChildToParent,
  revokeChildLink,
  getChildTripLiveStatus,
};
