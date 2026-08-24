import { useState } from "react";
import { Alert, Button, Form, Input } from "antd";
import type { ApiClient, AuthUser } from "./types";

type LoginScreenProps = { api: ApiClient; onLogin: (token: string, user: AuthUser) => void };

export default function LoginScreen({ api, onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const body = mode === "login" ? { login, password } : { login, name, email, password };
      const result = await api<{ token: string; user: AuthUser }>(mode === "login" ? "/api/auth/login" : "/api/auth/register", { method: "POST", body });
      onLogin(result.token, result.user);
    } catch {
      setError(mode === "login" ? "Invalid login or password." : "Could not create account. Check the values or use another login.");
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
        <div><h1>Record Platform</h1><p>{mode === "login" ? "Sign in to continue." : "Create an account to start working."}</p></div>
        <div className="auth-switch">
          <Button type={mode === "login" ? "primary" : "text"} onClick={() => switchMode("login")}>Login</Button>
          <Button type={mode === "register" ? "primary" : "text"} onClick={() => switchMode("register")}>Register</Button>
        </div>
        <Form.Item label="Login"><Input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" /></Form.Item>
        {mode === "register" ? <><Form.Item label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></Form.Item><Form.Item label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></Form.Item></> : null}
        <Form.Item label="Password"><Input.Password value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></Form.Item>
        {error ? <Alert type="error" showIcon message={error} /> : null}
        <Button type="primary" htmlType="submit" loading={submitting} block>{mode === "login" ? "Login" : "Register"}</Button>
      </Form>
    </main>
  );
}
