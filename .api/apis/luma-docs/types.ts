import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type GetV1CalendarCouponsMetadataParam = FromSchema<
  typeof schemas.GetV1CalendarCoupons.metadata
>;
export type GetV1CalendarCouponsResponse200 = FromSchema<
  (typeof schemas.GetV1CalendarCoupons.response)['200']
>;
export type GetV1CalendarListEventsMetadataParam = FromSchema<
  typeof schemas.GetV1CalendarListEvents.metadata
>;
export type GetV1CalendarListEventsResponse200 = FromSchema<
  (typeof schemas.GetV1CalendarListEvents.response)['200']
>;
export type GetV1CalendarListPeopleMetadataParam = FromSchema<
  typeof schemas.GetV1CalendarListPeople.metadata
>;
export type GetV1CalendarListPeopleResponse200 = FromSchema<
  (typeof schemas.GetV1CalendarListPeople.response)['200']
>;
export type GetV1CalendarListPersonTagsMetadataParam = FromSchema<
  typeof schemas.GetV1CalendarListPersonTags.metadata
>;
export type GetV1CalendarListPersonTagsResponse200 = FromSchema<
  (typeof schemas.GetV1CalendarListPersonTags.response)['200']
>;
export type GetV1CalendarLookupEventMetadataParam = FromSchema<
  typeof schemas.GetV1CalendarLookupEvent.metadata
>;
export type GetV1CalendarLookupEventResponse200 = FromSchema<
  (typeof schemas.GetV1CalendarLookupEvent.response)['200']
>;
export type GetV1EntityLookupMetadataParam = FromSchema<typeof schemas.GetV1EntityLookup.metadata>;
export type GetV1EntityLookupResponse200 = FromSchema<
  (typeof schemas.GetV1EntityLookup.response)['200']
>;
export type GetV1EventCouponsMetadataParam = FromSchema<typeof schemas.GetV1EventCoupons.metadata>;
export type GetV1EventCouponsResponse200 = FromSchema<
  (typeof schemas.GetV1EventCoupons.response)['200']
>;
export type GetV1EventGetGuestMetadataParam = FromSchema<
  typeof schemas.GetV1EventGetGuest.metadata
>;
export type GetV1EventGetGuestResponse200 = FromSchema<
  (typeof schemas.GetV1EventGetGuest.response)['200']
>;
export type GetV1EventGetGuestsMetadataParam = FromSchema<
  typeof schemas.GetV1EventGetGuests.metadata
>;
export type GetV1EventGetGuestsResponse200 = FromSchema<
  (typeof schemas.GetV1EventGetGuests.response)['200']
>;
export type GetV1EventGetMetadataParam = FromSchema<typeof schemas.GetV1EventGet.metadata>;
export type GetV1EventGetResponse200 = FromSchema<(typeof schemas.GetV1EventGet.response)['200']>;
export type GetV1EventTicketTypesGetMetadataParam = FromSchema<
  typeof schemas.GetV1EventTicketTypesGet.metadata
>;
export type GetV1EventTicketTypesGetResponse200 = FromSchema<
  (typeof schemas.GetV1EventTicketTypesGet.response)['200']
>;
export type GetV1EventTicketTypesListMetadataParam = FromSchema<
  typeof schemas.GetV1EventTicketTypesList.metadata
>;
export type GetV1EventTicketTypesListResponse200 = FromSchema<
  (typeof schemas.GetV1EventTicketTypesList.response)['200']
>;
export type GetV1UserGetSelfResponse200 = FromSchema<
  (typeof schemas.GetV1UserGetSelf.response)['200']
>;
export type PostV1CalendarAddEventBodyParam = FromSchema<
  typeof schemas.PostV1CalendarAddEvent.body
>;
export type PostV1CalendarAddEventResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarAddEvent.response)['200']
>;
export type PostV1CalendarCouponsCreateBodyParam = FromSchema<
  typeof schemas.PostV1CalendarCouponsCreate.body
>;
export type PostV1CalendarCouponsCreateResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarCouponsCreate.response)['200']
>;
export type PostV1CalendarCouponsUpdateBodyParam = FromSchema<
  typeof schemas.PostV1CalendarCouponsUpdate.body
>;
export type PostV1CalendarCouponsUpdateResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarCouponsUpdate.response)['200']
>;
export type PostV1CalendarCreatePersonTagBodyParam = FromSchema<
  typeof schemas.PostV1CalendarCreatePersonTag.body
>;
export type PostV1CalendarCreatePersonTagResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarCreatePersonTag.response)['200']
>;
export type PostV1CalendarDeletePersonTagBodyParam = FromSchema<
  typeof schemas.PostV1CalendarDeletePersonTag.body
