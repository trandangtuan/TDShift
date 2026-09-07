import { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Select } from "antd";
import type { ApiClient, AuthUser } from "./types";

type LoginScreenProps = { api: ApiClient; onLogin: (token: string, user: AuthUser) => void };
type DatabaseOption = { name: string; isDefault: boolean };

export default function LoginScreen({ api, onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("admin");
  const [database, setDatabase] = useState("main");
  const [databases, setDatabases] = useState<DatabaseOption[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<DatabaseOption[]>("/api/databases")
      .then((items) => {
        setDatabases(items);
        if (items.length && !items.some((item) => item.name === database)) setDatabase(items[0].name);
      })
      .catch(() => setError("Không thể tải cơ sở dữ liệu."));
  }, [api]);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const body = mode === "login" ? { login, password, database } : { login, name, email, password, database };
      const result = await api<{ token: string; user: AuthUser }>(mode === "login" ? "/api/auth/login" : "/api/auth/register", { method: "POST", body });
      onLogin(result.token, result.user);
    } catch {
      setError(mode === "login" ? "Sai tài khoản hoặc mật khẩu." : "Không thể tạo tài khoản. Kiểm tra dữ liệu hoặc dùng tên đăng nhập khác.");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setLogin(nextMode === "login" ? "admin" : "");
    setPassword(nextMode === "login" ? "admin" : "");
    setError("");
  }

  return (
    <main className="login-page">
      <Form className="login-panel" layout="vertical" onFinish={submit}>
        <div><h1>Record Platform</h1><p>{mode === "login" ? "Login để tiếp tục." : "Create an account to start working."}</p></div>
        <div className="auth-switch">
          <Button type={mode === "login" ? "primary" : "text"} onClick={() => switchMode("login")}>Login</Button>
          <Button type={mode === "register" ? "primary" : "text"} onClick={() => switchMode("register")}>Đăng ký</Button>
        </div>
        <Form.Item label="Cơ sở dữ liệu"><Select value={database} onChange={setDatabase} options={databases.map((item) => ({ value: item.name, label: item.isDefault ? `${item.name} (default)` : item.name }))} /></Form.Item>
        <Form.Item label="Đăng nhập"><Input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" /></Form.Item>
        {mode === "register" ? <><Form.Item label="Tên"><Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></Form.Item><Form.Item label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></Form.Item></> : null}
        <Form.Item label="Mật khẩu"><Input.Password value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></Form.Item>
        {error ? <Alert type="error" showIcon message={error} /> : null}
        <Button type="primary" htmlType="submit" loading={submitting} block>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</Button>
      </Form>
    </main>
  );
}
