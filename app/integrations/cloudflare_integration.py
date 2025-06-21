import json
from datetime import datetime
try:
    from app import config # Diubah dari 'import config'
except ModuleNotFoundError:
    # Fallback jika dijalankan secara standalone atau config tidak di root
    print("Warning: app.config not found. Using default placeholder values for CloudflareIntegration.")
    class PlaceholderConfig:
        CLOUDFLARE_ACCOUNT_ID = "YOUR_CLOUDFLARE_ACCOUNT_ID"
        CLOUDFLARE_API_TOKEN = "YOUR_CLOUDFLARE_API_TOKEN" # Hati-hati dengan token ini
        R2_BUCKET_LOGS = "activity-logs-bucket"
        D1_DATABASE_ID = "YOUR_D1_DATABASE_ID"
        DO_USER_STATE_CLASS_NAME = "UserStateDO" # Nama class Durable Object Anda
        WORKER_SERVICE_TRACKING_API = "tracking-api"
    config = PlaceholderConfig()

# Catatan: Kode berikut adalah konseptual dan memerlukan lingkungan Cloudflare Workers/Pages
# serta library yang sesuai (misalnya, untuk HTTP requests ke API Cloudflare jika berinteraksi dari luar,
# atau binding jika berjalan di dalam Worker).

class CloudflareD1:
    """
    Kelas konseptual untuk interaksi dengan Cloudflare D1 Database.
    Dalam Worker, Anda akan menggunakan binding D1 yang disediakan.
    """
    def __init__(self, d1_binding):
        # d1_binding akan disediakan oleh runtime Cloudflare Workers
        # self.db = d1_binding
        print(f"Konseptual: CloudflareD1 diinisialisasi dengan binding.")
        # Untuk simulasi tanpa binding nyata:
        self._mock_db = {"users": [], "activity": []}

    async def execute_query(self, query: str, params: tuple | None = None):
        """
        Menjalankan query ke D1.
        Ini adalah placeholder; implementasi sebenarnya akan menggunakan self.db.prepare(query).bind(params).run() atau .all()
        """
        print(f"Konseptual D1: Menjalankan query: {query} dengan params: {params}")
        # Contoh simulasi sederhana
        if query.startswith("INSERT INTO users"):
            # Asumsi params adalah (user_id, token_session, ...)
            self._mock_db["users"].append({"user_id": params[0], "session_token": params[1]})
            return {"success": True, "meta": {"last_row_id": len(self._mock_db["users"])}}
        elif query.startswith("SELECT * FROM users WHERE user_id = ?"):
            user = next((u for u in self._mock_db["users"] if u["user_id"] == params[0]), None)
            return {"results": [user] if user else []}
        return {"success": False, "error": "Query tidak didukung dalam simulasi ini"}

class CloudflareR2:
    """
    Kelas konseptual untuk interaksi dengan Cloudflare R2 Storage.
    Dalam Worker, Anda akan menggunakan binding R2.
    """
    def __init__(self, r2_binding):
        # r2_binding akan disediakan oleh runtime Cloudflare Workers
        # self.bucket = r2_binding
        print(f"Konseptual: CloudflareR2 diinisialisasi dengan binding untuk bucket.")
        self._mock_bucket = {} # Untuk simulasi

    async def put_object(self, key: str, data: str | bytes):
        """
        Menyimpan objek ke R2.
        Ini adalah placeholder; implementasi sebenarnya akan menggunakan self.bucket.put(key, data)
        """
        print(f"Konseptual R2: Menyimpan objek dengan key: {key}")
        self._mock_bucket[key] = data
        return {"etag": "mock_etag_" + key}

    async def get_object(self, key: str) -> str | None:
        """
        Mengambil objek dari R2.
        Ini adalah placeholder; implementasi sebenarnya akan menggunakan response = await self.bucket.get(key); await response.text()
        """
        print(f"Konseptual R2: Mengambil objek dengan key: {key}")
        data = self._mock_bucket.get(key)
        if isinstance(data, bytes):
            return data.decode('utf-8')
        return data

