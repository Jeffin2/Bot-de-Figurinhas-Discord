import customtkinter as ctk
from tkinter import messagebox
import random
import sqlite3
import os
import json
import sys

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ==========================
# BASE PATH (FUNCIONA EM .PY E .EXE)
# ==========================

if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)  # quando vira .exe
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # modo dev

# ==========================
# CONFIGURAÇÕES
# ==========================

USUARIO = "JeffinPVP"
SENHA = "Jeffin_PVP"

DB_DIR = os.path.join(BASE_DIR, "database")
os.makedirs(DB_DIR, exist_ok=True)

DB_PATH = os.path.join(DB_DIR, "licenses.db")

MFA_PATH = os.path.join(BASE_DIR, "mfa_code.txt")
SERVERS_PATH = os.path.join(BASE_DIR, "servers.json")

# ==========================
# BANCO
# ==========================

def criar_banco():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS licenses(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key TEXT UNIQUE,
        active INTEGER DEFAULT 1,
        guild_id TEXT,
        owner_email TEXT,
        activated_at TEXT
    )
    """)

    conn.commit()
    conn.close()

criar_banco()

# ==========================
# FUNÇÕES
# ==========================

def atualizar_lista():
    lista_licencas.delete("1.0", "end")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, license_key, active FROM licenses")
    resultados = cursor.fetchall()
    conn.close()

    for item in resultados:
        status = "ATIVA" if item[2] == 1 else "REVOGADA"
        lista_licencas.insert("end", f"[{item[0]}] {item[1]} - {status}\n")


def gerar_licenca():
    chave = f"DLC-{random.randint(1000,9999)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}"

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("INSERT INTO licenses(license_key) VALUES(?)", (chave,))

    conn.commit()
    conn.close()

    atualizar_lista()


def revogar_licenca():
    try:
        id_licenca = int(entry_id.get())
    except:
        messagebox.showerror("Erro", "Digite um ID válido.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("UPDATE licenses SET active = 0 WHERE id = ?", (id_licenca,))

    conn.commit()
    conn.close()

    atualizar_lista()
    messagebox.showinfo("Sucesso", "Licença revogada.")


def ver_servidores():
    janela = ctk.CTkToplevel()
    janela.title("Servidores")
    janela.geometry("700x500")

    texto = ctk.CTkTextbox(janela, width=600, height=350)
    texto.pack(pady=10)

    texto.delete("1.0", "end")

    try:
        with open(SERVERS_PATH, "r", encoding="utf-8") as f:
            servidores = json.load(f)

        for s in servidores:
            texto.insert("end",
                f"Nome: {s['nome']}\n"
                f"ID: {s['id']}\n"
                f"Membros: {s['membros']}\n"
                f"{'='*40}\n\n"
            )

    except FileNotFoundError:
        texto.insert("end", "servers.json não encontrado.\nInicie o bot primeiro.")


def abrir_painel():
    app.withdraw()

    painel = ctk.CTkToplevel()
    painel.title("Discord Licensing Panel")
    painel.geometry("900x550")

    global lista_licencas, entry_id

    lista_licencas = ctk.CTkTextbox(painel, width=500, height=350)
    lista_licencas.pack(side="left", padx=20, pady=20)

    frame = ctk.CTkFrame(painel)
    frame.pack(side="right", padx=20, pady=20)

    ctk.CTkButton(frame, text="Criar Licença", command=gerar_licenca).pack(pady=10)

    entry_id = ctk.CTkEntry(frame, placeholder_text="ID da licença")
    entry_id.pack(pady=10)

    ctk.CTkButton(frame, text="Revogar Licença", command=revogar_licenca).pack(pady=10)
    ctk.CTkButton(frame, text="Ver Servidores", command=ver_servidores).pack(pady=10)

    atualizar_lista()


# ==========================
# LOGIN
# ==========================

def login():
    usuario = entry_usuario.get()
    senha = entry_senha.get()
    codigo = entry_mfa.get()

    try:
        with open(MFA_PATH, "r") as f:
            codigo_correto = f.read().strip()
    except:
        messagebox.showerror("Erro", "mfa_code.txt não encontrado.")
        return

    if usuario != USUARIO:
        messagebox.showerror("Erro", "Usuário inválido.")
        return

    if senha != SENHA:
        messagebox.showerror("Erro", "Senha inválida.")
        return

    if codigo != codigo_correto:
        messagebox.showerror("Erro", "Código MFA inválido.")
        return

    abrir_painel()


# ==========================
# UI LOGIN
# ==========================

app = ctk.CTk()
app.title("Discord Licensing Login")
app.geometry("450x400")

ctk.CTkLabel(app, text="Discord Licensing", font=("Arial", 30, "bold")).pack(pady=30)

entry_usuario = ctk.CTkEntry(app, placeholder_text="Usuário")
entry_usuario.pack(pady=10)

entry_senha = ctk.CTkEntry(app, placeholder_text="Senha", show="*")
entry_senha.pack(pady=10)

entry_mfa = ctk.CTkEntry(app, placeholder_text="Código MFA")
entry_mfa.pack(pady=10)

ctk.CTkButton(app, text="Entrar", command=login).pack(pady=25)

app.mainloop()