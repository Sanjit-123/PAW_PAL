import sqlite3

def upgrade():
    conn = sqlite3.connect('pawpal.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE chat_messages ADD COLUMN action VARCHAR")
        cursor.execute("ALTER TABLE chat_messages ADD COLUMN expression VARCHAR")
        print("Columns added successfully.")
    except Exception as e:
        print(f"Error (might already exist): {e}")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    upgrade()