class CloudflareDurableObjects:
    """
    Kelas konseptual untuk berinteraksi dengan Cloudflare Durable Objects (DO).
    Dalam Worker, Anda akan mendapatkan stub ke DO melalui binding.
    """
    def __init__(self, do_namespace_binding, class_name: str):
        # do_namespace_binding adalah binding ke namespace DO
        # self.namespace = do_namespace_binding
        self.class_name = class_name # Nama class DO yang didefinisikan
        print(f"Konseptual: CloudflareDurableObjects diinisialisasi untuk namespace DO (target class: {class_name}).")

    def get_stub(self, object_name_or_id: str):
        """
        Mendapatkan 'stub' untuk instance Durable Object tertentu.
        Dalam implementasi nyata:
        let id = this.namespace.idFromName(object_name_or_id); // atau idFromString jika object_name_or_id adalah hex ID
        let stub = this.namespace.get(id);
        return stub;
        """
        print(f"Konseptual DO: Mendapatkan stub untuk objek dengan nama/ID: {object_name_or_id} dari class {self.class_name}")
        # Ini akan mengembalikan objek yang bisa Anda panggil metodenya, misal stub.fetch('/increment')
        # Untuk simulasi, kita kembalikan objek mock yang bisa dipanggil method `fetch` nya.
        class MockDOStub:
            def __init__(self, name):
                self.name = name
                self._state = {"rate_per_min": 0.0, "status_flag": "NORMAL"}

            async def fetch(self, path: str, method: str = "GET", body=None):
                print(f"Konseptual DO Stub ({self.name}): Menerima fetch ke path '{path}' metode '{method}'")
                if path == "/updateRate":
                    if body and "rate" in body:
                        self._state["rate_per_min"] = body["rate"]
                        return {"status": "OK", "new_rate": self._state["rate_per_min"]}
                elif path == "/getState":
                    return self._state
                return {"error": "Path not mocked"}

        return MockDOStub(object_name_or_id)

# --- Contoh fungsi yang mungkin ada di Cloudflare Worker ---

# Ini adalah contoh bagaimana Worker endpoint bisa terlihat.
# `env` akan berisi binding ke D1, R2, DO namespaces, dll.
# `request` adalah objek Request standar Fetch API.

async def handle_activity_tracking_request(request, env):
    """
    Contoh handler untuk endpoint API tracking di Worker.
    Menerima data aktivitas, menyimpannya, dan mungkin memicu update ke Durable Object.
    """
    if request.method == "POST":
        try:
            data = await request.json() # Asumsi data aktivitas dikirim sebagai JSON
            user_id = data.get("user_id")
            activity_type = data.get("activity_type") # "view", "like", "comment"
            content_id = data.get("content_id")
            timestamp = data.get("timestamp", datetime.utcnow().isoformat())

            if not user_id or not activity_type:
                return {"error": "user_id and activity_type are required"}, 400

            # 1. Log aktivitas ke R2 (misalnya)
            if hasattr(env, config.R2_BUCKET_LOGS):
                r2 = CloudflareR2(env.R2_BUCKET_LOGS) # env.R2_BUCKET_LOGS adalah bindingnya
                log_key = f"logs/{user_id}/{timestamp}-{activity_type}.json"
                await r2.put_object(log_key, json.dumps(data))
            else:
                print("Simulasi: R2 binding tidak ditemukan, logging dilewati.")

            # 2. Simpan aktivitas ke D1 (misalnya)
            if hasattr(env, 'DB'): # 'DB' adalah nama binding D1 yang umum
                d1 = CloudflareD1(env.DB)
                # Anda mungkin punya tabel 'activities'
                # query = "INSERT INTO activities (user_id, type, content_id, timestamp) VALUES (?, ?, ?, ?)"
                # await d1.execute_query(query, (user_id, activity_type, content_id, timestamp))
                print(f"Simulasi D1: Mencatat aktivitas untuk user {user_id} (implementasi D1.execute_query diperlukan).")
            else:
                print("Simulasi: D1 binding 'DB' tidak ditemukan, penyimpanan DB dilewati.")

            # 3. Update state pengguna di Durable Object
            if hasattr(env, 'USER_STATE_DO'): # 'USER_STATE_DO' adalah nama binding namespace DO
                do_handler = CloudflareDurableObjects(env.USER_STATE_DO, config.DO_USER_STATE_CLASS_NAME)
                # Dapatkan stub untuk DO pengguna tertentu (misal, berdasarkan user_id)
                user_do_stub = do_handler.get_stub(user_id)

                # Panggil metode pada DO untuk update rate atau state
                # Ini adalah contoh, DO Anda akan memiliki logika sendiri
                # response_do = await user_do_stub.fetch("/recalculateAndUpdateRate", method="POST", body={"activity": data})
                # print(f"Simulasi DO: Hasil dari user_do_stub.fetch: {response_do}")
                print(f"Simulasi DO: Akan memanggil fetch pada stub DO untuk user {user_id} untuk update state.")
                # Contoh pemanggilan salah satu mock method di stub:
                current_do_state = await user_do_stub.fetch("/getState")
                print(f"Simulasi DO: State saat ini dari DO untuk {user_id}: {current_do_state}")


            return {"status": "Activity tracked successfully", "user_id": user_id}, 200

        except Exception as e:
            return {"error": str(e)}, 500
    else:
        return {"error": "Only POST method is allowed"}, 405


