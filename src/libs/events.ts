export const prerender = false;

import lumaDocs from '@api/luma-docs';
// import { Cache } from '@libs/cache';

// const cache = new Cache('.cache'); // 5 minutes

lumaDocs.auth();

type EventProps = {
  name: string;
  description: string;
  start_at: string;
  meeting_url: string;
  cover_url: string;
  creator: string[];
};

type PeopleResponse = {
  id: string;
  email: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
    email: string;
    first_name: string;
    last_name: string;
  };
};

// type ListEventsResponse = {
//   api_id: string;
//   event: {
//     id: string;
//     user_id: string;
//     name: string;
//     description: string;
//     timezone: string;
//     meeting_url: string;
//     description_md: string;
//     geo_address_json: {
//       address: string;
//       city: string;
//       region: string;
//       country: string;
//       city_state: string;
//       full_address: string;
//       google_maps_place_id: string;
//       apple_maps_place_id: string;
//       description: string;
//     };
//     geo_latitude: string;
//     geo_longitude: string;
//     start_at: string;
//     cover_url: string;
//     url: string;
//     visibility: string;
//   };
// };

async function getListPeople(): Promise<PeopleResponse[]> {
  return lumaDocs
    .getV1CalendarListPeople()
    .then(({ data }) => data.entries as PeopleResponse[])
    .catch((err) => {
      console.error(err);
      return [];
    });
}

async function getListEvents(): Promise<EventProps[]> {
  return [] as EventProps[];
  lumaDocs
    .getV1CalendarListEvents()
    .then(({ data }) => {
      console.log(data);
      // if (cache.has('lumaEvents')) {
      //   return cache.get<ListEventsResponse>('lumaEvents') as ListEventsResponse;
      // } else {
      //   cache.set('lumaEvents', data.entries, 60 * 60); // Cache for 1 hour
      //   return data;
      // }
    })
    .catch((err) => {
      console.error(err);
    });
}

export { getListEvents, getListPeople };
