# Services

Business logic layer (e.g. "hash the password and create a user",
"verify ownership before deleting a note"). Services call the
data-access layer; they never touch `req`/`res` or write raw SQL directly.
