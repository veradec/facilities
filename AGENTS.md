Build a complete, production-ready full-stack web application for collecting and reviewing videos and location information about public facilities.

## Core workflow
1. A visitor submits a public facility at `/upload` by providing:
   - Facility name and type
   - Description and optional accessibility details
   - Geographic coordinates, selected by clicking a map or entering latitude and longitude
   - One or more video files
   - Optional photos and contact details
2. Submissions are saved as **pending** and do not appear publicly until approved.
3. An authenticated admin reviews pending submissions at `/approval`, watches the uploaded videos, checks the details and location, and can approve or reject each submission. Admins can add an internal review note; rejection should include a reason.
4. Approved facilities appear on the public home page at `/` and as markers on the map at `/map`.

## Pages and behavior

### `/` — Public home page
- Show approved facilities only.
- Include search by name or description and filters by facility type.
- Display facility cards with name, type, short description, thumbnail, and a link to details.
- Provide clear links to `/upload` and `/map`.
- Include helpful loading, empty, and error states.

### `/upload` — Submission form
- Make the form responsive and easy to use on mobile.
- Include required-field validation, clear error messages, and a submission confirmation.
- Let users select coordinates on an interactive map and adjust the marker before submitting.
- Validate latitude and longitude ranges.
- Support video uploads with configurable file-size and file-type limits. Show upload progress and useful validation errors.
- Never expose uploaded, unapproved media publicly.

### `/approval` — Admin review
- Require authenticated admin access; unauthorized visitors must not be able to view the page or call its review APIs.
- List pending submissions with filters and pagination.
- Let admins view submission details, play uploaded videos, inspect the location on a map, and approve or reject submissions.
- Record the admin, decision, timestamp, and rejection reason or internal note.
- Ask for confirmation before finalizing an approval or rejection.

### `/map` — Public map
- Show approved facilities as map markers.
- Clicking a marker opens a popup or side panel with the facility name, type, brief description, and a link to its details.
- Include the same relevant search and type filters as the home page.
- Fit the map to available markers and provide a useful empty state when no approved facilities exist.

### Facility detail page
- Create a detail page for each approved facility, using a sensible route such as `/facilities/[id]`.
- Show the facility information, location, and approved media.
- Do not expose private contact details, internal notes, rejected submissions, or pending submissions.

## Technical requirements
- Use a clear, maintainable full-stack architecture with a responsive, accessible frontend and a secure backend.
- Choose an appropriate database, map provider, and media-storage solution. Put credentials and provider settings in environment variables; include an `.env.example`.
- Use server-side validation and authorization in addition to client-side validation.
- Store media in private or non-public storage by default. Serve media only through appropriate authorized or approved-public access controls.
- Use safe, non-guessable upload handling; validate file type and size on the server; do not trust filenames or client-provided MIME types.
- Protect admin authentication and review actions. Do not rely on hiding admin UI as authorization.
- Include database migrations or schema setup, seed data for local development, and clear setup and run instructions.
- Include basic tests for submission validation, access control, approval/rejection, and public visibility.
- Add sensible logging and user-friendly error handling without exposing secrets or sensitive server details.

## Data model
Include a facility submission entity with fields such as:
- `id`, `name`, `type`, `description`
- `latitude`, `longitude`
- media references
- `status` (`pending`, `approved`, or `rejected`)
- `submittedAt`, `reviewedAt`, `reviewedBy`
- `rejectionReason` and private `internalNote`

Keep public facility data separate from admin-only review information where appropriate.

## Design expectations
Use a clean, trustworthy visual style suitable for a public-service directory. Ensure keyboard accessibility, labeled form controls, adequate color contrast, responsive layouts, and clear status indicators. Use realistic sample content, but do not invent real facility locations.

First provide a brief overview of the architecture and key implementation choices, then generate the complete application code and setup instructions. Do not leave core features as mockups or TODOs.

