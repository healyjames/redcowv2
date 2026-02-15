---
description: Get current Jira ticket informatoin from branch name or provided ticket
argument-hint: <ticket-number> optional
---

# Jira Ticket Analysis

Fetch and analyse the current Jira ticket based on the git branch or provided ticket number, then help plan work or assess progress against acceptance criteria.

## Setup Verification (Optional)

Jira integration is optional. If not configured, skip Jira steps and proceed with manual task description.

Check for Jira credentials at `/Users/$USER/AI/config/jira.env`:

```
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
```

**Steps to verify:**

1. Read the jira.env file at `/Users/$USER/AI/config/jira.env`
2. If the file doesn't exist:

   ```
   Jira credentials not found. Skipping Jira integration.
   To enable Jira, create `/Users/$USER/AI/config/jira.env` with JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN.
   API token: https://id.atlassian.com/manage-profile/security/api-tokens

   Continuing without Jira context...
   ```

3. If the file exists but is missing required variables, list which ones are missing and continue without Jira
4. If credentials are present, proceed to fetch the ticket

## Ticket Identification

Get the current git branch name using `git branch --show-current`. The branch should follow the pattern `BOARD-123-description` where `BOARD-123` is the Jira ticket ID.
The user may instead have provided a ticket number, if so use that, but remind the user to swap to a branch for this ticket and provide a branch name.
If the branch doesn't match this pattern and no ticket id was given, ask the user to provide the ticket ID manually.

## Jira API Usage

Use curl to fetch ticket details:

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/3/issue/TICKET-ID?expand=subtasks"
```

### Error Handling

- **401 Unauthorized**: Token is invalid or expired. Prompt user to regenerate at https://id.atlassian.com/manage-profile/security/api-tokens
- **404 Not Found**: Ticket doesn't exist or user doesn't have access
- **Network errors**: Check JIRA_BASE_URL is correct and accessible

## Output

Once the ticket is fetched, provide:

1. **Ticket Summary**: Title, status, assignee
2. **Description**: Full ticket description
3. **Acceptance Criteria**: Extract and list any acceptance criteria
4. **Subtasks**: List all subtasks with their status

Then inform the user if you have enough information to start working, or prompt the user for more information and run /begin if they confirm.
If the ticket does not contain enough information to start work, inform the user, and tell them to run /begin manually.

## Arguments

$ARGUMENTS - Optional: Ticket ID to fetch directly (e.g., `/jira BOARD-123`) or action (`plan`, `assess`, `summary`)
