try:
    import config
except ModuleNotFoundError:
    print("Warning: config.py not found. Using default placeholder values for PricingModel.")
    class PlaceholderPricingConfig:
        COST_PER_1000_RATE_UNITS = 10000.0
        PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS = 10_000_000
        OVERAGE_FEE_MULTIPLIER = 1.5
        # Untuk contoh diskon, tambahkan nilai ini
        PREPAID_DISCOUNT_PERCENTAGE = 10 # Diskon 10% untuk paket prabayar besar

    config = PlaceholderPricingConfig()

# Fungsi calculate_usage_cost telah dihapus karena calculate_usage_cost_with_overage lebih komprehensif.
# Jika fungsionalitas yang lebih sederhana dari calculate_usage_cost diperlukan kembali,
# ia dapat dipulihkan atau fungsionalitasnya dapat diintegrasikan sebagai kasus khusus
# dalam calculate_usage_cost_with_overage (misalnya, ketika credit_limit_units adalah None
# dan tidak ada logika overage yang kompleks diperlukan selain diskon volume).

from app import config # Diubah dari 'import config' (jika sebelumnya ada di top level)

def calculate_usage_cost_with_overage(total_rate_units: int, credit_limit_units: int | None = None) -> tuple[float, str]:
    """
    Menghitung biaya penggunaan dengan memperhitungkan diskon volume dan potensi overage fee.

    Args:
        total_rate_units: Total unit aktivitas yang digunakan.
        credit_limit_units: Batas kredit rate-unit yang dimiliki pengguna.
                            Jika None, maka tidak ada konsep overage, hanya diskon volume.

    Returns:
        Tuple berisi (total_cost: float, details: str).
    """
    cost_per_unit_normal = config.COST_PER_1000_RATE_UNITS / 1000.0
    details = [f"Biaya normal per rate-unit: Rp {cost_per_unit_normal:,.2f}"]

    # Tentukan apakah diskon volume berlaku
    apply_volume_discount = total_rate_units > config.PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS

    cost_per_unit_effective = cost_per_unit_normal
    if apply_volume_discount:
        discount_percentage = getattr(config, "PREPAID_DISCOUNT_PERCENTAGE", 10.0)
        discount_factor = (100.0 - discount_percentage) / 100.0
        cost_per_unit_effective = cost_per_unit_normal * discount_factor
        details.append(f"Penggunaan melebihi {config.PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS:,} unit, diskon volume {discount_percentage}% diterapkan.")
        details.append(f"Biaya efektif per unit (setelah diskon volume): Rp {cost_per_unit_effective:,.2f}")
    else:
        details.append(f"Biaya efektif per unit (tanpa diskon volume): Rp {cost_per_unit_effective:,.2f}")

    if credit_limit_units is not None and total_rate_units > credit_limit_units:
        # Ada overage
        units_within_credit = credit_limit_units
        overage_units = total_rate_units - credit_limit_units

        # Biaya untuk unit dalam kredit (bisa jadi dengan diskon volume jika total_rate_units > threshold diskon)
        cost_for_credited_units = units_within_credit * cost_per_unit_effective

        # Biaya overage selalu dari tarif normal (non-diskon volume) dikali multiplier
        overage_cost_per_unit = cost_per_unit_normal * config.OVERAGE_FEE_MULTIPLIER
        cost_for_overage_units = overage_units * overage_cost_per_unit

        total_cost = cost_for_credited_units + cost_for_overage_units

        details.append(f"Total rate-unit digunakan: {total_rate_units:,}")
        details.append(f"Batas kredit: {credit_limit_units:,} unit.")
        details.append(f"  Unit dalam kredit ({units_within_credit:,}) x Rp {cost_per_unit_effective:,.2f} = Rp {cost_for_credited_units:,.2f}")
        details.append(f"  Unit kelebihan (overage) ({overage_units:,}) x Rp {overage_cost_per_unit:,.2f} (tarif {config.OVERAGE_FEE_MULTIPLIER}x normal) = Rp {cost_for_overage_units:,.2f}")
        details.append(f"Total Biaya (dengan overage): Rp {total_cost:,.2f}")
    else:
        # Tidak ada overage atau tidak ada batas kredit yang ditentukan
        total_cost = total_rate_units * cost_per_unit_effective
        details.append(f"Total rate-unit digunakan: {total_rate_units:,}")
        if credit_limit_units is not None:
            details.append(f"Penggunaan tidak melebihi batas kredit ({credit_limit_units:,} unit).")
        details.append(f"Total Biaya: Rp {total_cost:,.2f}")

    return total_cost, "\n".join(details)


