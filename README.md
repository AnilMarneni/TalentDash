# TalentDash

A career intelligence platform that provides structured compensation insights, company salary analytics, and offer comparisons through a static-first, SEO-optimized architecture.

Built as part of the TalentDash Engineering Trial.

---

## Features

### Salary Intelligence

* Browse salary records across companies, roles, levels, and locations
* Advanced filtering and sorting
* Pagination support
* Compensation breakdown (Base, Bonus, Stock, Total Compensation)

### Company Profiles

* Company-specific salary analytics
* Median compensation calculation
* Compensation range insights
* Level distribution analysis

### Salary Comparison

* Side-by-side salary comparison
* Delta calculations across compensation components
* Total compensation winner indicator

### Data Quality

* Company normalization
* Duplicate submission detection
* Schema validation using Zod
* Server-side compensation computation

### SEO

* Static generation where possible
* Metadata generation
* OpenGraph support
* JSON-LD structured data
* Canonical URLs

---

## Tech Stack

### Frontend

* Next.js 15 (App Router)
* React Server Components
* TypeScript
* Tailwind CSS

### Backend

* Next.js Route Handlers
* Prisma ORM
* PostgreSQL (Neon)

### Validation

* Zod

### Deployment

* Cloudflare Pages
* Cloudflare CDN

---

## Architecture

The application follows a query-layer architecture:

```text
React Server Components
          ↓
      Query Layer
          ↓
        Prisma
          ↓
      PostgreSQL
```

Database access is abstracted into reusable query modules, allowing both API routes and React Server Components to share the same business logic.

---

## API Endpoints

### POST /api/ingest-salary

Creates a salary record.

Features:

* Validation pipeline
* Company normalization
* Duplicate detection
* Automatic total compensation calculation

### GET /api/salaries

Supports:

* Company filtering
* Role filtering
* Level filtering
* Location filtering
* Currency filtering
* Sorting
* Pagination

### GET /api/companies/[slug]

Returns:

* Company metadata
* Salary records
* Median compensation
* Level distribution

### GET /api/compare

Returns:

* Two salary records
* Compensation deltas
* Comparison analytics

---

## Database Design

### Company

Stores canonical company information:

* Name
* Slug
* Normalized Name
* Industry
* Headquarters
* Founded Year
* Headcount Range

### Salary

Stores:

* Role
* Level
* Location
* Currency
* Experience
* Base Salary
* Bonus
* Stock
* Total Compensation
* Confidence Score
* Verification Status

Total compensation is always computed server-side:

```text
Total Compensation = Base + Bonus + Stock
```

---

## Key Engineering Decisions

### Static-First Rendering

The platform prioritizes static generation and caching to reduce infrastructure costs and improve SEO performance.

### Query Layer Abstraction

Database logic is isolated from API routes and page components to improve maintainability and reduce duplication.

### Prisma + PostgreSQL

Chosen for:

* Type safety
* Relational data modeling
* Strong indexing support
* Developer productivity

### Page-Based Pagination

Implemented for simplicity and predictable API behavior within the trial scope.

---

## Running Locally

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```env
DATABASE_URL="postgresql://..."
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Push Schema

```bash
npx prisma db push
```

### Seed Database

```bash
npx prisma db seed
```

### Start Development Server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:3000
```

---

## Future Improvements

Given additional development time:

* Authentication (Clerk/Auth.js)
* Full-text search
* Background job processing
* Automated data enrichment
* ISR revalidation webhooks
* Advanced analytics dashboard
* Typesense integration

---

## Author

Anil Marneni

B.Tech Artificial Intelligence & Data Science
Vignan Institute of Technology and Science
