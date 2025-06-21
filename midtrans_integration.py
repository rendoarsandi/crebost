# Modul placeholder untuk integrasi dengan Midtrans.
# Fungsi-fungsi di sini hanya simulasi dan perlu diganti dengan implementasi
# menggunakan SDK atau API Midtrans yang sebenarnya.

import uuid # Untuk menghasilkan ID transaksi unik contoh
from datetime import datetime

def initiate_midtrans_deposit(user_id: str, amount: float, description: str) -> dict:
    """
    Placeholder untuk memulai proses deposit melalui Midtrans.

    Dalam implementasi nyata, ini akan:
    1. Berkomunikasi dengan API Midtrans untuk membuat transaksi.
    2. Mendapatkan token transaksi atau URL redirect dari Midtrans.
    3. Menyimpan detail transaksi awal di database lokal.

    Args:
        user_id: ID pengguna yang melakukan deposit.
        amount: Jumlah deposit.
        description: Deskripsi deposit (misalnya, "Deposit untuk Campaign X").

    Returns:
        Sebuah dictionary yang mensimulasikan respons dari Midtrans,
        misalnya berisi token transaksi atau URL redirect.
    """
    print(f"[Midtrans SIMULASI] Memulai deposit untuk User ID: {user_id}")
    print(f"[Midtrans SIMULASI] Jumlah: {amount:.2f}, Deskripsi: {description}")

    if amount <= 0:
        return {
            "success": False,
            "transaction_id": None,
            "redirect_url": None,
            "error_message": "Jumlah deposit harus lebih besar dari nol."
        }

    # Simulasi pembuatan ID transaksi unik
    transaction_id = f"DEP-{uuid.uuid4().hex[:10].upper()}"

    # Simulasi URL redirect atau token Snap
    snap_token_or_redirect_url = f"https://app.sandbox.midtrans.com/snap/v1/transactions/{transaction_id}" # Contoh

    print(f"[Midtrans SIMULASI] Transaksi ID: {transaction_id}")
    print(f"[Midtrans SIMULASI] Snap Token/Redirect URL: {snap_token_or_redirect_url}")

    return {
        "success": True,
        "transaction_id": transaction_id,
        "payment_type": "gopay", # Contoh, bisa beragam
        "status_message": "Transaksi berhasil dibuat, menunggu pembayaran.",
        "redirect_url": snap_token_or_redirect_url, # Untuk frontend
        "error_message": None
    }

def initiate_midtrans_payout(user_id: str, net_amount: float, withdrawal_details: dict) -> dict:
    """
    Placeholder untuk memulai proses payout (withdrawal) melalui Midtrans.

    Dalam implementasi nyata, ini akan:
    1. Berkomunikasi dengan API Payout Midtrans (atau Disbursement).
    2. Menyediakan detail bank penerima (biasanya sudah terdaftar atau diinput pengguna).
    3. Mengirim permintaan payout.
    4. Menangani status callback dari Midtrans.

    Args:
        user_id: ID pengguna yang menerima payout.
        net_amount: Jumlah bersih yang akan dikirim ke pengguna.
        withdrawal_details: Dictionary berisi detail withdrawal (misalnya, dari process_promoter_withdrawal).
                            Ini bisa termasuk gross_amount, platform_fee, tax_deducted.

    Returns:
        Sebuah dictionary yang mensimulasikan respons dari Midtrans setelah permintaan payout.
    """
    print(f"[Midtrans SIMULASI] Memulai payout untuk User ID: {user_id}")
    print(f"[Midtrans SIMULASI] Jumlah Bersih: {net_amount:.2f}")
    print(f"[Midtrans SIMULASI] Detail Withdrawal Awal: {withdrawal_details}")

    if net_amount <= 0:
        return {
            "success": False,
            "payout_id": None,
            "status": "failed",
            "error_message": "Jumlah payout harus lebih besar dari nol."
        }

    # Simulasi pembuatan ID payout unik
    payout_id = f"PAYOUT-{uuid.uuid4().hex[:12].upper()}"
    timestamp = datetime.now().isoformat()

    print(f"[Midtrans SIMULASI] Payout ID: {payout_id} dibuat pada {timestamp}")

    # Simulasi respons sukses dari Midtrans (dalam kenyataannya ini bisa pending dulu)
    return {
        "success": True,
        "payout_id": payout_id,
        "status": "pending", # Atau "success" jika API Midtrans langsung konfirmasi
        "reference_id": withdrawal_details.get("gross_amount", 0), # Contoh penggunaan detail
        "amount_sent": net_amount,
        "destination_bank": "BCA", # Contoh, harusnya dari data pengguna
        "destination_account": "1234567890", # Contoh, harusnya dari data pengguna
        "created_at": timestamp,
        "error_message": None
    }

