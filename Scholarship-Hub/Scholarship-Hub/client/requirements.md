## Packages
date-fns | Formatting dates for scholarship deadlines and application submissions

## Notes
- Uses local authentication via GET /api/me and POST /api/login, POST /api/register
- File uploads to POST /api/applications use native fetch with FormData (multipart/form-data)
- Admin status and features conditionally render based on user.isAdmin
