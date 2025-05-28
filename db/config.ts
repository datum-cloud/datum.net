import { defineDb, defineTable, column } from 'astro:db';

const ProjectVotes = defineTable({
  columns: {
    id: column.text(),
    vote: column.number(),
  },
});

export default defineDb({
  tables: {
    ProjectVotes,
  },
});
