/**
 * Zod schemas for Form components powered by react-hook-form.
 *
 * Schemas live in this folder, one file per entity. Each form-screen
 * imports the schema it needs from `@sports-yeti/mocks/schemas`.
 *
 * Naming convention:
 *   `<entity>FormSchema`        — the zod schema
 *   `<Entity>FormValues`        — the inferred TS type
 */

export * from './organization';
export * from './league';
export * from './season';
export * from './division';
export * from './space';
