import type { Domain, ModelAccessRule } from "@record-platform/core";

export const discussChannelAccessRule: ModelAccessRule = ({ db, user }) => idsDomain(getIds(db, "SELECT channel_id AS id FROM discuss_channel_member WHERE user_id = ? AND active = 1", user.id));
export const discussMessageAccessRule: ModelAccessRule = ({ db, user }) => idsDomain(getIds(db, "SELECT message.id FROM discuss_message message JOIN discuss_channel_member member ON member.channel_id = message.channel_id WHERE member.user_id = ? AND member.active = 1", user.id));
export const discussChannelMemberAccessRule: ModelAccessRule = ({ db, user }) => idsDomain(getIds(db, "SELECT member.id FROM discuss_channel_member member JOIN discuss_channel_member access ON access.channel_id = member.channel_id WHERE access.user_id = ? AND access.active = 1", user.id));
export const discussMessageReadAccessRule: ModelAccessRule = ({ db, user }) => idsDomain(getIds(db, "SELECT receipt.id FROM discuss_message_read receipt JOIN discuss_message message ON message.id = receipt.message_id JOIN discuss_channel_member member ON member.channel_id = message.channel_id WHERE member.user_id = ? AND member.active = 1", user.id));

function idsDomain(ids: number[]): Domain {
  return [["id", "in", ids]];
}

function getIds(db: any, sql: string, userId: number) {
  return (db.prepare(sql).all(userId) as Array<{ id: number }>).map((row) => Number(row.id));
}