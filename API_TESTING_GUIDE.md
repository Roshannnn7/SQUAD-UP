# API Testing Guide

This guide provides example requests for testing all the new features.

## Prerequisites
- Backend server running on `http://localhost:5000`
- Valid authentication token (replace `YOUR_AUTH_TOKEN` with actual token)
- Admin token for admin endpoints (replace `ADMIN_AUTH_TOKEN`)

## 1. Squad Roles & Member Management

### Update Member Role (Admin Only)
```bash
PUT /api/projects/:projectId/members/:userId/role
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
Body:
{
  "role": "moderator"  // or "member"
}
```

### Remove Member (Admin/Moderator)
```bash
DELETE /api/projects/:projectId/members/:userId
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
```

## 2. Squad Rules

### Get Squad Rules (Public)
```bash
GET /api/projects/:projectId/rules
```

### Create Squad Rule (Admin/Moderator)
```bash
POST /api/projects/:projectId/rules
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
Body:
{
  "title": "Be Respectful",
  "description": "Treat all members with respect and kindness",
  "order": 1
}
```

### Update Squad Rule (Admin/Moderator)
```bash
PUT /api/projects/:projectId/rules/:ruleId
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
Body:
{
  "title": "Updated Rule Title",
  "description": "Updated description"
}
```

### Delete Squad Rule (Admin/Moderator)
```bash
DELETE /api/projects/:projectId/rules/:ruleId
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
```

## 3. Pinned Messages

### Pin/Unpin Message (Admin/Moderator)
```bash
PUT /api/projects/:projectId/messages/:messageId/pin
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
```

## 4. Activity Logs

### Get Activity Logs (Members)
```bash
GET /api/projects/:projectId/activity?page=1&limit=20
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
```

## 5. Join Requests

### Create Squad with Join Approval Required
```bash
POST /api/projects
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
Body:
{
  "name": "My Private Squad",
  "description": "A squad that requires approval",
  "skillsRequired": ["React", "Node.js"],
  "maxMembers": 10,
  "isPublic": true,
  "requireJoinApproval": true,
  "discoveryTags": ["web", "fullstack"],
  "category": "web"
}
```

### Request to Join Squad
```bash
POST /api/projects/:projectId/join
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
Body:
{
  "reason": "I'm passionate about web development and would love to contribute to this project"
}
```

### Get Join Requests (Admin/Moderator)
```bash
GET /api/projects/:projectId/join-requests
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
```

### Approve Join Request (Admin/Moderator)
```bash
PUT /api/projects/:projectId/join-requests/:requestId
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
Body:
{
  "action": "approve",
  "reviewNote": "Welcome to the squad!"
}
```

### Reject Join Request (Admin/Moderator)
```bash
PUT /api/projects/:projectId/join-requests/:requestId
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
Body:
{
  "action": "reject",
  "reviewNote": "Not a good fit at this time"
}
```

## 6. Reports

### Create Report
```bash
POST /api/reports
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
Body:
{
  "reportType": "user",  // or "post", "message", "project"
  "targetId": "USER_ID_TO_REPORT",
  "reason": "harassment",  // spam, harassment, inappropriate_content, hate_speech, violence, misinformation, copyright, other
  "description": "This user has been sending inappropriate messages"
}
```

### Get All Reports (Admin)
```bash
GET /api/reports?status=pending&page=1&limit=20
Headers:
  Authorization: Bearer ADMIN_AUTH_TOKEN
```

### Get Report Details (Admin)
```bash
GET /api/reports/:reportId
Headers:
  Authorization: Bearer ADMIN_AUTH_TOKEN
```

### Update Report Status (Admin)
```bash
PUT /api/reports/:reportId
Headers:
  Authorization: Bearer ADMIN_AUTH_TOKEN
Body:
{
  "status": "resolved",  // pending, reviewing, resolved, dismissed
  "resolution": "User has been warned and content removed",
  "actionTaken": "warning"  // none, warning, content_removed, user_suspended, user_banned
}
```

