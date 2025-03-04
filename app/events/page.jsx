import {client} from '@/sanity/lib/client'

export default async function EventsPage() {
  const query = '*[_type == "event"]' // GROQ-query
  const events = await client.fetch(query)

  return (
    <div>
      <h3 className="mb-5">Events list</h3>
    
      <ul>
        {events.map((event) => (
          <li key={event._id}>
            - <b>{event?.eventType}</b> <a href={`/events/${event?.slug}`}>{event?.name}</a> @ {event?.date}
          </li>
        ))}
      </ul>
    </div>
  )
}