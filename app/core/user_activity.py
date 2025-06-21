from datetime import datetime, timedelta

class UserSession:
    """
    Mewakili sesi aktivitas seorang pengguna.
    Menyimpan informasi aktivitas seperti views, likes, dan comments.
    """
    def __init__(self, user_id: str, session_token: str):
        self.user_id = user_id
        self.session_token = session_token
        self.activities: list[dict] = [] # Daftar aktivitas, misal {'type': 'view', 'timestamp': datetime, 'content_id': 'video123'}
        self.login_time = datetime.now()
        self.last_activity_time = self.login_time

    def record_activity(self, activity_type: str, content_id: str | None = None, timestamp: datetime | None = None):
        """
        Mencatat aktivitas baru untuk pengguna.

        Args:
            activity_type: Jenis aktivitas ('view', 'like', 'comment').
            content_id: ID konten yang terkait dengan aktivitas (opsional).
            timestamp: Waktu aktivitas terjadi (opsional, default ke waktu sekarang).
        """
        if timestamp is None:
            timestamp = datetime.now()

        activity_data = {
            "type": activity_type,
            "timestamp": timestamp,
            "content_id": content_id
        }
        self.activities.append(activity_data)
        self.last_activity_time = timestamp
        # print(f"Activity recorded: User {self.user_id}, Type: {activity_type}, Content: {content_id}, Time: {timestamp}")

    def get_activity_counts_since(self, start_time: datetime) -> tuple[int, int, int]:
        """
        Menghitung jumlah views, likes, dan comments sejak waktu tertentu.

        Args:
            start_time: Waktu mulai untuk menghitung aktivitas.

        Returns:
            Tuple berisi (jumlah views, jumlah likes, jumlah comments).
        """
        views = 0
        likes = 0
        comments = 0
        for activity in self.activities:
            if activity["timestamp"] >= start_time:
                if activity["type"] == "view":
                    views += 1
                elif activity["type"] == "like":
                    likes += 1
                elif activity["type"] == "comment":
                    comments += 1
        return views, likes, comments

    def get_total_activity_counts(self) -> tuple[int, int, int]:
        """
        Menghitung total jumlah views, likes, dan comments dalam sesi ini.

        Returns:
            Tuple berisi (total views, total likes, total comments).
        """
        return self.get_activity_counts_since(self.login_time)

    def get_session_duration_minutes(self) -> float:
        """
        Menghitung durasi sesi saat ini dalam menit.

        Returns:
            Durasi sesi dalam menit.
        """
        duration = self.last_activity_time - self.login_time
        return duration.total_seconds() / 60.0