>;
export type PostV1CalendarDeletePersonTagResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarDeletePersonTag.response)['200']
>;
export type PostV1CalendarImportPeopleBodyParam = FromSchema<
  typeof schemas.PostV1CalendarImportPeople.body
>;
export type PostV1CalendarImportPeopleResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarImportPeople.response)['200']
>;
export type PostV1CalendarPersonTagsApplyBodyParam = FromSchema<
  typeof schemas.PostV1CalendarPersonTagsApply.body
>;
export type PostV1CalendarPersonTagsApplyResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarPersonTagsApply.response)['200']
>;
export type PostV1CalendarPersonTagsUnapplyBodyParam = FromSchema<
  typeof schemas.PostV1CalendarPersonTagsUnapply.body
>;
export type PostV1CalendarPersonTagsUnapplyResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarPersonTagsUnapply.response)['200']
>;
export type PostV1CalendarUpdatePersonTagBodyParam = FromSchema<
  typeof schemas.PostV1CalendarUpdatePersonTag.body
>;
export type PostV1CalendarUpdatePersonTagResponse200 = FromSchema<
  (typeof schemas.PostV1CalendarUpdatePersonTag.response)['200']
>;
export type PostV1EventAddGuestsBodyParam = FromSchema<typeof schemas.PostV1EventAddGuests.body>;
export type PostV1EventAddGuestsResponse200 = FromSchema<
  (typeof schemas.PostV1EventAddGuests.response)['200']
>;
export type PostV1EventAddHostBodyParam = FromSchema<typeof schemas.PostV1EventAddHost.body>;
export type PostV1EventAddHostResponse200 = FromSchema<
  (typeof schemas.PostV1EventAddHost.response)['200']
>;
export type PostV1EventCreateBodyParam = FromSchema<typeof schemas.PostV1EventCreate.body>;
export type PostV1EventCreateCouponBodyParam = FromSchema<
  typeof schemas.PostV1EventCreateCoupon.body
>;
export type PostV1EventCreateCouponResponse200 = FromSchema<
  (typeof schemas.PostV1EventCreateCoupon.response)['200']
>;
export type PostV1EventCreateResponse200 = FromSchema<
  (typeof schemas.PostV1EventCreate.response)['200']
>;
export type PostV1EventSendInvitesBodyParam = FromSchema<
  typeof schemas.PostV1EventSendInvites.body
>;
export type PostV1EventSendInvitesResponse200 = FromSchema<
  (typeof schemas.PostV1EventSendInvites.response)['200']
>;
export type PostV1EventTicketTypesCreateBodyParam = FromSchema<
  typeof schemas.PostV1EventTicketTypesCreate.body
>;
export type PostV1EventTicketTypesCreateResponse200 = FromSchema<
  (typeof schemas.PostV1EventTicketTypesCreate.response)['200']
>;
export type PostV1EventTicketTypesDeleteBodyParam = FromSchema<
  typeof schemas.PostV1EventTicketTypesDelete.body
>;
export type PostV1EventTicketTypesDeleteResponse200 = FromSchema<
  (typeof schemas.PostV1EventTicketTypesDelete.response)['200']
>;
export type PostV1EventTicketTypesUpdateBodyParam = FromSchema<
  typeof schemas.PostV1EventTicketTypesUpdate.body
>;
export type PostV1EventTicketTypesUpdateResponse200 = FromSchema<
  (typeof schemas.PostV1EventTicketTypesUpdate.response)['200']
>;
export type PostV1EventUpdateBodyParam = FromSchema<typeof schemas.PostV1EventUpdate.body>;
export type PostV1EventUpdateCouponBodyParam = FromSchema<
  typeof schemas.PostV1EventUpdateCoupon.body
>;
export type PostV1EventUpdateCouponResponse200 = FromSchema<
  (typeof schemas.PostV1EventUpdateCoupon.response)['200']
>;
export type PostV1EventUpdateGuestStatusBodyParam = FromSchema<
  typeof schemas.PostV1EventUpdateGuestStatus.body
>;
export type PostV1EventUpdateGuestStatusResponse200 = FromSchema<
  (typeof schemas.PostV1EventUpdateGuestStatus.response)['200']
>;
export type PostV1EventUpdateResponse200 = FromSchema<
  (typeof schemas.PostV1EventUpdate.response)['200']
>;
export type PostV1ImagesCreateUploadUrlBodyParam = FromSchema<
  typeof schemas.PostV1ImagesCreateUploadUrl.body
>;
export type PostV1ImagesCreateUploadUrlResponse200 = FromSchema<
  (typeof schemas.PostV1ImagesCreateUploadUrl.response)['200']
>;
