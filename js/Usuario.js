// Usuario.js
// Aqui ficam as classes usadas no login e no cadastro.

/**
 * Classe Usuario
 *
 * Essa classe funciona como um molde para criar usuários.
 * Cada usuário criado vai ter nome, email e senha.
 */
class Usuario {

	// O constructor roda quando um novo usuário é criado.
	// O this representa o próprio usuário que acabou de nascer.
	constructor(nome, email, senha) {
		this.nome  = nome;   // atributo nome
		this.email = email;  // atributo email
		this.senha = senha;  // atributo senha
	}

	// Métodos são ações que o objeto consegue fazer.

	/**
	 * Confere se a senha digitada é igual à senha salva no usuário.
	 */
	verificarSenha(senhaDigitada) {
		return this.senha === senhaDigitada;
	}

	/**
	 * Retorna uma apresentação simples do usuário, sem mostrar a senha.
	 */
	apresentar() {
		return `Olá, meu nome é ${this.nome} e meu email é ${this.email}`;
	}
}

// GerenciadorDeUsuarios
// Essa classe cuida da lista de usuários salva no navegador.

class GerenciadorDeUsuarios {

	constructor() {
		// Pega os usuários salvos. Se não tiver ninguém, começa com uma lista vazia.
		this.usuarios = this._carregarUsuarios();

		// Cria um usuário admin para facilitar o teste do projeto.
		if (!this._buscarPorEmail('admin123')) {
			const admin = new Usuario('Administrador', 'admin123', 'admin123');
			this.usuarios.push(admin);
			this._salvarUsuarios();
		}
	}

	/**
	 * Cadastra um usuário novo e retorna uma mensagem dizendo se deu certo ou não.
	 */
	cadastrar(nome, email, senha, confirmarSenha) {

		// Primeiro verifica se todos os campos foram preenchidos.
		if (!nome || !email || !senha || !confirmarSenha) {
			return { sucesso: false, mensagem: 'Preencha todos os campos!' };
		}

		// A senha precisa ter um tamanho mínimo.
		if (senha.length < 6) {
			return { sucesso: false, mensagem: 'A senha precisa ter no mínimo 6 caracteres.' };
		}

		// As duas senhas digitadas precisam ser iguais.
		if (senha !== confirmarSenha) {
			return { sucesso: false, mensagem: 'As senhas não coincidem!' };
		}

		// Não deixa cadastrar dois usuários com o mesmo email.
		if (this._buscarPorEmail(email)) {
			return { sucesso: false, mensagem: 'Esse email já está cadastrado.' };
		}

		// Se passou por todas as validações, cria o objeto Usuario.
		const novoUsuario = new Usuario(nome, email, senha);

		// Coloca o usuário na lista e salva no navegador.
		this.usuarios.push(novoUsuario);
		this._salvarUsuarios();

		return { sucesso: true, mensagem: `Conta criada com sucesso! Bem-vindo(a), ${nome}!` };
	}

	/**
	 * Tenta fazer login usando email e senha.
	 */
	login(email, senha) {
		const usuario = this._buscarPorEmail(email);

		// Confere se o usuário existe e se a senha bate.
		if (usuario && usuario.verificarSenha(senha)) {
			return usuario;
		}

		return null; // se chegou aqui, o login deu errado
	}

	/**
	 * Procura um usuário pelo email.
	 * O underline indica que é um método interno da classe.
	 */
	_buscarPorEmail(email) {
		return this.usuarios.find(u => u.email === email) || null;
	}

	/**
	 * Salva os usuários na sessionStorage.
	 * Nesse projeto, os dados ficam salvos só durante a sessão do navegador.
	 */
	_salvarUsuarios() {
		sessionStorage.setItem('usuarios', JSON.stringify(this.usuarios));
	}

	/**
	 * Carrega os usuários salvos e transforma de volta em objetos da classe Usuario.
	 */
	_carregarUsuarios() {
		const dados = sessionStorage.getItem('usuarios');
		if (!dados) return [];

		// O JSON não guarda métodos, então recrio os usuários com new Usuario().
		const lista = JSON.parse(dados);
		return lista.map(u => new Usuario(u.nome, u.email, u.senha));
	}
}

// Instância principal do gerenciador.
// As outras partes do projeto usam essa variável.
const gerenciador = new GerenciadorDeUsuarios();