# Contoh penggunaan
if __name__ == '__main__':
    # Membuat sesi pengguna baru
    user1_session = UserSession(user_id="user123", session_token="abcxyz123")
    print(f"User {user1_session.user_id} logged in with session token {user1_session.session_token} at {user1_session.login_time}")

    # Mensimulasikan beberapa aktivitas
    user1_session.record_activity(activity_type="view", content_id="videoA")
    user1_session.record_activity(activity_type="like", content_id="videoA")
    # Simulasikan waktu berlalu
    simulated_time_after_2_activities = datetime.now() + timedelta(seconds=30)
    user1_session.record_activity(activity_type="view", content_id="videoB", timestamp=simulated_time_after_2_activities)
    user1_session.record_activity(activity_type="comment", content_id="videoB", timestamp=simulated_time_after_2_activities + timedelta(seconds=10))

    # Mendapatkan total aktivitas
    total_views, total_likes, total_comments = user1_session.get_total_activity_counts()
    print(f"\nTotal activities for {user1_session.user_id}:")
    print(f"Views: {total_views}, Likes: {total_likes}, Comments: {total_comments}")

    # Mendapatkan durasi sesi
    duration_min = user1_session.get_session_duration_minutes()
    print(f"Session duration: {duration_min:.2f} minutes")

    # Menghitung aktivitas dalam periode tertentu
    # Misalkan kita ingin menghitung aktivitas dalam 30 detik terakhir dari aktivitas terakhir
    start_time_for_calc = user1_session.last_activity_time - timedelta(seconds=30)
    views_recent, likes_recent, comments_recent = user1_session.get_activity_counts_since(start_time_for_calc)
    print(f"\nRecent activities (since {start_time_for_calc}):")
    print(f"Views: {views_recent}, Likes: {likes_recent}, Comments: {comments_recent}")

    # Menggunakan data ini dengan bot_detection
    from app.core import bot_detection # Diubah dari 'import bot_detection'

    # Hitung Rate_per_min untuk seluruh sesi sejauh ini
    # Perhatian: Durasi pengukuran (T) dalam rumus Rate_per_min adalah durasi pengukuran,
    # bukan durasi total sesi jika kita mengukur secara periodik.
    # Jika kita ingin Rate_per_min untuk seluruh sesi:
    current_views, current_likes, current_comments = user1_session.get_total_activity_counts()
    current_duration_minutes = user1_session.get_session_duration_minutes()

    # Pastikan durasi tidak nol untuk menghindari ZeroDivisionError
    if current_duration_minutes > 0:
        rate_total_session = bot_detection.calculate_rate_per_minute(
            current_views, current_likes, current_comments, current_duration_minutes
        )
        print(f"\nRate per minute for the entire session so far: {rate_total_session:.2f}")
    else:
        print("\nSession duration is too short to calculate rate per minute for the entire session.")

    # Jika T adalah durasi pengukuran tetap, misal 1 menit.
    # Kita perlu mengakumulasi aktivitas selama 1 menit tersebut.
    # Contoh: jika kita mengukur setiap menit.
    # Untuk simulasi, anggap semua aktivitas di atas terjadi dalam 1 menit pengukuran.
    T_measurement_minutes = 1.0
    rate_measurement_period = bot_detection.calculate_rate_per_minute(
        current_views, current_likes, current_comments, T_measurement_minutes
    )
    print(f"Rate per minute assuming all activities occurred within a {T_measurement_minutes}-minute measurement window: {rate_measurement_period:.2f}")

    # Contoh deteksi bot menggunakan rate ini
    mu_normal = 10.0
    sigma_normal = 2.0
    level = bot_detection.detect_bot_level(rate_measurement_period, mu_normal, sigma_normal)
    print(f"Bot detection level for {user1_session.user_id}: {level}")
    print(bot_detection.handle_bot_detection_action(level, user1_session.user_id))

    # Skenario lain: pengguna dengan banyak aktivitas dalam waktu singkat
    user2_session = UserSession(user_id="user_high_rate", session_token="securesession789")
    user2_session.record_activity("view", "vid1")
    user2_session.record_activity("view", "vid2")
    user2_session.record_activity("like", "vid1")
    user2_session.record_activity("view", "vid3")
    user2_session.record_activity("comment", "vid2")
    user2_session.record_activity("view", "vid4")
    user2_session.record_activity("view", "vid5") # Total 5 views, 1 like, 1 comment = 7 activities

    # Asumsikan semua ini terjadi dalam 0.25 menit (15 detik) untuk periode pengukuran T
    T_measurement_short_minutes = 0.25
    v, l, c = user2_session.get_total_activity_counts()
    rate_short_period = bot_detection.calculate_rate_per_minute(v, l, c, T_measurement_short_minutes)
    print(f"\nUser {user2_session.user_id} activity rate (in {T_measurement_short_minutes} min window): {rate_short_period:.2f}")

    level_user2 = bot_detection.detect_bot_level(rate_short_period, mu_normal, sigma_normal)
    print(f"Bot detection level for {user2_session.user_id}: {level_user2}") # Harusnya 'A' jika rate tinggi
    print(bot_detection.handle_bot_detection_action(level_user2, user2_session.user_id))

    # Skenario pengguna normal
    user3_session = UserSession(user_id="user_normal_rate", session_token="normalsession101")
    user3_session.record_activity("view", "article1")
    # Simulasikan waktu aktivitas selama 1 menit pengukuran
    user3_session.last_activity_time = user3_session.login_time + timedelta(minutes=1)
    v_norm, l_norm, c_norm = user3_session.get_total_activity_counts() # 1 view, 0 likes, 0 comments

    # Durasi pengukuran T = 1 menit
    T_normal_user_measurement = 1.0
    rate_normal_user = bot_detection.calculate_rate_per_minute(v_norm, l_norm, c_norm, T_normal_user_measurement)
    print(f"\nUser {user3_session.user_id} activity rate (in {T_normal_user_measurement} min window): {rate_normal_user:.2f}")

    level_user3 = bot_detection.detect_bot_level(rate_normal_user, mu_normal, sigma_normal)
    print(f"Bot detection level for {user3_session.user_id}: {level_user3}") # Harusnya 'C'
    print(bot_detection.handle_bot_detection_action(level_user3, user3_session.user_id))
