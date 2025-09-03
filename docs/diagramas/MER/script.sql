-- No DBeaver executar unicamente esse comando e alterar o banco de dados selecionado
create database glitch;

-- Cria um schema diferente do padrão
create schema glitch;

-- Pessoa e endereço
create table glitch.paises(
	id uuid not null primary key,
	nome varchar(30) not null,
	ddd varchar(3)
);

create table glitch.estados(
	id uuid not null primary key,
	nome varchar(30) not null,
	pais_id uuid not null,
	constraint fk_pais_estado foreign key (pais_id) references paises(id),
);

create table glitch.cidades(
	id uuid not null primary key,
	nome varchar(40) not null,
	ddd varchar(3),
	estado_id uuid not null,
	constraint fk_estado_cidade foreign key (estado_id) references estados(id)
);

create table glitch.enderecos(
	id uuid not null primary key,
	logradouro varchar(50) not null,
	numero varchar(6),
	complemento varchar(30),
	cep varchar(8) not null,
	cidade_id uuid not null,
	constraint fk_cidade_endereco foreign key (cidade_id) references cidades(id)
);

create table glitch.tipos_documento_pessoa(
	id uuid not null primary key,
	nome varchar(20),
	tamanho smallint,
	is_obrigatorio boolean default false,
	pais_id uuid,
	constraint fk_pais_tipo_documento foreign key (pais_id) references paises(id)
);

create table glitch.pessoas(
	id uuid not null primary key,
	nome varchar(30) not null,
	sobrenome varchar(30) not null,
	ativo boolean default true,
	dt_nascimento date not null,
	endereco_id uuid not null,
	constraint fk_endereco_pessoa foreign key (endereco_id) references enderecos(id)
);

create table glitch.documentos_pessoa(
	id uuid not null primary key,
	valor varchar(100),
	tipo_documento_id uuid not null,
	pessoa_id uuid not null,
	constraint fk_tipo_documento_pessoa foreign key (tipo_documento_id) references tipos_documento_pessoa(id),
	constraint fk_pessoa_documento foreign key (pessoa_id) references pessoas(id)
);

create table tipos_usuario(
	id uuid not null primery key,
	descricao varchar(15) not null,
	is_admin boolean default false
);

create table usuarios(
	id uuid not null primary key,
	nickname varchar(20) not null unique, -- Manter nickname e login? Ou só um dos dois?
	login varchar(15) not null unique,
	senha varchar(100) not null,
	ativo boolean default true,
	tipo_usuario_id uuid not null,		-- O usuário pode ter mais de um tipo ao mesmo tempo? Jogador e Organizador? Um Admin pode ser Jogador por ex?
	pessoa_id uuid not null,
	ultima_alteracao_senha timestamptz,
	ultimo_login timestamptz,
	dt_criacao timestamptz default current_timestamp,
	avatar varchar(100),
	max_eventos smallint not null default 1,
	constraint fk_tipo_usuario foreign key (tipo_usuario_id) references tipos_usuario(id),
	constraint fk_pessoa_usuario foreign key (pessoa_id) references pessoas(id)
);

-- Eqiuipes e de jogo

create table equipes(
	id uuid not null primary key,
	nome varchar(15) not null,
	avatar varchar(100),
	dt_criacao timestamptz not null default current_timestamp,
	qtd_integrantes smallint not null default 0,
);

create table tipos_jogado(
	id uuid not null primary key,
	descricao varchar(15) not null,
);

create table membros_equipe(
	equipe_id uuid not null,
	usuario_id uuid not null,
	tipo_jogador_id uuid not null,
	dt_entrada timestamptz,
	is_lider boolean default false,
	is_titular boolean default true,
	is_ativo boolean default true,
	dt_convidado not null default current_timestamp,
	primary key (equipe_id,usuario_id),
	constraint fk_equipe_membro foreign key (equipe_id) references equipes(id),
	constraint fk_usuario_membro foreign key (usuario_id) references usuarios(id)
);

-- Empresa

create table empresas(
	id uuid not null primary key,
	nome_oficial varchar(50) not null,
	apelido varchar(40),
	endereco_id uuid not null,
	logo varhcar(100),
);

--Alterações para as empresas possuirem mais de um documento ou empresas estrangeiras que não possuem CNPJ

create table glitch.tipos_documento_empresa(
	id uuid not null primary key,
	nome varchar(20),
	tamanho smallint,
	is_obrigatorio boolean default false,
	pais_id uuid,
	constraint fk_pais_tipo_documento foreign key (pais_id) references paises(id)
);

create table documento_empresa(
	id uuid not null primary key,
	valor varchar(100),
	tipo_documento_id uuid not null,
	empresa_id uuid not null,
	constraint fk_tipo_documento_pessoa foreign key (tipo_documento_id) references tipos_documento_empresa(id),
	constraint fk_empresa_documento foreign key (empresa_id) references empresas(id)
);

-- Mensagens e notificações

create table mensagens(
	id uuid not null primary key,
	usuario_origem_id uuid not null,
	usuario_destino_id uuid not null,
	mensagem text not null,
	is_alerta boolean not null default false,
	dt_enviado timestamptz not null default current_timestamp,
	dt_recebido timestamptz,
	dt_lido timestamptz,
	constraint fk_usuario_origem_msg foreign key (usuario_origem_id) references usuarios(id) on delete cascade on update cascade,
	constraint fk_usuario_destino_msg foreign key (usuario_destino_id) references usuario(id) on delete cascade on update cascade
);

create table configs_notificacao(
	id uuid not null primary key,
	is_mostravel boolean not null default true,
	is_mutado boolean not null default false,
	usuario_id uuid not null,
	constraint fk_usuario_config_notif foreign key (usuario_id) references usuarios(id) on delete cascade on update cascade
);

create table notificacoes(
	id uuid not null primary key,
	usuario_id uuid not null,
	texto varchar(100) not null,
	dt_enviado timestamptz not null defult current_timestamp,
	dt_lido timestamptz not null,
	
	
);














