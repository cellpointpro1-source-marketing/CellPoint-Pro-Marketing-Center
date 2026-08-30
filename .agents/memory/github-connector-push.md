---
name: GitHub connector push
description: Reliable way to publish repository changes through the authorized GitHub connector in this workspace.
---

When the local Git remote cannot authenticate directly, use the authorized GitHub connector's `proxyFetch` API rather than handling credentials. A Git database push can be desirable, but in this workspace multi-step Git data calls may fail with a sandbox replay pattern error even though single API calls work. The contents API is a reliable fallback: read each current file's GitHub blob SHA, then PUT the base64-encoded file with that SHA for existing files (omit it for new files), using sequential updates on `main`.

**Why:** The connector keeps credentials server-side, while the simpler file-update endpoint reliably completed the requested publish when the more atomic Git data sequence did not.

**How to apply:** Verify the remote branch before writing, update only intended tracked files, and verify the remote ref and representative file endpoints afterward. Expect the contents fallback to create multiple GitHub commits rather than preserving one local commit SHA.