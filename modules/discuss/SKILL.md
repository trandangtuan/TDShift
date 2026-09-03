# Discuss Module Skill

Use this module for internal chat channel membership management.

## Scope

- `discuss.channel` stores internal channels.
- `discuss.channel.member` links channels to `core.user` records.
- `discuss.message` stores messages sent by users in channels.
- Members can be created, removed, deactivated, and assigned a channel-specific label.

## User Workflows

- Open Discuss > Channels to create or manage channels.
- Add members from a channel form or the Channel Members menu.
- Remove a member by deleting its membership record, or deactivate it with the Active flag.