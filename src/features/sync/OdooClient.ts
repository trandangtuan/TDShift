export type OdooRecord = Record<string, unknown> & { id: number; write_date?: string };

export class OdooClient {
  private uid = 0;
  private requestId = 0;

  constructor(private readonly url: string, private readonly database: string, private readonly username: string, private readonly secret: string) {}

  async authenticate(): Promise<number> {
    const uid = await this.call<number>("common", "authenticate", [this.database, this.username, this.secret, {}]);
    if (!uid) throw new Error("Odoo từ chối đăng nhập. Kiểm tra database, tài khoản và API key.");
    this.uid = uid;
    return uid;
  }

  async version(): Promise<Record<string, unknown>> { return this.call("common", "version", []); }

  async fieldsGet(model: string): Promise<Record<string, unknown>> {
    return this.execute(model, "fields_get", [], { attributes: ["string", "type", "relation", "relation_field", "selection", "readonly", "required"] });
  }

  async searchRead(model: string, domain: unknown[], fields: string[], limit: number): Promise<OdooRecord[]> {
    return this.execute(model, "search_read", [domain], { fields, limit, order: "write_date asc, id asc" });
  }

  async create(model: string, values: Record<string, unknown>): Promise<number> { return this.execute(model, "create", [values]); }
  async write(model: string, id: number, values: Record<string, unknown>): Promise<boolean> { return this.execute(model, "write", [[id], values]); }
  async unlink(model: string, id: number): Promise<boolean> { return this.execute(model, "unlink", [[id]]); }

  private async execute<T>(model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}): Promise<T> {
    if (!this.uid) await this.authenticate();
    return this.call("object", "execute_kw", [this.database, this.uid, this.secret, model, method, args, kwargs]);
  }

  private async call<T>(service: string, method: string, args: unknown[]): Promise<T> {
    const endpoint = `${this.url.replace(/\/+$/, "")}/jsonrpc`;
    let response: Response;
    try {
      response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args }, id: ++this.requestId }) });
    } catch (reason) { throw new Error(`Không kết nối được ${endpoint}: ${reason instanceof Error ? reason.message : String(reason)}`); }
    if (!response.ok) throw new Error(`Odoo HTTP ${response.status}: ${await response.text()}`);
    const payload = await response.json() as { result?: T; error?: { data?: { message?: string; debug?: string }; message?: string } };
    if (payload.error) throw new Error(payload.error.data?.message || payload.error.message || "Odoo JSON-RPC error");
    return payload.result as T;
  }
}