if __name__ == '__main__':
    print("===== Simulasi Model Harga Berbasis Penggunaan =====")
    print(f"Konfigurasi Harga:")
    print(f"  Biaya per 1.000 rate-unit: Rp {config.COST_PER_1000_RATE_UNITS:,.2f}")
    print(f"  Ambang diskon prepaid: {config.PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS:,} rate-unit")
    if hasattr(config, "PREPAID_DISCOUNT_PERCENTAGE"):
        print(f"  Persentase diskon prepaid: {config.PREPAID_DISCOUNT_PERCENTAGE}%")
    else:
        print(f"  Persentase diskon prepaid: 10% (default jika tidak ada di config)")
    print(f"  Pengganda biaya overage: {config.OVERAGE_FEE_MULTIPLIER}x")

    # Skenario 1: Penggunaan rendah, tidak ada diskon, tidak ada overage
    print("\n--- Skenario 1: Penggunaan Rendah (500,000 rate-unit) ---")
    cost1, details1 = calculate_usage_cost_with_overage(total_rate_units=500_000)
    print(details1)
    print(f"Biaya Akhir: Rp {cost1:,.2f}")

    # Skenario 2: Penggunaan sedang, tidak ada diskon, tidak ada overage
    print("\n--- Skenario 2: Penggunaan Sedang (9,000,000 rate-unit) ---")
    cost2, details2 = calculate_usage_cost_with_overage(total_rate_units=9_000_000)
    print(details2)
    print(f"Biaya Akhir: Rp {cost2:,.2f}")

    # Skenario 3: Penggunaan tinggi, mendapatkan diskon volume
    # Threshold diskon = 10,000,000. Penggunaan = 12,000,000
    print("\n--- Skenario 3: Penggunaan Tinggi dengan Diskon Volume (12,000,000 rate-unit) ---")
    cost3, details3 = calculate_usage_cost_with_overage(total_rate_units=12_000_000)
    print(details3)
    print(f"Biaya Akhir: Rp {cost3:,.2f}")
    # Perhitungan manual:
    # Biaya per unit normal = 10000/1000 = 10.
    # Diskon 10%, jadi biaya per unit = 10 * 0.9 = 9.
    # Total biaya = 12,000,000 * 9 = 108,000,000.

    # Skenario 4: Penggunaan melebihi kredit, dikenakan overage fee, tanpa diskon volume
    # Kredit = 1,000,000. Penggunaan = 1,500,000.
    # Tidak mencapai threshold diskon volume (10jt).
    print("\n--- Skenario 4: Overage, Tanpa Diskon Volume ---")
    print("   (Kredit: 1,000,000 unit, Penggunaan: 1,500,000 unit)")
    cost4, details4 = calculate_usage_cost_with_overage(total_rate_units=1_500_000, credit_limit_units=1_000_000)
    print(details4)
    print(f"Biaya Akhir: Rp {cost4:,.2f}")
    # Perhitungan manual:
    # Biaya per unit normal = 10.
    # Unit dalam kredit: 1,000,000 * 10 = 10,000,000.
    # Unit overage: 500,000. Biaya per unit overage = 10 * 1.5 = 15.
    # Biaya overage = 500,000 * 15 = 7,500,000.
    # Total = 10,000,000 + 7,500,000 = 17,500,000.

    # Skenario 5: Penggunaan melebihi kredit, DAN mendapatkan diskon volume untuk bagian dalam kredit
    # Kredit = 11,000,000. Penggunaan = 12,000,000.
    # Threshold diskon volume = 10,000,000. Karena total_rate_units (12jt) > 10jt, diskon volume berlaku.
    print("\n--- Skenario 5: Overage, dengan Diskon Volume untuk Bagian Kredit ---")
    print("   (Kredit: 11,000,000 unit, Penggunaan: 12,000,000 unit)")
    cost5, details5 = calculate_usage_cost_with_overage(total_rate_units=12_000_000, credit_limit_units=11_000_000)
    print(details5)
    print(f"Biaya Akhir: Rp {cost5:,.2f}")
    # Perhitungan manual:
    # Biaya per unit normal = 10.
    # Karena penggunaan 12jt > 10jt (threshold diskon), biaya efektif per unit = 10 * 0.9 = 9.
    # Unit dalam kredit: 11,000,000 * 9 = 99,000,000.
    # Unit overage: 1,000,000. Biaya per unit overage = 10 * 1.5 = 15 (dari tarif normal, bukan diskon).
    # Biaya overage = 1,000,000 * 15 = 15,000,000.
    # Total = 99,000,000 + 15,000,000 = 114,000,000.

    # Skenario 6: Penggunaan sangat tinggi, diskon volume, tidak ada batas kredit (atau batas kredit sangat tinggi)
    print("\n--- Skenario 6: Penggunaan Sangat Tinggi, Diskon Volume, Tanpa Overage ---")
    print("   (Penggunaan: 50,000,000 unit, Tanpa batas kredit eksplisit / batas sangat tinggi)")
    cost6, details6 = calculate_usage_cost_with_overage(total_rate_units=50_000_000, credit_limit_units=None) # atau credit_limit_units=60_000_000
    print(details6)
    print(f"Biaya Akhir: Rp {cost6:,.2f}")
    # Perhitungan manual:
    # Biaya per unit efektif (dengan diskon 10%) = 9.
    # Total = 50,000,000 * 9 = 450,000,000.

    print("\n===== Simulasi Model Harga Selesai =====")
