import { defineDb, defineTable, column } from 'astro:db';

const ProjectVotes = defineTable({
  columns: {
    id: column.text(),
    vote: column.number(),
  },
});

const Project = defineTable({
  columns: {
    updated_at: column.date(),
    data: column.text(),
  },
});

export default defineDb({
  tables: {
    ProjectVotes,
    Project,
  },
});