def check_midtrans_transaction_status(transaction_id: str) -> dict:
    """
    Placeholder untuk memeriksa status transaksi di Midtrans.

    Args:
        transaction_id: ID transaksi Midtrans yang ingin diperiksa.

    Returns:
        Dictionary berisi status transaksi.
    """
    print(f"[Midtrans SIMULASI] Memeriksa status untuk transaksi ID: {transaction_id}")
    # Simulasi: bisa saja statusnya berubah dari pending ke success atau failed
    possible_statuses = ["pending", "success", "failure", "challenge", "expire"]
    import random
    simulated_status = random.choice(possible_statuses)

    response = {
        "transaction_id": transaction_id,
        "status_code": "200", # HTTP status code
        "status_message": f"Transaction status: {simulated_status}",
        "transaction_status": simulated_status, # 'capture', 'settlement', 'pending', 'deny', 'cancel', 'expire', 'failure'
        "fraud_status": "accept", # 'challenge', 'accept', 'deny'
        "payment_type": "gopay", # Contoh
        "gross_amount": "100000.00" # Contoh
    }
    if simulated_status == "success":
        response["settlement_time"] = datetime.now().isoformat()

    print(f"[Midtrans SIMULASI] Status saat ini: {simulated_status}")
    return response


if __name__ == '__main__':
    print("--- Contoh Simulasi Integrasi Midtrans ---")

    print("\n1. Simulasi Inisiasi Deposit:")
    deposit_info = initiate_midtrans_deposit("user_deposit_001", 150000.0, "Deposit dana kampanye A")
    if deposit_info["success"]:
        print(f"   Deposit berhasil diinisiasi. ID Transaksi: {deposit_info['transaction_id']}")
        print(f"   URL Redirect/Snap Token: {deposit_info['redirect_url']}")
        # Di sini aplikasi akan mengarahkan pengguna atau menampilkan QR code, dll.
    else:
        print(f"   Gagal inisiasi deposit: {deposit_info['error_message']}")

    print("\n2. Simulasi Inisiasi Payout (Withdrawal):")
    # Detail ini biasanya didapat dari fungsi seperti process_promoter_withdrawal
    promoter_withdrawal_calc = {
        "user_id": "promotor_wd_002",
        "gross_amount": 200000.0,
        "platform_fee": 20000.0,
        "tax_deducted": 4000.0,
        "net_payout": 176000.0,
        "error": None
    }
    payout_info = initiate_midtrans_payout(
        user_id=promoter_withdrawal_calc["user_id"],
        net_amount=promoter_withdrawal_calc["net_payout"],
        withdrawal_details=promoter_withdrawal_calc
    )
    if payout_info["success"]:
        print(f"   Payout berhasil diinisiasi. ID Payout: {payout_info['payout_id']}")
        print(f"   Status: {payout_info['status']}")
    else:
        print(f"   Gagal inisiasi payout: {payout_info['error_message']}")

    print("\n3. Simulasi Pengecekan Status Transaksi (Deposit):")
    if deposit_info.get("transaction_id"):
        status_check = check_midtrans_transaction_status(deposit_info["transaction_id"])
        print(f"   Status transaksi {status_check['transaction_id']}: {status_check['transaction_status']}")
    else:
        print("   Tidak ada ID transaksi deposit untuk dicek.")

    print("\n4. Simulasi Deposit dengan jumlah tidak valid:")
    invalid_deposit_info = initiate_midtrans_deposit("user_deposit_002", 0, "Deposit dana nol")
    if not invalid_deposit_info["success"]:
        print(f"   Gagal inisiasi deposit (jumlah 0): {invalid_deposit_info['error_message']}")

    print("\n5. Simulasi Payout dengan jumlah tidak valid:")
    invalid_payout_info = initiate_midtrans_payout("promotor_wd_003", 0, {"net_payout": 0})
    if not invalid_payout_info["success"]:
        print(f"   Gagal inisiasi payout (jumlah 0): {invalid_payout_info['error_message']}")