async def handle_login_request(request, env):
    """
    Contoh handler untuk endpoint login di Worker.
    Membuat sesi, menyimpan token, dll.
    """
    if request.method == "POST":
        # Logika untuk otentikasi pengguna
        # ...
        user_id = "simulated_user_after_login"
        session_token = "simulated_session_token_xxxx"

        # Simpan detail sesi ke D1 (misalnya)
        if hasattr(env, 'DB'):
            d1 = CloudflareD1(env.DB)
            # query = "INSERT INTO user_sessions (user_id, session_token, login_time) VALUES (?, ?, ?)"
            # await d1.execute_query(query, (user_id, session_token, datetime.utcnow().isoformat()))
            print(f"Simulasi D1: Menyimpan sesi untuk user {user_id}.")
        else:
            print("Simulasi: D1 binding 'DB' tidak ditemukan untuk login.")

        return {"user_id": user_id, "session_token": session_token}, 200
    else:
        return {"error": "Only POST method is allowed"}, 405

# --- Simulasi lingkungan 'env' untuk pengujian lokal (sangat sederhana) ---
class MockEnv:
    def __init__(self):
        # Untuk simulasi, kita bisa mock binding di sini
        # Dalam Cloudflare, ini akan diisi oleh runtime.
        # self.DB = "mock_d1_binding_instance" # Seharusnya instance dari D1 binding
        # self.R2_BUCKET_LOGS = "mock_r2_binding_instance" # Seharusnya instance dari R2 binding
        # self.USER_STATE_DO = "mock_do_namespace_binding_instance" # Seharusnya instance dari DO namespace

        # Karena class di atas menerima binding, kita bisa buat mock object sederhana
        # yang bisa diperiksa dengan hasattr
        class MockBinding:
            def __init__(self, name):
                self.name = name

        self.DB = MockBinding("D1_Main_DB")
        setattr(self, config.R2_BUCKET_LOGS, MockBinding(config.R2_BUCKET_LOGS)) # Menggunakan nama bucket dari config
        self.USER_STATE_DO = MockBinding("UserStateDONamespace") # Namespace untuk UserStateDO

class MockRequest:
    def __init__(self, method: str, json_data: dict | None = None):
        self.method = method
        self._json_data = json_data

    async def json(self):
        if self._json_data is None:
            raise ValueError("No JSON data provided for mock request")
        return self._json_data

