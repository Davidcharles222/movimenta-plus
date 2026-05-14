/* =========================================
   CADASTRO DE USUÁRIO
========================================= */

function fazerCadastro() {
  const nome = document.getElementById("nomeCadastro").value.trim();
  const email = document.getElementById("emailCadastro").value.trim();
  const senha = document.getElementById("senhaCadastro").value.trim();

  const emailSalvo = localStorage.getItem("usuarioEmail");

  if (nome === "" || email === "" || senha === "") {
    alert("Preencha todos os campos.");
    return;
  }

  if (email === emailSalvo) {
    alert("Este e-mail já está cadastrado.");
    return;
  }

  localStorage.setItem("usuarioNome", nome);
  localStorage.setItem("usuarioEmail", email);
  localStorage.setItem("usuarioSenha", senha);

  localStorage.removeItem("series");
  localStorage.removeItem("exercicioAtual");
  localStorage.removeItem("fotoPerfil");

  alert("Cadastro realizado com sucesso!");

  window.location.href = "login.html";
}

/* =========================================
   LOGIN DE USUÁRIO
========================================= */

function fazerLogin() {
  const email = document.getElementById("emailLogin").value.trim();
  const senha = document.getElementById("senhaLogin").value.trim();

  const emailSalvo = localStorage.getItem("usuarioEmail");
  const senhaSalva = localStorage.getItem("usuarioSenha");

  if (email === emailSalvo && senha === senhaSalva) {
    localStorage.setItem("usuarioLogado", email);
    localStorage.setItem("tempoLogin", Date.now());

    window.location.href = "index.html";
  } else {
    alert("E-mail ou senha incorretos.");
  }
}

/* =========================================
   RECUPERAÇÃO DE SENHA
========================================= */

function recuperarSenha() {
  document.getElementById("recuperarCard").classList.add("ativo");
}

function fecharRecuperacao() {
  document.getElementById("recuperarCard").classList.remove("ativo");
}

function alterarSenhaRecuperacao() {
  const email = document.getElementById("emailRecuperar").value.trim();
  const novaSenha = document
    .getElementById("novaSenhaRecuperar")
    .value.trim();

  const emailSalvo = localStorage.getItem("usuarioEmail");

  if (email === "" || novaSenha === "") {
    alert("Preencha todos os campos.");
    return;
  }

  if (email !== emailSalvo) {
    alert("E-mail não encontrado.");
    return;
  }

  localStorage.setItem("usuarioSenha", novaSenha);

  document.getElementById("emailRecuperar").value = "";
  document.getElementById("novaSenhaRecuperar").value = "";

  fecharRecuperacao();

  alert("Senha alterada com sucesso 🔐");
}