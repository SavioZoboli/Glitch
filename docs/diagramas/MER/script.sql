---create database glitch;

CREATE SCHEMA IF NOT EXISTS glitch;

CREATE  TABLE glitch.acoes_partida ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(20)  NOT NULL  ,
	CONSTRAINT pk_acoes_partida PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.equipes ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(30)  NOT NULL  UNIQUE,
	CONSTRAINT pk_equipe PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.estudios_jogo ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(30)  NOT NULL  ,
	CONSTRAINT pk_estudio_jogo PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.generos_jogo ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(20)  NOT NULL  ,
	CONSTRAINT pk_tipo_jogo PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.jogos ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(30)  NOT NULL  ,
	classificacao_indicativa varchar DEFAULT 'Livre'   ,
	estudio_jogo_id      uuid  NOT NULL  ,
	CONSTRAINT pk_jogo PRIMARY KEY ( id ),
	CONSTRAINT fk_jogo_estudio_jogo FOREIGN KEY ( estudio_jogo_id ) REFERENCES glitch.estudios_jogo( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.link_generos_jogo ( 
	jogo_id              uuid  NOT NULL  ,
	genero_jogo_id       uuid  NOT NULL  ,
	CONSTRAINT pk_tipos_jogo PRIMARY KEY ( jogo_id, genero_jogo_id ),
	CONSTRAINT fk_tipos_jogo_tipo FOREIGN KEY ( genero_jogo_id ) REFERENCES glitch.generos_jogo( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_tipos_jogo_jogo FOREIGN KEY ( jogo_id ) REFERENCES glitch.jogos( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.metodos_visualizacao ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar  NOT NULL  ,
	CONSTRAINT pk_metodo_visualizacao PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.paises ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(25)  NOT NULL  ,
	ddd                  smallint    ,
	CONSTRAINT pk_end_pais PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.publico_torneio ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(20)  NOT NULL  ,
	CONSTRAINT pk_publico_torneio PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.situacoes_partida ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar  NOT NULL  ,
	CONSTRAINT pk_situacao_partida PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.tipos_documento_pessoa ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(20)  NOT NULL  ,
	tamanho              smallint  NOT NULL  ,
	is_obrigatorio       boolean DEFAULT false NOT NULL  ,
	pais_id              uuid    ,
	CONSTRAINT pk_tipos_documento_pessoa PRIMARY KEY ( id ),
	CONSTRAINT fk_tipos_documento_pessoa_null FOREIGN KEY ( pais_id ) REFERENCES glitch.paises( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.tipos_etapa_partida ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar  NOT NULL  ,
	CONSTRAINT pk_etapa_partida PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.tipos_formato_inscricao ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(20)  NOT NULL  ,
	CONSTRAINT pk_tipo_formato_inscricao PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.tipos_funcionario ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(20)  NOT NULL  ,
	is_admin             boolean DEFAULT false NOT NULL  ,
	CONSTRAINT pk_tipo_funcionario PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.tipos_jogador ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(20)  NOT NULL  ,
	CONSTRAINT pk_tipo_integrante PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.tipos_partida ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(20)  NOT NULL  ,
	CONSTRAINT pk_tipo_partida PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.tipos_torneio ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(20)  NOT NULL  ,
	CONSTRAINT pk_tipo_torneio PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.tipos_usuario ( 
	id                   uuid  NOT NULL  ,
	descricao            varchar(15)  NOT NULL  ,
	is_admin             boolean DEFAULT false NOT NULL  ,
	CONSTRAINT pk_regras_usuario PRIMARY KEY ( id )
 );

CREATE  TABLE glitch.estados ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(25)  NOT NULL  ,
	pais_id              uuid  NOT NULL  ,
	CONSTRAINT pk_end_estado PRIMARY KEY ( id ),
	CONSTRAINT fk_pais_estado FOREIGN KEY ( pais_id ) REFERENCES glitch.paises( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.cidades ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(25)  NOT NULL  ,
	ddd                  smallint    ,
	estado_id            uuid  NOT NULL  ,
	CONSTRAINT pk_end_cidade PRIMARY KEY ( id ),
	CONSTRAINT fk_estado_cidade FOREIGN KEY ( estado_id ) REFERENCES glitch.estados( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.enderecos ( 
	id                   uuid  NOT NULL  ,
	logradouro           varchar(30)  NOT NULL  ,
	numero               integer    ,
	complemento          varchar(20)    ,
	cidade_id            uuid  NOT NULL  ,
	cep                  varchar(8)  NOT NULL  ,
	CONSTRAINT pk_endereco PRIMARY KEY ( id ),
	CONSTRAINT fk_cidade_endereco FOREIGN KEY ( cidade_id ) REFERENCES glitch.cidades( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.pessoas ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(25)  NOT NULL  ,
	sobrenome            varchar(25)  NOT NULL  ,
	ativo                boolean DEFAULT true NOT NULL  ,
	endereco_id          uuid  NOT NULL  ,
	dt_nascimento        date  NOT NULL  ,
	CONSTRAINT pk_pessoa PRIMARY KEY ( id ),
	CONSTRAINT fk_pessoa_endereco FOREIGN KEY ( endereco_id ) REFERENCES glitch.enderecos( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.usuarios ( 
	id                   uuid  NOT NULL  ,
	login                varchar(20)  NOT NULL  ,
	senha                varchar(100)  NOT NULL  ,
	ativo                boolean DEFAULT true NOT NULL  ,
	tipo_usuario_id      uuid  NOT NULL  ,
	pessoa_id            uuid  NOT NULL  ,
	ultima_alteracao_senha timestamptz    ,
	ultimo_login         timestamptz    ,
	dt_criacao           timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	dt_alteracao         timestamptz    ,
	CONSTRAINT pk_usuario PRIMARY KEY ( id ),
	CONSTRAINT fk_tipo_usuario FOREIGN KEY ( tipo_usuario_id ) REFERENCES glitch.tipos_usuario( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_usuario_pessoa FOREIGN KEY ( pessoa_id ) REFERENCES glitch.pessoas( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.documentos_pessoa ( 
	id                   uuid  NOT NULL  ,
	valor                varchar(30)  NOT NULL  ,
	tipo_documento_id    uuid  NOT NULL  ,
	pessoa_id            uuid  NOT NULL  ,
	CONSTRAINT pk_documentos_pessoa PRIMARY KEY ( id ),
	CONSTRAINT fk_documentos_pessoa FOREIGN KEY ( tipo_documento_id ) REFERENCES glitch.tipos_documento_pessoa( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_documentos_pessoa_pessoas FOREIGN KEY ( pessoa_id ) REFERENCES glitch.pessoas( id ) ON DELETE CASCADE ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.empresas ( 
	id                   uuid  NOT NULL  ,
	razao_social         varchar(40)  NOT NULL  ,
	nome_fantasia        varchar(40)    ,
	cnpj                 varchar(12)  NOT NULL  ,
	endereco_id          uuid  NOT NULL  ,
	CONSTRAINT pk_empresa PRIMARY KEY ( id ),
	CONSTRAINT fk_empresa_endereco FOREIGN KEY ( endereco_id ) REFERENCES glitch.enderecos( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.funcionarios ( 
	id                   uuid  NOT NULL  ,
	usuario_id           uuid  NOT NULL  ,
	empresa_id           uuid  NOT NULL  ,
	tipo_funcionario_id  uuid  NOT NULL  ,
	CONSTRAINT pk_funcionario PRIMARY KEY ( id ),
	CONSTRAINT fk_funcionario_empresa FOREIGN KEY ( empresa_id ) REFERENCES glitch.empresas( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_funcionario_usuario FOREIGN KEY ( usuario_id ) REFERENCES glitch.usuarios( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_funcionario_tipo_funcionario FOREIGN KEY ( tipo_funcionario_id ) REFERENCES glitch.tipos_funcionario( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.membros_equipe ( 
	equipe_id            uuid  NOT NULL  ,
	tipo_integrante_id   uuid  NOT NULL  ,
	usuario_id           uuid  NOT NULL  ,
	dt_entrada           timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	is_lider             boolean DEFAULT false NOT NULL  ,
	is_titular           boolean DEFAULT true NOT NULL  ,
	is_ativo             boolean DEFAULT true NOT NULL  ,
	convite_pendente     boolean DEFAULT true NOT NULL  ,
	CONSTRAINT pk_integrante_equipe PRIMARY KEY ( equipe_id, usuario_id ),
	CONSTRAINT fk_id_equipe FOREIGN KEY ( equipe_id ) REFERENCES glitch.equipes( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_id_usuario FOREIGN KEY ( usuario_id ) REFERENCES glitch.usuarios( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_integrante_equipe_tipo_integrante FOREIGN KEY ( tipo_integrante_id ) REFERENCES glitch.tipos_jogador( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.torneios ( 
	id                   uuid  NOT NULL  ,
	nome                 varchar(30)  NOT NULL  ,
	descricao            text    ,
	dt_inicio            timestamptz  NOT NULL  ,
	dt_fim               timestamptz  NOT NULL  ,
	tipo_torneio_id      uuid  NOT NULL  ,
	endereco_id          uuid    ,
	jogo_id              uuid  NOT NULL  ,
	publico_alvo_id      uuid  NOT NULL  ,
	usuario_responsavel_id uuid  NOT NULL  ,
	empresa_responsavel_id uuid    ,
	CONSTRAINT pk_torneio PRIMARY KEY ( id ),
	CONSTRAINT fk_torneio_tipo_torneio FOREIGN KEY ( tipo_torneio_id ) REFERENCES glitch.tipos_torneio( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_torneio_endereco FOREIGN KEY ( endereco_id ) REFERENCES glitch.enderecos( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_torneio_jogo FOREIGN KEY ( jogo_id ) REFERENCES glitch.jogos( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_torneio_publico_alvo FOREIGN KEY ( publico_alvo_id ) REFERENCES glitch.publico_torneio( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_torneios_usuarios FOREIGN KEY ( usuario_responsavel_id ) REFERENCES glitch.usuarios( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_torneios_empresas FOREIGN KEY ( empresa_responsavel_id ) REFERENCES glitch.empresas( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.configs_inscricao_torneio ( 
	id                   uuid  NOT NULL  ,
	dt_inicio            timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	dt_fim               timestamptz  NOT NULL  ,
	tipo_formato_id      uuid  NOT NULL  ,
	torneio_id           uuid  NOT NULL  ,
	valor                money DEFAULT 0 NOT NULL  ,
	CONSTRAINT pk_config_inscricao_torneio PRIMARY KEY ( id ),
	CONSTRAINT fk_config_inscricao_torneio_tipo_formato_inscricao FOREIGN KEY ( tipo_formato_id ) REFERENCES glitch.tipos_formato_inscricao( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_config_inscricao_torneio_torneio FOREIGN KEY ( torneio_id ) REFERENCES glitch.torneios( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.configs_partida ( 
	id                   uuid  NOT NULL  ,
	tempo_maximo         integer  NOT NULL  ,
	qtd_partidas         integer  NOT NULL  ,
	tipo_partida_id      uuid  NOT NULL  ,
	torneio_id           uuid  NOT NULL  ,
	metodo_visualizacao_id uuid  NOT NULL  ,
	CONSTRAINT pk_config_partida PRIMARY KEY ( id ),
	CONSTRAINT fk_config_partida_tipo_partida FOREIGN KEY ( tipo_partida_id ) REFERENCES glitch.tipos_partida( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_config_partida_torneio FOREIGN KEY ( torneio_id ) REFERENCES glitch.torneios( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_configs_partida FOREIGN KEY ( metodo_visualizacao_id ) REFERENCES glitch.metodos_visualizacao( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.etapas_partida ( 
	id                   uuid  NOT NULL  ,
	ordem                integer DEFAULT 0 NOT NULL  ,
	torneio_id           uuid  NOT NULL  ,
	tipo_etapa_id        uuid  NOT NULL  ,
	CONSTRAINT pk_etapas_partida PRIMARY KEY ( id ),
	CONSTRAINT fk_etapas_partida_torneio FOREIGN KEY ( torneio_id ) REFERENCES glitch.torneios( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_etapas_partida_tipo FOREIGN KEY ( tipo_etapa_id ) REFERENCES glitch.tipos_etapa_partida( id )   
 );

CREATE  TABLE glitch.favoritos ( 
	id                   uuid  NOT NULL  ,
	usuario_id           uuid  NOT NULL  ,
	torneio_id           uuid  NOT NULL  ,
	dt_favoritado        timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	CONSTRAINT pk_favoritos PRIMARY KEY ( id ),
	CONSTRAINT fk_torneios_favoritos_torneios FOREIGN KEY ( torneio_id) REFERENCES glitch.torneios( id ) ON DELETE CASCADE ON UPDATE CASCADE ,
	CONSTRAINT fk_torneios_favoritos_usuarios FOREIGN KEY ( usuario_id) REFERENCES glitch.usuarios( id ) ON DELETE CASCADE ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.participantes ( 
	id                   uuid  NOT NULL  ,
	dt_inscricao         timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	ativo                boolean DEFAULT true NOT NULL  ,
	equipe_id            uuid    ,
	usuario_id           uuid    ,
	torneio_id           uuid  NOT NULL  ,
	CONSTRAINT pk_participantes PRIMARY KEY ( id ),
	CONSTRAINT fk_participantes_equipes FOREIGN KEY ( equipe_id ) REFERENCES glitch.equipes( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_participantes_usuarios FOREIGN KEY ( usuario_id ) REFERENCES glitch.usuarios( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_participantes_acoes_partida FOREIGN KEY ( torneio_id ) REFERENCES glitch.torneios( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.partidas ( 
	id                   uuid  NOT NULL  ,
	dt_inicio            timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	dt_fim               timestamptz    ,
	situacao_id          uuid  NOT NULL  ,
	etapa_id             uuid  NOT NULL  ,
	CONSTRAINT pk_partida PRIMARY KEY ( id ),
	CONSTRAINT fk_partida_situacao_partida FOREIGN KEY ( situacao_id ) REFERENCES glitch.situacoes_partida( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_partidas_etapas_partida FOREIGN KEY ( etapa_id ) REFERENCES glitch.etapas_partida( id )   
 );

CREATE  TABLE glitch.premios_torneio ( 
	id                   uuid  NOT NULL  ,
	colocacao            smallint  NOT NULL  ,
	valor                money  NOT NULL  ,
	torneio_id           uuid  NOT NULL  ,
	CONSTRAINT pk_premio_torneio PRIMARY KEY ( id ),
	CONSTRAINT fk_premio_torneio FOREIGN KEY ( torneio_id ) REFERENCES glitch.torneios( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.acompanhamentos ( 
	id                   uuid  NOT NULL  ,
	usuario_id           uuid  NOT NULL  ,
	torneio_id           uuid  NOT NULL  ,
	partida_id           uuid    ,
	dt_acompanhado       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	CONSTRAINT pk_agendas PRIMARY KEY ( id ),
	CONSTRAINT fk_agendas_usuarios FOREIGN KEY ( usuario_id ) REFERENCES glitch.usuarios( id ) ON DELETE CASCADE ON UPDATE CASCADE ,
	CONSTRAINT fk_agendas_torneios FOREIGN KEY ( torneio_id ) REFERENCES glitch.torneios( id ) ON DELETE CASCADE ON UPDATE CASCADE ,
	CONSTRAINT fk_agendas_partidas FOREIGN KEY ( partida_id ) REFERENCES glitch.partidas( id ) ON DELETE SET NULL ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.chaveamentos ( 
	participante_a_id    uuid  NOT NULL  ,
	participante_b_id    uuid  NOT NULL  ,
	partida_id           uuid  NOT NULL  ,
	ordem                integer  NOT NULL  ,
	placar_a             integer    ,
	placar_b             integer    ,
	vencedor_id          uuid    ,
	criterio_desempate   text    ,
	CONSTRAINT pk_chaveamento PRIMARY KEY ( participante_a_id, participante_b_id, partida_id ),
	CONSTRAINT fk_chaveamento_participantes_a FOREIGN KEY ( participante_a_id ) REFERENCES glitch.participantes( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_chaveamento_participantes_b FOREIGN KEY ( participante_b_id ) REFERENCES glitch.participantes( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_chaveamento_partida FOREIGN KEY ( partida_id ) REFERENCES glitch.partidas( id )   ,
	CONSTRAINT fk_chaveamentos_vencedor FOREIGN KEY ( vencedor_id ) REFERENCES glitch.participantes( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.jogadores_pontuacao ( 
	estatisticas         jsonb  NOT NULL  ,
	partida_id           uuid  NOT NULL  ,
	usuario_id           uuid  NOT NULL  ,
	CONSTRAINT pk_jogador_pontuacao PRIMARY KEY ( partida_id, usuario_id ),
	CONSTRAINT fk_jogador_pontuacao_partida FOREIGN KEY ( partida_id ) REFERENCES glitch.partidas( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_jogador_pontuacao_usuario FOREIGN KEY ( usuario_id ) REFERENCES glitch.usuarios( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.juiz_partida ( 
	usuario_id           uuid  NOT NULL  ,
	partida_id           uuid  NOT NULL  ,
	CONSTRAINT pk_juiz_partida PRIMARY KEY ( usuario_id, partida_id ),
	CONSTRAINT fk_juiz_partida_usuarios FOREIGN KEY ( usuario_id ) REFERENCES glitch.usuarios( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_juiz_partida_partidas FOREIGN KEY ( partida_id ) REFERENCES glitch.partidas( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.logs_partida ( 
	id                   uuid  NOT NULL  ,
	timestamp            timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	acao_id              uuid  NOT NULL  ,
	partida_id           uuid  NOT NULL  ,
	usuario_origem_id    uuid  NOT NULL  ,
	usuario_destino_id   uuid  NOT NULL  ,
	CONSTRAINT pk_logs_partida PRIMARY KEY ( id ),
	CONSTRAINT fk_log_partida_acao_partida FOREIGN KEY ( acao_id ) REFERENCES glitch.acoes_partida( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_log_partida_partida FOREIGN KEY ( partida_id ) REFERENCES glitch.partidas( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_log_partida_usuario_origem FOREIGN KEY ( usuario_origem_id ) REFERENCES glitch.usuarios( id ) ON DELETE RESTRICT ON UPDATE CASCADE ,
	CONSTRAINT fk_log_partida_usuario_destino FOREIGN KEY ( usuario_destino_id ) REFERENCES glitch.usuarios( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

CREATE  TABLE glitch.pagamentos ( 
	id                   uuid  NOT NULL  ,
	participante_id      uuid  NOT NULL  ,
	status               varchar(20) DEFAULT 'PENDENTE' NOT NULL  ,
	gateway_transacao_id varchar(100)    ,
	valor                money  NOT NULL  ,
	moeda                varchar(3) DEFAULT 'BRL' NOT NULL  ,
	metodo_pagamento     varchar(20)    ,
	dados_retorno        jsonb    ,
	dt_criacao           timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
	dt_atualizacao       timestamptz    ,
	CONSTRAINT pk_pagamentos PRIMARY KEY ( id ),
	CONSTRAINT fk_pagamentos_participantes FOREIGN KEY ( participante_id ) REFERENCES glitch.participantes( id ) ON DELETE RESTRICT ON UPDATE CASCADE 
 );