# Contoh menjalankan fungsi handler secara konseptual
async def main_simulation():
    print("--- Memulai Simulasi Integrasi Cloudflare (Konseptual) ---")
    mock_env = MockEnv()

    # 1. Simulasi Login Request
    print("\n1. Simulasi Login Request:")
    login_req_data = {"username": "testuser", "password": "password123"} # Detail tidak digunakan di mock
    mock_login_request = MockRequest(method="POST", json_data=login_req_data)
    login_response, login_status = await handle_login_request(mock_login_request, mock_env)
    print(f"   Login Response: {login_response}, Status: {login_status}")
    user_id_from_login = login_response.get("user_id") if login_status == 200 else "unknown_user"

    # 2. Simulasi Activity Tracking Request
    print("\n2. Simulasi Activity Tracking Request:")
    activity_data = {
        "user_id": user_id_from_login,
        "activity_type": "view",
        "content_id": "video123",
        "timestamp": datetime.utcnow().isoformat()
    }
    mock_activity_request = MockRequest(method="POST", json_data=activity_data)
    activity_response, activity_status = await handle_activity_tracking_request(mock_activity_request, mock_env)
    print(f"   Activity Tracking Response: {activity_response}, Status: {activity_status}")

    # 3. Simulasi interaksi langsung dengan R2 (misalnya, admin membaca log)
    print("\n3. Simulasi Baca Log dari R2:")
    if hasattr(mock_env, config.R2_BUCKET_LOGS):
        # Dapatkan binding R2 dari env (yang sudah di-mock)
        r2_service = CloudflareR2(getattr(mock_env, config.R2_BUCKET_LOGS))
        # Kita perlu tahu key yang digunakan saat put_object di handle_activity_tracking_request
        # Ini hanya contoh, keynya mungkin berbeda
        example_log_key = f"logs/{user_id_from_login}/{activity_data['timestamp']}-{activity_data['activity_type']}.json"
        # Karena put_object di handle_activity_tracking_request adalah mock, kita perlu mock isinya di r2_service._mock_bucket
        await r2_service.put_object(example_log_key, json.dumps(activity_data)) # Simulasikan data sudah ada

        log_content = await r2_service.get_object(example_log_key)
        if log_content:
            print(f"   Isi log dari R2 (key: {example_log_key}): {json.loads(log_content)}")
        else:
            print(f"   Log tidak ditemukan di R2 (key: {example_log_key}). Ini mungkin karena key tidak cocok atau mock tidak diset.")
    else:
        print("   R2 binding tidak tersedia di mock_env untuk simulasi baca log.")

    # 4. Simulasi interaksi dengan D1 (misalnya, admin query pengguna)
    print("\n4. Simulasi Query Pengguna dari D1:")
    if hasattr(mock_env, 'DB'):
        d1_service = CloudflareD1(mock_env.DB)
        # Simulasikan data pengguna sudah ada setelah login
        await d1_service.execute_query("INSERT INTO users (user_id, session_token) VALUES (?, ?)", (user_id_from_login, "simulated_token"))

        user_data_from_d1 = await d1_service.execute_query("SELECT * FROM users WHERE user_id = ?", (user_id_from_login,))
        print(f"   Data pengguna dari D1: {user_data_from_d1}")
    else:
        print("   D1 binding tidak tersedia di mock_env untuk simulasi query pengguna.")

    print("\n--- Simulasi Selesai ---")

if __name__ == "__main__":
    import asyncio
    # Jika Anda menjalankan Python 3.8+, Anda bisa menggunakan asyncio.run
    # Untuk Python < 3.7, Anda mungkin perlu loop = asyncio.get_event_loop(); loop.run_until_complete(main_simulation())
    try:
        asyncio.run(main_simulation())
    except RuntimeError as e: # Menangani error jika event loop sudah berjalan (misal di Jupyter)
        if " asyncio.run() cannot be called from a running event loop" in str(e):
            print("Asyncio loop sudah berjalan. Menjalankan main_simulation() dalam loop yang ada.")
            loop = asyncio.get_event_loop()
            loop.create_task(main_simulation()) # create_task agar tidak blocking jika ada loop lain
        else:
            raise e