### Delete Report (Admin)
```bash
DELETE /api/reports/:reportId
Headers:
  Authorization: Bearer ADMIN_AUTH_TOKEN
```

## 7. Admin - Delete User

### Delete User Permanently (Admin)
```bash
DELETE /api/admin/users/:userId
Headers:
  Authorization: Bearer ADMIN_AUTH_TOKEN
```

**Warning**: This permanently deletes the user and all related data. Cannot be undone.

## 8. Squad Deletion

### Delete Squad (Squad Admin Only)
```bash
DELETE /api/projects/:projectId
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
```

**Note**: Only the squad creator (admin) can delete the squad.

## Testing Workflow

### Complete Squad Management Flow:

1. **Create Squad with Approval Required**
   ```bash
   POST /api/projects
   Body: { requireJoinApproval: true, ... }
   ```

2. **User Requests to Join**
   ```bash
   POST /api/projects/:projectId/join
   Body: { reason: "..." }
   ```

3. **Admin Views Join Requests**
   ```bash
   GET /api/projects/:projectId/join-requests
   ```

4. **Admin Approves Request**
   ```bash
   PUT /api/projects/:projectId/join-requests/:requestId
   Body: { action: "approve" }
   ```

5. **Admin Creates Squad Rules**
   ```bash
   POST /api/projects/:projectId/rules
   Body: { title: "...", description: "..." }
   ```

6. **Admin Promotes Member to Moderator**
   ```bash
   PUT /api/projects/:projectId/members/:userId/role
   Body: { role: "moderator" }
   ```

7. **Moderator Pins Important Message**
   ```bash
   PUT /api/projects/:projectId/messages/:messageId/pin
   ```

8. **Members View Activity Log**
   ```bash
   GET /api/projects/:projectId/activity
   ```

### Report Handling Flow:

1. **User Reports Content**
   ```bash
   POST /api/reports
   Body: { reportType: "user", targetId: "...", reason: "harassment", description: "..." }
   ```

2. **Admin Reviews Reports**
   ```bash
   GET /api/reports?status=pending
   ```

3. **Admin Takes Action**
   ```bash
   PUT /api/reports/:reportId
   Body: { status: "resolved", actionTaken: "warning", resolution: "..." }
   ```

## Response Examples

### Success Response (Create Squad)
```json
{
  "_id": "65abc123...",
  "name": "My Squad",
  "description": "...",
  "creator": "65abc456...",
  "members": [
    {
      "user": "65abc456...",
      "role": "admin",
      "joinedAt": "2024-01-10T..."
    }
  ],
  "requireJoinApproval": true,
  "discoveryTags": ["web", "fullstack"],
  "category": "web",
  "createdAt": "2024-01-10T...",
  "updatedAt": "2024-01-10T..."
}
```

### Error Response (Unauthorized)
```json
{
  "message": "Not authorized to perform this action"
}
```

### Error Response (Not Found)
```json
{
  "message": "Project not found"
}
```

## Tips for Testing

1. **Use Postman or Thunder Client**: Import these requests into a REST client for easier testing
2. **Save Tokens**: Store authentication tokens in environment variables
3. **Test Authorization**: Try accessing endpoints with different user roles to verify permissions
4. **Check Activity Logs**: After each action, check the activity log to verify logging
5. **Test Edge Cases**: Try invalid IDs, missing fields, duplicate requests, etc.

## Common Issues

### 401 Unauthorized
- Check if token is valid and not expired
- Ensure token is included in Authorization header
- Verify user has required role (admin/moderator)

### 404 Not Found
- Verify the ID exists in the database
- Check if the resource was deleted
- Ensure correct endpoint URL

### 400 Bad Request
- Check request body format
- Verify all required fields are included
- Ensure field values are valid (e.g., valid enum values)

## Next Steps

After testing the backend:
1. Implement frontend UI for these features
2. Add real-time updates for activity logs
3. Implement notification system for join requests
4. Add email notifications for reports
5. Create admin dashboard for report management
