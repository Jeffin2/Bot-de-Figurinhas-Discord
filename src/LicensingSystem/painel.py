import customtkinter as ctk
from tkinter import messagebox
import random

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ==========================
# CONFIGURAÇÕES
# ==========================

USUARIO = "admin"
SENHA = "123456"

licencas = []

# ==========================
# FUNÇÕES DO PAINEL
# ==========================

def gerar_licenca():

    chave = f"DLC-{random.randint(1000,9999)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}"

    licencas.append(chave)

    lista_licencas.insert("end", chave)

def abrir_painel():

    app.withdraw()

    painel = ctk.CTkToplevel()

    painel.title("Discord Licensing Panel")
    painel.geometry("800x500")

    titulo = ctk.CTkLabel(
        painel,
        text="Discord Licensing Panel",
        font=("Arial", 30, "bold")
    )
    titulo.pack(pady=20)

    frame = ctk.CTkFrame(painel)
    frame.pack(fill="both", expand=True, padx=20, pady=20)

    global lista_licencas

    lista_licencas = ctk.CTkTextbox(
        frame,
        width=500,
        height=300
    )
    lista_licencas.pack(side="left", padx=20, pady=20)

    botoes = ctk.CTkFrame(frame)
    botoes.pack(side="right", fill="y", padx=20)

    btn_criar = ctk.CTkButton(
        botoes,
        text="Criar Licença",
        command=gerar_licenca,
        width=180
    )
    btn_criar.pack(pady=10)

    btn_revogar = ctk.CTkButton(
        botoes,
        text="Revogar Licença",
        width=180
    )
    btn_revogar.pack(pady=10)

    btn_servidores = ctk.CTkButton(
        botoes,
        text="Ver Servidores",
        width=180
    )
    btn_servidores.pack(pady=10)

    btn_config = ctk.CTkButton(
        botoes,
        text="Configurações",
        width=180
    )
    btn_config.pack(pady=10)

# ==========================
# LOGIN
# ==========================

def login():

    usuario = entry_usuario.get()
    senha = entry_senha.get()
    codigo = entry_mfa.get()

    try:
        with open("mfa_code.txt", "r") as arquivo:
            codigo_correto = arquivo.read().strip()

    except:

        messagebox.showerror(
            "Erro",
            "Arquivo mfa_code.txt não encontrado."
        )
        return

    if usuario != USUARIO:

        messagebox.showerror(
            "Erro",
            "Usuário inválido."
        )
        return

    if senha != SENHA:

        messagebox.showerror(
            "Erro",
            "Senha inválida."
        )
        return

    if codigo != codigo_correto:

        messagebox.showerror(
            "Erro",
            "Código MFA inválido."
        )
        return

    abrir_painel()

# ==========================
# JANELA LOGIN
# ==========================

app = ctk.CTk()

app.title("Discord Licensing Login")
app.geometry("450x400")
app.resizable(False, False)

titulo = ctk.CTkLabel(
    app,
    text="Discord Licensing",
    font=("Arial", 30, "bold")
)
titulo.pack(pady=30)

entry_usuario = ctk.CTkEntry(
    app,
    placeholder_text="Usuário",
    width=250
)
entry_usuario.pack(pady=10)

entry_senha = ctk.CTkEntry(
    app,
    placeholder_text="Senha",
    show="*",
    width=250
)
entry_senha.pack(pady=10)

entry_mfa = ctk.CTkEntry(
    app,
    placeholder_text="Código MFA",
    width=250
)
entry_mfa.pack(pady=10)

btn_login = ctk.CTkButton(
    app,
    text="Entrar",
    command=login,
    width=250
)
btn_login.pack(pady=25)

app.mainloop()