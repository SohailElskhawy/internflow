# InternFlow REST API Documentation

## Overview
All endpoints return standard JSON responses:
```json
{
  "success": true,
  "data": { ... }
}
```
Or for errors:
```json
{
  "success": false,
  "error": "Error description",
  "details": { ... }
}
```

---

## Endpoints Summary

### Authentication
- `POST /api/auth/login` - Authenticate with email/password (returns JWT HTTP cookie)
- `POST /api/auth/register` - Create new Student or Company account
- `GET /api/auth/me` - Get currently authenticated user details & role
- `POST /api/auth/logout` - Clear session token cookie

### Internships
- `GET /api/internships` - List active internships (Supports `?search=` and `?type=`)
- `POST /api/internships` - Create internship posting (**Company Only**)
- `GET /api/internships/:id` - Get single internship details
- `PATCH /api/internships/:id` - Update internship (**Company Only**)
- `DELETE /api/internships/:id` - Delete internship (**Company Only**)

### Applications & Applicants
- `POST /api/students/apply/:id` - Apply to an internship (**Student Only**)
- `GET /api/students/applications` - Get student's application history (**Student Only**)
- `GET /api/company/internships/:id/applicants` - List applicants for an internship (**Company Only**)
- `PATCH /api/applications/:id/status` - Accept/Reject application (**Company Owner Only**)

### Profiles
- `GET /api/students/profile` - Get student profile details (**Student Only**)
- `POST /api/students/profile` - Update student profile (**Student Only**)
- `GET /api/companies` - List approved companies
- `POST /api/companies` - Update company profile (**Company Only**)

### Admin
- `GET /api/admin/users` - List all system users (**Admin Only**)
- `PATCH /api/admin/companies/:id/approval` - Approve/Reject company (**Admin Only**)
