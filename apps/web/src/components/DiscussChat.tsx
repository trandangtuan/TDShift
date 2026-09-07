import { io, type Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Edit3, Hash, MoreHorizontal, Paperclip, Plus, Search, Send, Settings2, Trash2, UserMinus, User, X } from "lucide-react";
import type { ApiClient, AuthUser } from "./types";

type DiscussChatProps = { api: ApiClient; user: AuthUser };
type Relation = number | [number, string] | null | undefined;
type Channel = { id: number; name: string; description?: string | null };
type Member = { id: number; user_id: Relation; label?: string | null; active?: boolean | number };
type ChatMessage = { id: number; channelId: number; authorId: number; authorName: string; body: string; sentAt: string };
type UserOption = { id: number; name: string; login?: string; email?: string; phone?: string };

const tokenStorageKey = "record-platform-token";
const socketUrl = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:3100" : undefined);

export default function DiscussChat({ api, user }: DiscussChatProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUser] = useState<UserOption[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [readBy, setReadBy] = useState<Record<number, number[]>>({});
  const [draft, setDraft] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberLabel, setMemberLabel] = useState("");
  const [editingLabelId, setEditingLabelId] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const selectedChannelRef = useRef<number | null>(null);
  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId) ?? null;
  const activeMembers = members.filter((member) => member.active !== false && member.active !== 0);
  const memberIds = new Set(activeMembers.map((member) => relationId(member.user_id)).filter((id): id is number => id !== null));
  const userResults = users.filter((item) => item.id !== user.id && `${item.name} ${item.login ?? ""} ${item.email ?? ""} ${item.phone ?? ""}`.toLowerCase().includes(userSearch.trim().toLowerCase())).slice(0, 8);

  useEffect(() => { selectedChannelRef.current = selectedChannelId; }, [selectedChannelId]);

  useEffect(() => {
    void loadChannels();
    void loadUser();
    const socket = io(socketUrl, { auth: { token: localStorage.getItem(tokenStorageKey) } });
    socket.on("connect_error", () => setError("Không thể kết nối realtime."));
    socket.on("message:new", (message: ChatMessage) => {
      if (message.channelId !== selectedChannelRef.current) return;
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      socket.emit("message:read", { channelId: message.channelId, messageId: message.id });
    });
    socket.on("message:read", (receipt: { messageId: number; userId: number }) => setReadBy((current) => ({ ...current, [receipt.messageId]: [...new Set([...(current[receipt.messageId] ?? []), receipt.userId])] })));
    socket.on("message:error", (payload: { message?: string }) => setError(payload.message ?? "Không thể gửi tin nhắn."));
    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  useEffect(() => {
    if (selectedChannelId === null) return;
    void loadChannel(selectedChannelId);
    socketRef.current?.emit("channel:join", selectedChannelId);
    return () => { socketRef.current?.emit("channel:leave", selectedChannelId); };
  }, [selectedChannelId]);

  useEffect(() => { messageEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadChannels() {
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: "discuss.channel", domain: [["active", "=", 1]], fields: ["name", "description"], limit: 100 } });
    const next = data.records.map((record) => ({ id: Number(record.id), name: String(record.name ?? "Kênh không tên"), description: record.description as string | null }));
    setChannels(next); setSelectedChannelId((current) => current ?? next[0]?.id ?? null);
  }

  async function loadUser() {
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: "core.user", domain: [["active", "=", 1]], fields: ["name", "login", "email", "phone"], limit: 200 } });
    setUser(data.records.map((record) => ({ id: Number(record.id), name: String(record.name ?? record.login ?? "Người dùng"), login: record.login as string | undefined, email: record.email as string | undefined, phone: record.phone as string | undefined })));
  }

  async function loadChannel(channelId: number) {
    const [messageData, memberData, readData] = await Promise.all([
      api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: "discuss.message", domain: [["channel_id", "=", channelId], ["active", "=", 1]], fields: ["channel_id", "author_id", "body", "sent_at"], limit: 200 } }),
      api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: "discuss.channel.member", domain: [["channel_id", "=", channelId], ["active", "=", 1]], fields: ["user_id", "label", "active"], limit: 200 } }),
      api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: "discuss.message.read", domain: [], fields: ["message_id", "user_id"], limit: 1000 } })
    ]);
    setMessages(messageData.records.map((record) => ({ id: Number(record.id), channelId, authorId: relationId(record.author_id) ?? 0, authorName: relationName(record.author_id) ?? "Người dùng", body: String(record.body ?? ""), sentAt: String(record.sent_at ?? "") })));
    setMembers(memberData.records.map((record) => ({ id: Number(record.id), user_id: record.user_id as Relation, label: record.label as string | null, active: record.active as boolean | number })));
    const nextReadBy: Record<number, number[]> = {};
    for (const record of readData.records) { const messageId = relationId(record.message_id); const userId = relationId(record.user_id); if (messageId && userId) nextReadBy[messageId] = [...(nextReadBy[messageId] ?? []), userId]; }
    setReadBy(nextReadBy);
    for (const record of messageData.records) { const messageId = Number(record.id); if (messageId) socketRef.current?.emit("message:read", { channelId, messageId }); }
  }

  async function openDirectChat(target: UserOption) {
    const membershipData = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: "discuss.channel.member", domain: [["active", "=", 1]], fields: ["channel_id", "user_id"], limit: 1000 } });
    const grouped = new Map<number, Set<number>>();
    for (const record of membershipData.records) {
      const channelId = relationId(record.channel_id); const userId = relationId(record.user_id);
      if (channelId && userId) grouped.set(channelId, new Set([...(grouped.get(channelId) ?? []), userId]));
    }
    const existing = [...grouped.entries()].find(([, ids]) => ids.size === 2 && ids.has(user.id) && ids.has(target.id));
    let channelId = existing?.[0];
    if (!channelId) {
      const channelResult = await api<{ id: number }>("/api/model/create", { method: "POST", body: { model: "discuss.channel", values: { name: target.name, description: `Tin nhắn riêng với ${target.name}`, active: true } } });
      channelId = channelResult.id;
      await api("/api/model/create", { method: "POST", body: { model: "discuss.channel.member", values: { channel_id: channelId, user_id: user.id, label: "Thành viên", active: true } } });
      await api("/api/model/create", { method: "POST", body: { model: "discuss.channel.member", values: { channel_id: channelId, user_id: target.id, label: "Thành viên", active: true } } });
      await loadChannels();
    }
    setUserSearch(""); setSelectedChannelId(channelId);
  }

  async function deleteChannel() {
    if (!selectedChannelId || !selectedChannel) return;
    if (!window.confirm(`Delete channel "${selectedChannel.name}" và toàn bộ tin nhắn?`)) return;
    await api(`/api/discuss/channels/${selectedChannelId}`, { method: "DELETE" });
    const nextChannelId = channels.find((channel) => channel.id !== selectedChannelId)?.id ?? null;
    setChannels((current) => current.filter((channel) => channel.id !== selectedChannelId));
    setSelectedChannelId(nextChannelId); setShowMembers(false); setMessages([]);
  }

  async function createChannel() {
    const name = newChannelName.trim(); if (!name) return;
    const result = await api<{ id: number }>("/api/model/create", { method: "POST", body: { model: "discuss.channel", values: { name, active: true } } });
    await api("/api/model/create", { method: "POST", body: { model: "discuss.channel.member", values: { channel_id: result.id, user_id: user.id, label: "Chủ channel", active: true } } });
    setNewChannelName(""); await loadChannels(); setSelectedChannelId(result.id);
  }

  async function addMember() {
    if (!selectedChannelId || !memberUserId || memberIds.has(Number(memberUserId))) return;
    await api("/api/model/create", { method: "POST", body: { model: "discuss.channel.member", values: { channel_id: selectedChannelId, user_id: Number(memberUserId), label: memberLabel.trim() || null, active: true } } });
    setMemberUserId(""); setMemberLabel(""); await loadChannel(selectedChannelId);
  }

  async function removeMember(memberId: number) {
    if (!selectedChannelId) return;
    await api("/api/model/unlink", { method: "POST", body: { model: "discuss.channel.member", ids: [memberId] } }); await loadChannel(selectedChannelId);
  }

  async function saveMemberLabel(memberId: number) {
    if (!selectedChannelId) return;
    await api("/api/model/write", { method: "POST", body: { model: "discuss.channel.member", ids: [memberId], values: { label: editingLabel.trim() || null } } });
    setEditingLabelId(null); setEditingLabel(""); await loadChannel(selectedChannelId);
  }

  function sendMessage(event: React.FormEvent) {
    event.preventDefault(); const body = draft.trim();
    if (!body || !selectedChannelId || !socketRef.current?.connected) return;
    socketRef.current.emit("message:send", { channelId: selectedChannelId, body }); setDraft(""); setError(null);
  }

  return <section className="discuss-chat">
    <aside className="discuss-channels"><div className="discuss-sidebar-head"><div><span className="eyebrow">INTERNAL MESSAGING</span><h2>Trò chuyện</h2></div><button className="discuss-icon-button" title="Cài đặt" aria-label="Cài đặt"><Settings2 size={16} /></button></div><label className="discuss-search"><Search size={14} /><input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Tìm theo tên, phone, email" /></label>{userSearch.trim() ? <div className="user-search-results">{userResults.map((item) => <button key={item.id} onClick={() => void openDirectChat(item)}><span className="member-avatar">{item.name.slice(0, 1).toUpperCase()}</span><span><strong>{item.name}</strong><small>{[item.phone, item.email, item.login].filter(Boolean).join(" • ")}</small></span><Send size={14} /></button>)}{!userResults.length ? <p>Không tìm thấy user</p> : null}</div> : null}<div className="discuss-channel-list">{channels.map((channel) => <button key={channel.id} className={`discuss-channel ${channel.id === selectedChannelId ? "selected" : ""}`} onClick={() => setSelectedChannelId(channel.id)}><span className="channel-avatar"><Hash size={15} /></span><span><strong>{channel.name}</strong><small>{channel.description || "Channel nội bộ"}</small></span><MoreHorizontal size={15} /></button>)}</div><form className="new-channel-form" onSubmit={(event) => { event.preventDefault(); void createChannel(); }}><input value={newChannelName} onChange={(event) => setNewChannelName(event.target.value)} placeholder="Channel mới" /><button type="submit" title="Create channel" aria-label="Create channel"><Plus size={16} /></button></form></aside>
    <main className="discuss-conversation">{selectedChannel ? <><header className="discuss-conversation-head"><div className="channel-avatar large"><Hash size={19} /></div><div><h2>{selectedChannel.name}</h2><p>{activeMembers.length} thành viên <span>•</span> {selectedChannel.description || "Trao đổi công việc nội bộ"}</p></div><button className="members-button" onClick={() => setShowMembers((current) => !current)}><User size={17} /> Thành viên <span>{activeMembers.length}</span></button><button className="discuss-icon-button danger-icon" onClick={() => void deleteChannel()} title="Delete channel" aria-label="Delete channel"><Trash2 size={17} /></button></header><div className="discuss-messages">{messages.length ? messages.map((message) => { const own = message.authorId === user.id; const seen = own && (readBy[message.id] ?? []).some((id) => id !== user.id); return <div className={`message-row ${own ? "own" : ""}`} key={message.id}><div className="message-avatar">{message.authorName.slice(0, 1).toUpperCase()}</div><div className="message-stack"><span className="message-author">{own ? "Bạn" : message.authorName}</span><div className="message-bubble">{message.body}</div><div className="message-meta"><time>{formatTime(message.sentAt)}</time>{own ? (seen ? <><CheckCheck size={14} className="seen" /> Đã xem</> : <Check size={14} />) : null}</div></div></div>; }) : <div className="empty-chat"><div className="empty-chat-icon"><Hash size={26} /></div><h3>Bắt đầu cuộc trò chuyện</h3><p>Send tin nhắn đầu tiên trong {selectedChannel.name}.</p></div>}<div ref={messageEndRef} /></div><form className="message-composer" onSubmit={sendMessage}><button type="button" className="discuss-icon-button" title="Đính kèm" aria-label="Đính kèm"><Paperclip size={18} /></button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Nhắn vào #${selectedChannel.name}`} /><button type="submit" className="send-button" title="Send tin nhắn" aria-label="Send tin nhắn"><Send size={17} /></button></form></> : <div className="empty-chat"><div className="empty-chat-icon"><Hash size={26} /></div><h3>Chọn một channel</h3><p>Create channel mới để bắt đầu.</p></div>}</main>
    {showMembers && selectedChannel ? <aside className="discuss-members"><header><div><span className="eyebrow">CHANNEL PEOPLE</span><h3>Thành viên</h3></div><button className="discuss-icon-button" onClick={() => setShowMembers(false)} title="Đóng" aria-label="Đóng"><X size={17} /></button></header><div className="member-add"><select value={memberUserId} onChange={(event) => setMemberUserId(event.target.value)}><option value="">Thêm người dùng...</option>{users.filter((item) => !memberIds.has(item.id)).map((item) => <option value={item.id} key={item.id}>{item.name} {item.login ? `(${item.login})` : ""}</option>)}</select><input value={memberLabel} onChange={(event) => setMemberLabel(event.target.value)} placeholder="Label, ví dụ: Lead" /><button onClick={() => void addMember()}><Plus size={15} /> Thêm</button></div><div className="member-list">{activeMembers.map((member) => { const id = relationId(member.user_id); const name = relationName(member.user_id) ?? users.find((item) => item.id === id)?.name ?? "Người dùng"; const isEditing = editingLabelId === member.id; return <div className="member-row" key={member.id}><span className="member-avatar">{name.slice(0, 1).toUpperCase()}</span><div><strong>{name}</strong>{isEditing ? <input className="member-label-input" value={editingLabel} onChange={(event) => setEditingLabel(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void saveMemberLabel(member.id); }} autoFocus /> : <small>{member.label || "Thành viên"}</small>}</div>{isEditing ? <button className="discuss-icon-button" onClick={() => void saveMemberLabel(member.id)} title="Save label" aria-label="Save label"><Check size={16} /></button> : <button className="discuss-icon-button" onClick={() => { setEditingLabelId(member.id); setEditingLabel(member.label ?? ""); }} title="Sửa label" aria-label={`Sửa label của ${name}`}><Edit3 size={15} /></button>}{id !== user.id ? <button className="discuss-icon-button danger-icon" onClick={() => void removeMember(member.id)} title="Delete thành viên" aria-label={`Delete ${name}`}><UserMinus size={16} /></button> : <span className="you-label">Bạn</span>}</div>; })}</div></aside> : null}
    {error ? <button className="discuss-error" onClick={() => setError(null)}>{error} <X size={14} /></button> : null}
  </section>;
}

function relationId(value: Relation | unknown): number | null { return Array.isArray(value) ? Number(value[0]) : typeof value === "number" ? value : null; }
function relationName(value: Relation | unknown): string | null { return Array.isArray(value) ? String(value[1]) : null; }
function formatTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }); }