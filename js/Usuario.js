// =============================================
// Usuario.js — Classe principal do projeto
// Aqui mostramos o uso de POO: classe, atributos,
// métodos e instâncias de objetos
// =============================================

/**
 * CLASSE Usuario
 * 
 * Uma "classe" é como uma receita ou molde.
 * Ela descreve como um usuário deve ser, mas
 * não É um usuário ainda — só quando a gente
 * cria um objeto com "new Usuario()" é que
 * temos uma instância de verdade.
 */
class Usuario {

  // O constructor é chamado toda vez que criamos um novo usuário
  // "this" se refere ao próprio objeto criado
  constructor(nome, email, senha) {
    this.nome  = nome;   // atributo nome
    this.email = email;  // atributo email
    this.senha = senha;  // atributo senha
  }

  // ---- MÉTODOS ----
  // Métodos são funções que pertencem à classe

  /**
   * Verifica se a senha digitada bate com a do usuário
   * Retorna true (correto) ou false (errado)
   */
  verificarSenha(senhaDigitada) {
    return this.senha === senhaDigitada;
  }

  /**
   * Retorna um texto com os dados do usuário
   * (sem mostrar a senha por segurança)
   */
  apresentar() {
    return `Olá, meu nome é ${this.nome} e meu email é ${this.email}`;
  }
}


// =============================================
// GerenciadorDeUsuarios — controla o "banco de dados"
// temporário (salvo na memória do navegador - sessionStorage)
// =============================================

class GerenciadorDeUsuarios {

  constructor() {
    // Carrega os usuários salvos na sessão (ou começa vazio)
    this.usuarios = this._carregarUsuarios();

    // Adiciona o usuário admin fixo se ainda não existir
    if (!this._buscarPorEmail('admin123')) {
      const admin = new Usuario('Administrador', 'admin123', 'admin123');
      this.usuarios.push(admin);
      this._salvarUsuarios();
    }
  }

  /**
   * Cadastra um novo usuário
   * Retorna um objeto com { sucesso: true/false, mensagem: '...' }
   */
  cadastrar(nome, email, senha, confirmarSenha) {

    // Validação 1: todos os campos precisam estar preenchidos
    if (!nome || !email || !senha || !confirmarSenha) {
      return { sucesso: false, mensagem: 'Preencha todos os campos!' };
    }

    // Validação 2: senha precisa ter pelo menos 6 caracteres
    if (senha.length < 6) {
      return { sucesso: false, mensagem: 'A senha precisa ter no mínimo 6 caracteres.' };
    }

    // Validação 3: as senhas precisam ser iguais
    if (senha !== confirmarSenha) {
      return { sucesso: false, mensagem: 'As senhas não coincidem!' };
    }

    // Validação 4: o email não pode já estar cadastrado
    if (this._buscarPorEmail(email)) {
      return { sucesso: false, mensagem: 'Esse email já está cadastrado.' };
    }

    // Tudo certo! Cria uma instância (objeto) da classe Usuario
    const novoUsuario = new Usuario(nome, email, senha);

    // Adiciona na lista e salva
    this.usuarios.push(novoUsuario);
    this._salvarUsuarios();

    return { sucesso: true, mensagem: `Conta criada com sucesso! Bem-vindo(a), ${nome}!` };
  }

  /**
   * Faz login com email e senha
   * Retorna o usuário se encontrado, ou null se não encontrado
   */
  login(email, senha) {
    const usuario = this._buscarPorEmail(email);

    // Verifica se o usuário existe e se a senha está correta
    if (usuario && usuario.verificarSenha(senha)) {
      return usuario;
    }

    return null; // login inválido
  }

  /**
   * Método privado (convenção: começa com _)
   * Busca um usuário pelo email na lista
   */
  _buscarPorEmail(email) {
    return this.usuarios.find(u => u.email === email) || null;
  }

  /**
   * Salva a lista de usuários na sessionStorage
   * (os dados somem quando fecha o navegador)
   */
  _salvarUsuarios() {
    sessionStorage.setItem('usuarios', JSON.stringify(this.usuarios));
  }

  /**
   * Carrega os usuários da sessionStorage
   * Se não tiver nada, retorna um array vazio
   */
  _carregarUsuarios() {
    const dados = sessionStorage.getItem('usuarios');
    if (!dados) return [];

    // Reconstrói os objetos Usuario a partir do JSON salvo
    const lista = JSON.parse(dados);
    return lista.map(u => new Usuario(u.nome, u.email, u.senha));
  }
}

// Cria UMA instância do gerenciador e disponibiliza globalmente
// Assim todas as páginas usam o mesmo gerenciador
const gerenciador = new GerenciadorDeUsuarios();
