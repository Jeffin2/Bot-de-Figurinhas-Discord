import customtkinter as ctk
from tkinter import messagebox
import random
import sqlite3
import os
import json

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ==========================
# CONFIGURAÇÕES
# ==========================

USUARIO = "admin"
SENHA = "123456"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_DIR = os.path.join(BASE_DIR, "database")
os.makedirs(DB_DIR, exist_ok=True)

DB_PATH = os.path.join(DB_DIR, "licenses.db")

MFA_PATH = os.path.join(BASE_DIR, "mfa_code.txt")

# ✅ FIX IMPORTANTE (faltava isso)
SERVERS_PATH = os.path.join(BASE_DIR, "servers.json")

# ==========================
# BANCO DE DADOS
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

    print("Banco criado com sucesso")

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

        status = "ATIVA"
        if item[2] == 0:
            status = "REVOGADA"

        lista_licencas.insert(
            "end",
            f"[{item[0]}] {item[1]} - {status}\n"
        )

def gerar_licenca():

    chave = (
        f"DLC-"
        f"{random.randint(1000,9999)}-"
        f"{random.randint(1000,9999)}-"
        f"{random.randint(1000,9999)}"
    )

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO licenses(license_key) VALUES(?)",
        (chave,)
    )

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

    cursor.execute("""
        UPDATE licenses
        SET active = 0
        WHERE id = ?
    """, (id_licenca,))

    conn.commit()
    conn.close()

    atualizar_lista()

    messagebox.showinfo("Sucesso", "Licença revogada.")

def abrir_configuracoes():

    janela = ctk.CTkToplevel()
    janela.title("Configurações")
    janela.geometry("400x300")

    ctk.CTkLabel(
        janela,
        text="Configurações",
        font=("Arial", 24, "bold")
    ).pack(pady=20)

def ver_servidores():

    janela = ctk.CTkToplevel()
    janela.title("Servidores")
    janela.geometry("700x500")

    ctk.CTkLabel(
        janela,
        text="Servidores do Bot",
        font=("Arial", 24, "bold")
    ).pack(pady=20)

    texto = ctk.CTkTextbox(janela, width=600, height=350)
    texto.pack(pady=10)

    # ✅ FIX: limpar antes de usar
    texto.delete("1.0", "end")

    try:

        with open(SERVERS_PATH, "r", encoding="utf-8") as arquivo:
            servidores = json.load(arquivo)

        for servidor in servidores:

            texto.insert(
                "end",
                f"Nome: {servidor['nome']}\n"
                f"ID: {servidor['id']}\n"
                f"Membros: {servidor['membros']}\n"
                f"{'='*50}\n\n"
            )

    except FileNotFoundError:

        texto.insert("end", "servers.json não encontrado.\nInicie o bot primeiro.")

    except Exception as erro:

        texto.insert("end", f"Erro:\n{erro}")

# ==========================
# PAINEL
# ==========================

def abrir_painel():

    app.withdraw()

    painel = ctk.CTkToplevel()
    painel.title("Discord Licensing Panel")
    painel.geometry("900x550")

    ctk.CTkLabel(
        painel,
        text="Discord Licensing Panel",
        font=("Arial", 30, "bold")
    ).pack(pady=20)

    frame = ctk.CTkFrame(painel)
    frame.pack(fill="both", expand=True, padx=20, pady=20)

    global lista_licencas, entry_id

    lista_licencas = ctk.CTkTextbox(frame, width=550, height=350)
    lista_licencas.pack(side="left", padx=20, pady=20)

    botoes = ctk.CTkFrame(frame)
    botoes.pack(side="right", fill="y", padx=20)

    ctk.CTkButton(
        botoes,
        text="Criar Licença",
        command=gerar_licenca,
        width=180
    ).pack(pady=10)

    entry_id = ctk.CTkEntry(
        botoes,
        placeholder_text="ID da licença",
        width=180
    )
    entry_id.pack(pady=10)

    ctk.CTkButton(
        botoes,
        text="Revogar Licença",
        command=revogar_licenca,
        width=180
    ).pack(pady=10)

    ctk.CTkButton(
        botoes,
        text="Ver Servidores",
        command=ver_servidores,
        width=180
    ).pack(pady=10)

    ctk.CTkButton(
        botoes,
        text="Configurações",
        command=abrir_configuracoes,
        width=180
    ).pack(pady=10)

    atualizar_lista()

# ==========================
# LOGIN
# ==========================

def login():

    usuario = entry_usuario.get()
    senha = entry_senha.get()
    codigo = entry_mfa.get()

    try:
        with open(MFA_PATH, "r") as arquivo:
            codigo_correto = arquivo.read().strip()
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
# LOGIN UI
# ==========================

app = ctk.CTk()
app.title("Discord Licensing Login")
app.geometry("450x400")
app.resizable(False, False)

ctk.CTkLabel(app, text="Discord Licensing", font=("Arial", 30, "bold")).pack(pady=30)

entry_usuario = ctk.CTkEntry(app, placeholder_text="Usuário", width=250)
entry_usuario.pack(pady=10)

entry_senha = ctk.CTkEntry(app, placeholder_text="Senha", show="*", width=250)
entry_senha.pack(pady=10)

entry_mfa = ctk.CTkEntry(app, placeholder_text="Código MFA", width=250)
entry_mfa.pack(pady=10)

ctk.CTkButton(app, text="Entrar", command=login, width=250).pack(pady=25)

app.mainloop()