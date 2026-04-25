#!/usr/bin/env python3
"""Deploy dist/ to Hostinger via FTP"""
import os
import sys
from ftplib import FTP

FTP_HOST = "185.212.70.250"
FTP_USER = "u846064658.mejoraok.com"
FTP_PASS = "T@beg2301"
REMOTE_DIR = "/public_html/app"
LOCAL_DIR = "dist"

def upload_dir(ftp, local_dir, remote_dir):
    """Recursively upload directory"""
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isdir(local_path):
            try:
                ftp.mkd(remote_path)
            except:
                pass
            upload_dir(ftp, local_path, remote_path)
        else:
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)
            print(f"  ✓ {remote_path}")

def main():
    print("Connecting to FTP...")
    ftp = FTP()
    ftp.connect(FTP_HOST, 21, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)  # Force passive mode
    print(f"Connected: {ftp.getwelcome()}")
    
    # Clean remote directory (except .htaccess and special files)
    print(f"\nCleaning {REMOTE_DIR}...")
    try:
        files = ftp.nlst(REMOTE_DIR)
        for f in files:
            basename = os.path.basename(f)
            if basename not in ('.htaccess', '.', '..'):
                try:
                    ftp.delete(f)
                    print(f"  ✗ Deleted {basename}")
                except:
                    try:
                        ftp.rmd(f)
                        print(f"  ✗ Deleted dir {basename}")
                    except:
                        pass
    except:
        pass
    
    # Upload dist/
    print(f"\nUploading {LOCAL_DIR}/ → {REMOTE_DIR}/")
    upload_dir(ftp, LOCAL_DIR, REMOTE_DIR)
    
    ftp.quit()
    print("\n✅ Deploy complete!")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
