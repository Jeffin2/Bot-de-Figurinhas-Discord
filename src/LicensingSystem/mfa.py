import customtkinter as ctk
import random

ctk.set_appearance_mode("dark")

app = ctk.CTk()
app.title("Discord MFA")
app.geometry("400x250")
app.resizable(False, False)

codigo_atual = ""


def gerar_codigo():
    global codigo_atual

    codigo_atual = str(random.randint(10000000, 99999999))

    label_codigo.configure(text=codigo_atual)

    with open("mfa_code.txt", "w") as arquivo:
        arquivo.write(codigo_atual)

titulo = ctk.CTkLabel(
    app,
    text="Código de Acesso",
    font=("Arial", 24)
)
titulo.pack(pady=20)

label_codigo = ctk.CTkLabel(
    app,
    text="Clique em Gerar",
    font=("Arial", 32, "bold")
)
label_codigo.pack(pady=10)

btn_gerar = ctk.CTkButton(
    app,
    text="Gerar Novo Código",
    command=gerar_codigo
)
btn_gerar.pack(pady=10)

app.mainloop()